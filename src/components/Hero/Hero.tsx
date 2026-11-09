import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useAnimate, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
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

const SCENE_H = `${(1080 / 1220) * 100}%`;

const F_SKY = "brightness(1.12) saturate(1.25)";
const F_BUILDINGS = "brightness(1.2) saturate(1.3) contrast(1.05)";
const F_CHAR = "brightness(1.08) saturate(1.15) contrast(1.06)";

const ENTRY_ORDER = [2, 1, 3, 0, 4];
const CHAR_BASE_DELAY = 0.7;
const CHAR_STEP = 0.4;

const NAV = [
    { label: "Home", sub: "Intro and more", href: "#home" },
    { label: "About Me", sub: "The author", href: "#about" },
    { label: "My Book", sub: "The story", href: "#book" },
    { label: "Blogs", sub: "Notes and news", href: "#blogs" },
    { label: "Contact Me", sub: "Say hello", href: "#contact" },
];

const PRELOAD = [bgDark, bgLight, buildingsImg, surfaceImg, rayLeftImg, rayRightImg,  char1, char2, char3, char4, char5];

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
    const [live, setLive] = useState(false);

    const [scope, animate] = useAnimate<HTMLElement>();
    const striking = useRef(false);
    const inView = useInView(scope, { amount: 0.15 });
    const inViewRef = useRef(true);
    inViewRef.current = inView;
    const liveRef = useRef(false);

    const mx = useMotionValue(0);
    const cursorX = useMotionValue(50);
    const smx = useSpring(mx, { stiffness: 45, damping: 20, mass: 0.8 });
    const scx = useSpring(cursorX, { stiffness: 90, damping: 24 });

    const buildingsX = useTransform(smx, (v) => v * -28);
    const floorX = useTransform(smx, (v) => v * -22);
    const floorSkew = useTransform(smx, (v) => v * -3);
    const cursorLightX = useTransform(scx, (v) => `${((v - 22) / 44) * 100}%`);

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
                const rotate = rand(-4, 4);
                const scale = rand(0.94, 1.1);
                jobs.push(animate(`.ray-${s}`, { scale: [scale * 0.82, scale], rotate }, { duration: 0.14, ease: "easeOut" }));
                jobs.push(animate(`.ray-${s}`, { opacity: flicker(1) }, { duration: 0.95, times, ease: "linear" }));
                jobs.push(animate(`.flash-${s}`, { opacity: flicker(0.8) }, { duration: 0.95, times, ease: "linear" }));
            }
            jobs.push(animate(".bg-light", { opacity: flicker(1) }, { duration: 1.5, times, ease: "linear" }));
            jobs.push(animate(".surface-lit", { opacity: flicker(1) }, { duration: 1.5, times, ease: "linear" }));
            jobs.push(animate(".shake", { x: [0, -4 * p, 3 * p, -2 * p, 0], y: [0, 2 * p, -1 * p, 0, 0] }, { duration: 0.38, ease: "easeOut" }));

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
            const isLive = liveRef.current;
            timer = window.setTimeout(
                async () => {
                    if (!alive) return;
                    if (!inViewRef.current || document.hidden) return loop(); // paused while off-screen
                    const r = Math.random();
                    const side: Side = r < 0.4 ? "left" : r < 0.8 ? "right" : "both";
                    await strike(side, isLive ? rand(0.7, 1) : rand(0.85, 1));
                    if (alive && Math.random() < (isLive ? 0.45 : 0.25)) {
                        await new Promise((res) => window.setTimeout(res, rand(80, 220)));
                        await strike(side === "left" ? "right" : side === "right" ? "left" : "both", rand(0.55, 0.85));
                    }
                    if (alive) loop();
                },
                isLive ? rand(450, 1300) : rand(1600, 3800),
            );
        };
        loop();
        return () => {
            alive = false;
            window.clearTimeout(timer);
        };
    }, [introDone, reduce, strike]);

    const rectRef = useRef<DOMRect | null>(null);
    const onMove = (e: PointerEvent<HTMLElement>) => {
        if (reduce) return;
        const r = rectRef.current ?? e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        mx.set(px * 2 - 1);
        cursorX.set(px * 100);
    };
    const onEnter = (e: PointerEvent<HTMLElement>) => {
        rectRef.current = e.currentTarget.getBoundingClientRect();
        liveRef.current = true;
        setLive(true);
        if (introDone && !reduce) void strike(Math.random() < 0.5 ? "left" : "right", 0.9);
    };
    const onLeave = () => {
        rectRef.current = null;
        liveRef.current = false;
        setLive(false);
        mx.set(0);
    };

    const show = ready;
    const img = "absolute inset-0 h-full w-full";
    const skyImg = "absolute inset-0 h-full w-full object-cover object-bottom";

    return (
        <section
            ref={scope}
            id="home"
            aria-label="Hans Paladini"
            onPointerMove={onMove}
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            className={`hero relative isolate h-[max(100svh,63.54vw,680px)] w-full overflow-hidden bg-[#05030f] select-none ${live ? "is-live" : ""} ${inView ? "" : "is-paused"}`}
        >
            <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    width: "max(100%, calc(max(100svh, 680px) * 1920 / 1220))",
                    height: "max(100%, calc(100vw * 1220 / 1920))",
                }}
            >
                <div className="shake hero-layer absolute inset-0">
                    <motion.img
                        src={bgDark}
                        alt=""
                        decoding="async"
                        className={skyImg}
                        style={{ filter: F_SKY }}
                        initial="off"
                        animate={show ? "on" : "off"}
                        variants={{ off: { opacity: 0, scale: 1.1 }, on: { opacity: 1, scale: 1 } }}
                        transition={{ duration: 2, ease: EASE_OUT }}
                    />
                    <img src={bgLight} alt="" decoding="async" className={`bg-light hero-fade ${skyImg}`} style={{ opacity: 0, filter: F_SKY }} />

                    <div className="absolute inset-x-0 top-0" style={{ height: SCENE_H }}>
                        <img src={rayLeftImg} alt="" decoding="async" className={`hero-residual ${img}`} />
                        <img src={rayRightImg} alt="" decoding="async" className={`hero-residual is-right ${img}`} />
                        {(["left", "right"] as const).map((s) => (
                            <div
                                key={s}
                                className={`ray-${s} hero-fade ${img}`}
                                style={{ opacity: 0, transformOrigin: s === "left" ? "0% 0%" : "100% 0%", willChange: "opacity, transform" }}
                            >
                                <img src={s === "left" ? rayLeftImg : rayRightImg} alt="" className={img} style={{ filter: "blur(10px) brightness(2) saturate(2.2)" }} />
                                <img src={s === "left" ? rayLeftImg : rayRightImg} alt="" className={img} />
                            </div>
                        ))}

                    </div>

                    <div className="absolute inset-x-0 bottom-0" style={{ height: SCENE_H }}>
                        <motion.div className={`${img} hero-layer`} style={{ x: floorX, skewX: floorSkew, scale: 1.12, originY: 0 }}>
                            <motion.div className={img} initial="off" animate={show ? "on" : "off"} variants={{ off: { opacity: 0 }, on: { opacity: 1 } }} transition={{ delay: 0.2, duration: 1.2 }}>
                                <img src={surfaceImg} alt="" decoding="async" className={`hero-surface-base ${img}`} />
                                <img
                                    src={surfaceImg}
                                    alt=""
                                    decoding="async"
                                    className={`surface-lit hero-fade ${img}`}
                                    style={{ opacity: 0, filter: "brightness(1.55) saturate(1.2)" }}
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div className={`${img} hero-layer`} style={{ x: buildingsX, scale: 1.06 }}>
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
                        </motion.div>

                        <motion.div
                            className="pointer-events-none absolute left-0 top-[76%] h-[26%] w-[44%]"
                            style={{
                                x: cursorLightX,
                                background: "radial-gradient(closest-side, rgba(90,210,255,0.3), rgba(130,90,255,0.1) 55%, transparent)",
                                willChange: "transform, opacity",
                            }}
                            animate={{ opacity: live && !reduce ? 1 : 0 }}
                            transition={{ duration: 0.6 }}
                        />

                        {CHARACTERS.map((c, i) => {
                            const delay = reduce ? 0 : CHAR_BASE_DELAY + ENTRY_ORDER.indexOf(i) * CHAR_STEP;
                            return (
                                <div key={i} className={`${img} pointer-events-none`}>
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
                </div>
            </div>

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
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 70%, rgba(2,1,10,0.35) 100%), linear-gradient(to right, rgba(2,1,10,0.3), transparent 22%)",
                }}
            />

            <Title show={show} reduce={reduce} />
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

function Title({ show, reduce }: { show: boolean; reduce: boolean }) {
    const words = ["Hans", "Paladini"];
    let n = 0;
    return (
        <h1
            aria-label="Hans Paladini"
            className="font-heading pointer-events-none absolute left-1/2 top-[4%] z-20 flex -translate-x-1/2 items-baseline gap-[0.45em] whitespace-nowrap text-[clamp(2.2rem,4.6vw,6rem)] font-normal uppercase leading-none tracking-[0.04em] text-white"
            style={{ textShadow: "0 0 20px rgba(190,160,255,0.55), 0 0 2px rgba(255,255,255,0.8)", perspective: 600 }}
        >
            {words.map((w) => (
                <span key={w} aria-hidden className="inline-flex items-baseline">
                    {w.split("").map((ch, j) => {
                        const i = n++;
                        return (
                            <motion.span
                                key={j}
                                className="inline-block"
                                style={{ fontSize: j === 0 ? "1em" : "0.74em" }}
                                initial="off"
                                animate={show ? "on" : "off"}
                                variants={{ off: { opacity: 0, y: -40, rotateX: 90 }, on: { opacity: 1, y: 0, rotateX: 0 } }}
                                transition={{ delay: reduce ? 0 : 0.3 + i * 0.05, duration: 0.8, ease: EASE_OUT }}
                            >
                                {ch}
                            </motion.span>
                        );
                    })}
                </span>
            ))}
        </h1>
    );
}

function HeroNav({ show, reduce }: { show: boolean; reduce: boolean }) {
    const [active, setActive] = useState(0);

    const list = {
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: reduce ? 0 : 0.6 } },
    };
    const item = {
        hidden: { opacity: 0, x: -70 },
        show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 90, damping: 16 } },
    };

    return (
        <>
            <nav aria-label="Primary" className="font-body absolute left-0 top-[38%] z-30 hidden md:block">
                <motion.ul initial="hidden" animate={show ? "show" : "hidden"} variants={list} className="flex flex-col">
                    {NAV.map((n, i) => {
                        const isActive = i === active;
                        return (
                            <motion.li key={n.label} layout variants={item} className={isActive ? (i === 0 ? "mb-10" : "my-10") : "my-[0.6rem]"}>
                                <a
                                    href={n.href}
                                    onClick={() => setActive(i)}
                                    aria-current={isActive ? "page" : undefined}
                                    className="group flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                                >
                                    <motion.span
                                        layout
                                        className="relative flex shrink-0 items-center justify-end"
                                        animate={{ width: isActive ? "8rem" : "6.4rem" }}
                                        transition={{ type: "spring", stiffness: 160, damping: 22 }}
                                    >
                                        {isActive ? (
                                            <motion.span layoutId="nav-line" className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center">
                                                <motion.span
                                                    className="h-[2px] flex-1 origin-left bg-gradient-to-r from-white/10 via-white/80 to-white"
                                                    initial="off"
                                                    animate={show ? "on" : "off"}
                                                    variants={{ off: { scaleX: 0 }, on: { scaleX: 1 } }}
                                                    transition={{ delay: reduce ? 0 : 1.2, duration: 0.8, ease: EASE_OUT }}
                                                />
                                                <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_3px_rgba(140,230,255,0.85)]" />
                                            </motion.span>
                                        ) : (
                                            <span className="h-1.5 w-1.5 rounded-full bg-white/85 transition-transform duration-300 group-hover:scale-[1.8] group-hover:bg-cyan-300" />
                                        )}
                                    </motion.span>

                                    <span className={`flex flex-col ${isActive ? "pl-6" : "pl-5"}`}>
                                        <span
                                            className={`font-bold leading-tight tracking-wide text-white transition-transform duration-300 ${isActive ? "text-[clamp(1.4rem,1.9vw,2.1rem)]" : "text-[clamp(1.1rem,1.4vw,1.6rem)] text-white/85 group-hover:translate-x-1.5 group-hover:text-white"
                                                }`}
                                        >
                                            {n.label}
                                        </span>
                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.span
                                                    key="sub"
                                                    className="overflow-hidden text-[0.8rem] font-light italic leading-tight text-white/65"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {n.sub}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </span>
                                </a>
                            </motion.li>
                        );
                    })}
                </motion.ul>
            </nav>

            <nav aria-label="Primary" className="font-body absolute inset-x-0 bottom-5 z-30 md:hidden">
                <motion.ul initial="hidden" animate={show ? "show" : "hidden"} variants={list} className="flex justify-center gap-4 overflow-x-auto px-4 text-base">
                    {NAV.map((n, i) => (
                        <motion.li key={n.label} variants={item} className="shrink-0">
                            <a href={n.href} onClick={() => setActive(i)} className={`relative block py-1 font-bold ${i === active ? "text-white" : "text-white/70"}`}>
                                {n.label}
                                {i === active && (
                                    <motion.span layoutId="nav-line-mobile" className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-white shadow-[0_0_8px_rgba(140,230,255,0.9)]" />
                                )}
                            </a>
                        </motion.li>
                    ))}
                </motion.ul>
            </nav>
        </>
    );
}

function EditionBadge({ show, reduce }: { show: boolean; reduce: boolean }) {
    return (
        <motion.a
            href="#book"
            aria-label="Special edition hardcover"
            className="group absolute right-[5%] top-[13%] z-30 grid aspect-square w-[clamp(96px,9.6vw,175px)] place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 md:bottom-[12%] md:right-[6.5%] md:top-auto"
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