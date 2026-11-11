import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
    motion,
    useInView,
    useReducedMotion,
    useScroll,
    useTransform,
    type MotionValue,
} from "framer-motion";
import "./world.css";

import worldBg from "/images/world/World-BG.png";
import daywalkerLogo from "/images/world/Daywalker.png";
import willyLogo from "/images/world/Willy-John-White.png";
import { idlePreload } from "@/utils/idlePreload";

const TITLE = "Explore The World Of Hans Paladini";
const TYPE_SPEED = 55;

export default function ExploreWorld() {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion() ?? false;
    const start = useInView(ref, { once: true, amount: 0.45 });
    const onScreen = useInView(ref, { amount: 0 });

    const [typed, setTyped] = useState(0);
    const [stage, setStage] = useState<"idle" | "typing" | "lines" | "lit">("idle");

    useEffect(() => {
        if (!start) return;
        if (reduce) {
            setTyped(TITLE.length);
            setStage("lit");
            return;
        }
        setStage("typing");
        let i = 0;
        const timers: number[] = [];
        const id = window.setInterval(() => {
            i += 1;
            setTyped(i);
            if (i >= TITLE.length) {
                window.clearInterval(id);
                timers.push(window.setTimeout(() => setStage("lines"), 350));
                timers.push(window.setTimeout(() => setStage("lit"), 350 + 1700));
            }
        }, TYPE_SPEED);
        return () => {
            window.clearInterval(id);
            timers.forEach((t) => window.clearTimeout(t));
        };
    }, [start, reduce]);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

    const lineProgress = useTransform(
        scrollYProgress,
        [0.2, 0.65],
        [0, 1]
    );

    const lineOpacity = useTransform(
        lineProgress,
        [0, 0.02],
        [0, 1]
    );

    const arrowOpacity = useTransform(
        lineProgress,
        [0.92, 1],
        [0, 1]
    );

    const lit = stage === "lit";

    useEffect(() => idlePreload([worldBg, daywalkerLogo, willyLogo]), []);

    return (
        <section
            ref={ref}
            id="world"
            aria-label="Explore the world of Hans Paladini"
            className={`world relative isolate h-[max(360px,29.5vw)] overflow-hidden bg-black ${lit ? "is-lit" : ""} ${onScreen ? "" : "is-paused"}`}
        >
            <motion.div aria-hidden className="absolute -inset-y-[10%] inset-x-0 will-change-transform" style={{ y: reduce ? 0 : bgY }}>
                <img src={worldBg} alt="" decoding="async" loading="lazy" className="h-full w-full object-cover" />
            </motion.div>
            <div
                aria-hidden
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.6)), radial-gradient(ellipse 70% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
                }}
            />
            <div aria-hidden className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black via-black/70 to-transparent" />

            <h2
                aria-label={TITLE}
                className="font-heading absolute left-1/2 top-[32%] z-10 flex w-max max-w-[94vw] -translate-x-1/2 -translate-y-1/2 items-baseline justify-center gap-x-[0.35em] whitespace-nowrap text-[clamp(1.5rem,3.6vw,3.8rem)] font-normal uppercase leading-none tracking-[0.04em] text-white"
                style={{ textShadow: "0 0 18px rgba(255,255,255,0.25)" }}
            >
                <TypedTitle typed={typed} showCaret={stage === "typing" || (stage === "idle" && !reduce)} />
            </h2>

            <div aria-hidden className="pointer-events-none absolute inset-0 z-10">

                <motion.span
                    className="absolute left-1/2 top-[44%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.7)]"
                    style={{
                        scale: lineProgress,
                        opacity: lineOpacity,
                    }}
                />

                <motion.span
                    className="absolute left-1/2 top-[44%] h-[16.7%] w-[1.5px] -translate-x-1/2 origin-top bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    style={{
                        scaleY: lineProgress,
                        opacity: lineOpacity,
                    }}
                />

                <motion.span
                    className="absolute left-[26%] right-1/2 top-[60.7%] h-[1.5px] origin-right bg-gradient-to-l from-white to-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    style={{
                        scaleX: lineProgress,
                        opacity: lineOpacity,
                    }}
                />

                <motion.span
                    className="absolute left-1/2 right-[26%] top-[60.7%] h-[1.5px] origin-left bg-gradient-to-r from-white to-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    style={{
                        scaleX: lineProgress,
                        opacity: lineOpacity,
                    }}
                />

                <Arrow side="left" opacity={arrowOpacity} />
                <Arrow side="right" opacity={arrowOpacity} />

            </div>

            <Logo
                href="#daywalker"
                src={daywalkerLogo}
                alt="Daywalker: Vampire Princess"
                className="left-[19%]"
                glow="rgba(255,60,40,0.55)"
                lit={lit}
            />
            <Logo
                href="#willy-jones"
                src={willyLogo}
                alt="Willy Jones: Paranormal Reporter"
                className="left-[80.5%]"
                glow="rgba(255,190,110,0.5)"
                lit={lit}
            />
        </section>
    );
}

function TypedTitle({ typed, showCaret }: { typed: number; showCaret: boolean }) {
    const words = TITLE.split(" ");
    let g = 0;
    const caret = showCaret ? <span key="caret" className="world-caret ml-[0.04em] inline-block h-[0.85em] w-[2px] self-center bg-white" /> : null;

    return (
        <>
            {typed === 0 && caret}
            {words.map((w, wi) => {
                const wordStart = g;
                g += w.length + 1;
                return (
                    <span key={wi} aria-hidden className="inline-flex items-baseline">
                        {w.split("").map((ch, j) => {
                            const idx = wordStart + j;
                            return (
                                <span key={j} className="inline-flex items-baseline">
                                    <span style={{ fontSize: j === 0 ? "1em" : "0.76em", opacity: idx < typed ? 1 : 0 } as CSSProperties}>{ch}</span>
                                    {idx === typed - 1 && caret}
                                </span>
                            );
                        })}
                    </span>
                );
            })}
        </>
    );
}

function Arrow({
    side,
    opacity,
}: {
    side: "left" | "right";
    opacity: MotionValue<number>;
}) {
    return (
        <motion.span
            className={`absolute top-[60.7%] h-2.5 w-2.5 -translate-y-1/2 border-white/90 ${side === "left"
                    ? "left-[26%] rotate-45 border-b-[1.5px] border-l-[1.5px]"
                    : "right-[26%] -rotate-45 border-b-[1.5px] border-r-[1.5px]"
                }`}
            style={{ opacity }}
        />
    );
}

function Logo({ href, src, alt, className, glow, lit }: { href: string; src: string; alt: string; className: string; glow: string; lit: boolean }) {
    return (
        <a
            href={href}
            aria-label={alt}
            className={`group absolute top-[60%] z-10 w-[clamp(110px,13vw,250px)] -translate-x-1/2 -translate-y-1/2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${className}`}
        >
            <span aria-hidden className="world-glow absolute -inset-[25%] rounded-full" style={{ background: `radial-gradient(closest-side, ${glow}, transparent 70%)` }} />
            <motion.span
                aria-hidden
                className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"
                initial="off"
                animate={lit ? "on" : "off"}
                variants={{ off: { opacity: 0, scale: 0.4 }, on: { opacity: [0, 0.9, 0], scale: [0.4, 1.4, 1.8] } }}
                transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <img
                src={src}
                alt=""
                decoding="async"
                loading="lazy"
                className="world-logo relative w-full transition-transform duration-300 group-hover:scale-105"
            />
        </a>
    );
}