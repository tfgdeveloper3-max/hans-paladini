import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, useInView, useReducedMotion } from "framer-motion";
import HeroNav from "./HeroNav";
import "./hero.css";

import bgDark from "/images/Hero/banner-bg-dark.png";
import bgLight from "/images/Hero/Banner-bg-light.png";
import buildingsImg from "/images/Hero/banner-buildings.png";
import surfaceImg from "/images/Hero/Light-Surface-layer.png";
import rayLeftImg from "/images/Hero/lightning-rays-left.png";
import rayRightImg from "/images/Hero/lightning-rays-right.png";
import char1 from "/images/Hero/character-1.png";
import char2 from "/images/Hero/character-2.png";
import char3 from "/images/Hero/character-3.png";
import char4 from "/images/Hero/character-4.png";
import char5 from "/images/Hero/character-5.png";

type Side = "left" | "right" | "both";

const CHARACTERS: { src: string; foot: [number, number] }[] = [
    { src: char1, foot: [30.2, 88.5] },
    { src: char2, foot: [39.2, 90.5] },
    { src: char3, foot: [50.2, 96.5] },
    { src: char4, foot: [60.6, 92] },
    { src: char5, foot: [69.8, 89] },
];

/*
 * Single-screen layout:
 * - Section is exactly one screen tall.
 * - Sky covers the whole section.
 * - Rays are pinned to the top, the city/floor to the bottom (full width).
 * - Characters sit in their own box that is never taller than the screen,
 *   so they are always fully visible (no more cut-off at the bottom).
 */
const SECTION_H = "max(100svh, 600px)";
const STAGE_W = `max(100vw, calc(${SECTION_H} * 1920 / 1220))`;
const STAGE_H = `calc(${STAGE_W} * 1080 / 1920)`;
const CHAR_H = `min(${SECTION_H}, ${STAGE_H})`;
const CHAR_W = `calc(${CHAR_H} * 1920 / 1080)`;

const F_SKY = "brightness(0.72) saturate(1.1) contrast(1.08)";
const F_BUILDINGS = "brightness(0.82) saturate(1.15) contrast(1.08)";
const F_FLOOR = "brightness(0.75) saturate(1.1)";
const F_CHAR = "brightness(1.16) saturate(1.2) contrast(1.05)";

const ENTRY_ORDER = [2, 1, 3, 0, 4];
const CHAR_BASE_DELAY = 0.7;
const CHAR_STEP = 0.4;

const PRELOAD = [bgDark, bgLight, buildingsImg, surfaceImg, rayLeftImg, rayRightImg, char1, char2, char3, char4, char5];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function usePreload(srcs: string[]) {
    const [loaded, setLoaded] = useState(0);
    useEffect(() => {
        let alive = true;
        srcs.forEach((src) => {
            const img = new Image();
            img.src = src;
            img
                .decode()
                .catch(() => undefined)
                .finally(() => alive && setLoaded((n) => n + 1));
        });
        return () => {
            alive = false;
        };
    }, [srcs]);
    return { progress: Math.min(1, loaded / srcs.length), ready: loaded >= srcs.length };
}

