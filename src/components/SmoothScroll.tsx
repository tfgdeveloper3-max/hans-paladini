import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const lenis = new Lenis({
            lerp: 0.085, 
            smoothWheel: true,
            wheelMultiplier: 1,
            anchors: true, 
        });

        let id = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            id = requestAnimationFrame(raf);
        };
        id = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(id);
            lenis.destroy();
        };
    }, []);

    return null;
}