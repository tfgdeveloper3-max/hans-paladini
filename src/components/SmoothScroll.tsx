import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export const NAV_OFFSET = 80;

type GuardData = { deltaX: number; deltaY: number; event: WheelEvent | TouchEvent };
type Guard = (data: GuardData) => boolean;

let instance: Lenis | null = null;
const guards = new Set<Guard>();
const subscribers = new Set<() => void>();
const emit = () => subscribers.forEach((fn) => fn());

export const getLenis = () => instance;

export function addScrollGuard(fn: Guard) {
    guards.add(fn);
    return () => {
        guards.delete(fn);
    };
}

export function useLenis() {
    return useSyncExternalStore(
        (cb) => {
            subscribers.add(cb);
            return () => {
                subscribers.delete(cb);
            };
        },
        getLenis,
        () => null,
    );
}

export default function SmoothScroll({ children }: { children?: ReactNode }) {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const lenis = new Lenis({
            autoRaf: true,
            lerp: 0.065,
            smoothWheel: true,
            wheelMultiplier: 0.9,
            syncTouch: false,
            anchors: { offset: -NAV_OFFSET },
            stopInertiaOnNavigate: true,
            virtualScroll: (data) => {
                for (const guard of guards) if (guard(data as GuardData) === false) return false;
                return true;
            },
        });

        instance = lenis;
        emit();

        const resize = () => lenis.resize();
        window.addEventListener("load", resize);
        document.fonts?.ready.then(resize);

        return () => {
            window.removeEventListener("load", resize);
            lenis.destroy();
            instance = null;
            emit();
        };
    }, []);

    return <>{children}</>;
}