export default function Hero() {
    const reduce = useReducedMotion() ?? false;
    const { ready, progress } = usePreload(PRELOAD);
    const [introDone, setIntroDone] = useState(false);

    const [scope, animate] = useAnimate<HTMLElement>();
    const striking = useRef(false);
    const inView = useInView(scope, { amount: 0.15 });
    const inViewRef = useRef(true);
    inViewRef.current = inView;

    // Lightning = only light flicker (rays, flashes, sky, floor glow). No shake, no movement.
    const strike = useCallback(
        async (side: Side, power = 1) => {
            if (striking.current || !scope.current) return;
            striking.current = true;
            const p = power;
            const times = [0, 0.05, 0.13, 0.2, 0.32, 0.48, 1];
            const flicker = (peak: number) => [0, peak * p, 0.12 * peak * p, 0.95 * peak * p, 0.3 * peak * p, 0.75 * peak * p, 0];
            const sides: Array<"left" | "right"> = side === "both" ? ["left", "right"] : [side];
            const jobs: Array<{ then: (done: () => void) => unknown }> = [];

            for (const s of sides) {
                jobs.push(animate(`.ray-${s}`, { opacity: flicker(1) }, { duration: 0.95, times, ease: "linear" }));
                jobs.push(animate(`.flash-${s}`, { opacity: flicker(0.8) }, { duration: 0.95, times, ease: "linear" }));
            }
            jobs.push(animate(".bg-light", { opacity: flicker(1) }, { duration: 1.5, times, ease: "linear" }));
            jobs.push(animate(".surface-lit", { opacity: flicker(1) }, { duration: 1.5, times, ease: "linear" }));

            await Promise.all(jobs.map((j) => new Promise<void>((done) => void j.then(done))));
            striking.current = false;
        },
        [animate, scope],
    );

    useEffect(() => {
        if (!ready) return;
        if (reduce) {
            setIntroDone(true);
            return;
        }
        const first = window.setTimeout(() => void strike("both", 1), (CHAR_BASE_DELAY + 0.35) * 1000);
        const done = window.setTimeout(() => setIntroDone(true), (CHAR_BASE_DELAY + 1.4) * 1000);
        return () => {
            window.clearTimeout(first);
            window.clearTimeout(done);
        };
    }, [ready, reduce, strike]);

    useEffect(() => {
        if (!introDone || reduce) return;
        let alive = true;
        let timer = 0;
        const loop = () => {
            timer = window.setTimeout(async () => {
                if (!alive) return;
                if (!inViewRef.current || document.hidden) return loop();
                const r = Math.random();
                const side: Side = r < 0.4 ? "left" : r < 0.8 ? "right" : "both";
                await strike(side, rand(0.8, 1));
                if (alive && Math.random() < 0.3) {
                    await new Promise((res) => window.setTimeout(res, rand(80, 220)));
                    await strike(side === "left" ? "right" : side === "right" ? "left" : "both", rand(0.55, 0.85));
                }
                if (alive) loop();
            }, rand(1200, 3400));
        };
        loop();
        return () => {
            alive = false;
            window.clearTimeout(timer);
        };
    }, [introDone, reduce, strike]);

    const show = ready;
    const img = "absolute inset-0 h-full w-full";
    const stage = { width: STAGE_W, height: STAGE_H };

    return (
        <section
            ref={scope}
            id="home"
            aria-label="Hans Paladini"
            className={`hero relative isolate block h-[100svh] min-h-[600px] w-full overflow-hidden bg-[#05030f] select-none ${inView ? "" : "is-paused"}`}
        >
            {/* Sky */}
            <div aria-hidden className="absolute inset-0">
                <motion.img
                    src={bgDark}
                    alt=""
                    decoding="async"
                    className={`${img} object-cover object-bottom`}
                    style={{ filter: F_SKY }}
                    initial="off"
                    animate={show ? "on" : "off"}
                    variants={{ off: { opacity: 0, scale: 1.1 }, on: { opacity: 1, scale: 1 } }}
                    transition={{ duration: 2, ease: EASE_OUT }}
                />
                <img
                    src={bgLight}
                    alt=""
                    decoding="async"
                    className={`bg-light hero-fade ${img} object-cover object-bottom`}
                    style={{ opacity: 0, filter: F_SKY }}
                />
            </div>

            {/* Lightning rays – pinned to top */}
            <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2" style={stage}>
                <img src={rayLeftImg} alt="" decoding="async" className={`hero-residual ${img}`} />
                <img src={rayRightImg} alt="" decoding="async" className={`hero-residual is-right ${img}`} />
                {(["left", "right"] as const).map((s) => (
                    <div key={s} className={`ray-${s} hero-fade ${img}`} style={{ opacity: 0 }}>
                        <img
                            src={s === "left" ? rayLeftImg : rayRightImg}
                            alt=""
                            className={img}
                            style={{ filter: "blur(10px) brightness(2) saturate(2.2)" }}
                        />
                        <img src={s === "left" ? rayLeftImg : rayRightImg} alt="" className={img} />
                    </div>
                ))}
            </div>

            {/* Floor + city – pinned to bottom, full width */}
            <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2" style={stage}>
                <div className={img} style={{ transform: "scale(1.12)", transformOrigin: "50% 0%" }}>
                    <motion.div
                        className={img}
                        initial="off"
                        animate={show ? "on" : "off"}
                        variants={{ off: { opacity: 0 }, on: { opacity: 1 } }}
                        transition={{ delay: 0.2, duration: 1.2 }}
                    >
                        <img src={surfaceImg} alt="" decoding="async" className={`hero-surface-base ${img}`} style={{ filter: F_FLOOR }} />
                        <img
                            src={surfaceImg}
                            alt=""
                            decoding="async"
                            className={`surface-lit hero-fade ${img}`}
                            style={{ opacity: 0, filter: "brightness(1.55) saturate(1.2)" }}
                        />
                    </motion.div>
                </div>

                <div className={img} style={{ transform: "scale(1.06)" }}>
                    <motion.img
                        src={buildingsImg}
                        alt=""
                        decoding="async"
                        className={img}
                        style={{ filter: F_BUILDINGS }}
                        initial="off"
                        animate={show ? "on" : "off"}
                        variants={{ off: { opacity: 0, y: 70 }, on: { opacity: 1, y: 0 } }}
                        transition={{ delay: 0.25, duration: 1.5, ease: EASE_OUT }}
                    />
                </div>
            </div>

            {/* Night tint – darkens sky top and floor, sits UNDER the characters */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(4,2,18,0.55) 0%, rgba(4,2,18,0.15) 30%, transparent 50%, rgba(4,2,18,0.25) 75%, rgba(3,2,14,0.6) 100%)",
                }}
            />

            {/* Characters – box never taller than the screen */}
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{ width: CHAR_W, height: CHAR_H }}
            >
                {CHARACTERS.map((c, i) => {
                    const delay = reduce ? 0 : CHAR_BASE_DELAY + ENTRY_ORDER.indexOf(i) * CHAR_STEP;
                    return (
                        <div key={i} className={img}>
                            {i === 2 && (
                                <div
                                    className="absolute h-[4%] w-[13%] -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${c.foot[0]}%`, top: `${c.foot[1]}%` }}
                                >
                                    <motion.span
                                        className="absolute inset-0 rounded-[50%] border-2 border-cyan-300/80 shadow-[0_0_24px_rgba(80,230,255,0.8)]"
                                        initial="off"
                                        animate={show && !reduce ? "on" : "off"}
                                        variants={{ off: { opacity: 0, scale: 0.2 }, on: { opacity: [0, 0.95, 0], scale: [0.2, 1.7, 2.3] } }}
                                        transition={{ delay: delay + 0.3, duration: 1.2, ease: "easeOut" }}
                                    />
                                    <motion.span
                                        className="absolute inset-0 rounded-[50%] bg-[radial-gradient(closest-side,rgba(80,200,255,0.5),rgba(120,90,255,0.18)_60%,transparent)]"
                                        initial="off"
                                        animate={show ? "on" : "off"}
                                        variants={{ off: { opacity: 0 }, on: { opacity: 1 } }}
                                        transition={{ delay: delay + 0.4, duration: 1 }}
                                    />
                                </div>
                            )}
                            <motion.img
                                src={c.src}
                                alt=""
                                decoding="async"
                                draggable={false}
                                className={img}
                                style={{ filter: F_CHAR, zIndex: i === 2 ? 2 : 1 }}
                                initial="off"
                                animate={show ? "on" : "off"}
                                variants={{ off: { opacity: 0 }, on: { opacity: 1 } }}
                                transition={{ delay, duration: 1, ease: "easeInOut" }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Lightning flashes */}
            <div
                aria-hidden
                className="flash-left hero-fade pointer-events-none absolute inset-0"
                style={{ opacity: 0, background: "radial-gradient(ellipse 60% 70% at 8% 0%, rgba(210,240,255,0.55), rgba(120,170,255,0.18) 45%, transparent 75%)" }}
            />
            <div
                aria-hidden
                className="flash-right hero-fade pointer-events-none absolute inset-0"
                style={{ opacity: 0, background: "radial-gradient(ellipse 60% 70% at 92% 0%, rgba(210,240,255,0.55), rgba(120,170,255,0.18) 45%, transparent 75%)" }}
            />

            <HeroNav show={show} reduce={reduce} />
            <EditionBadge show={show} reduce={reduce} />

            <AnimatePresence>
                {!ready && (
                    <motion.div
                        key="loader"
                        className="absolute inset-0 z-50 grid place-items-center bg-[#05030f]"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="font-body flex flex-col items-center gap-4 text-white/80">
                            <svg viewBox="0 0 24 24" className="hero-loader-bolt h-10 w-10" fill="#9fe6ff">
                                <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                            </svg>
                            <div className="h-px w-40 overflow-hidden bg-white/10">
                                <motion.div className="h-full origin-left bg-cyan-300" animate={{ scaleX: progress }} initial={{ scaleX: 0 }} />
                            </div>
                            <span className="text-xs tracking-[0.3em]">Loading {Math.round(progress * 100)}%</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

function EditionBadge({ show, reduce }: { show: boolean; reduce: boolean }) {
    return (
        <motion.a
            href="#book"
            aria-label="Special edition hardcover"
            className="group absolute right-[5%] top-[14%] z-30 grid aspect-square w-[clamp(96px,9.6vw,175px)] place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:bottom-[8%] md:right-[6.5%] md:top-auto"
            initial="off"
            animate={show ? "on" : "off"}
            variants={{ off: { opacity: 0, scale: 0.3, rotate: -140 }, on: { opacity: 1, scale: 1, rotate: 0 } }}
            transition={{ delay: reduce ? 0 : 2.4, type: "spring", stiffness: 70, damping: 13 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
        >
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(40,20,90,0.6),rgba(5,3,15,0.35)_70%)]" />
            <span className="hero-pulse absolute inset-0 rounded-full shadow-[0_0_40px_8px_rgba(170,110,255,0.4),inset_0_0_26px_rgba(90,220,255,0.3)]" />

            <svg viewBox="0 0 100 100" className="hero-spin-rev absolute -inset-[9%] h-[118%] w-[118%] opacity-30">
                <circle cx="50" cy="50" r="48" fill="none" stroke="#bfe9ff" strokeWidth="0.5" strokeDasharray="1.5 3.5" />
            </svg>
            <svg viewBox="0 0 100 100" className="hero-spin absolute inset-0 h-full w-full overflow-visible">
                <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="1.1" />
                <circle cx="31.2" cy="5.8" r="2.6" fill="white" />
                <circle cx="68.8" cy="94.2" r="2.6" fill="white" />
            </svg>
            <span className="hero-sweep hero-spin-fast absolute inset-0 rounded-full opacity-70" />

            <span className="font-body relative flex flex-col items-center text-center text-[clamp(0.62rem,0.8vw,0.95rem)] font-bold leading-[1.4] tracking-[0.18em] text-white">
                <span>SPECIAL</span>
                <span>EDITION</span>
                <span>HARDCOVER</span>
                <svg viewBox="0 0 24 12" className="mt-1.5 h-[0.8em] w-[1.6em] transition-transform duration-300 group-hover:translate-x-1.5" fill="white">
                    <path d="M2 1 22 6 2 11 6 6Z" />
                </svg>
            </span>
        </motion.a>
    );
}