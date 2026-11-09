import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
    AnimatePresence,
    motion,
    MotionValue,
    useInView,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
import "./books.css";

import genesisCover from "/images/books/DayWalker-Vampire.png";
import genesisBg from "/images/books/DayWalker-Vampire-Bg.jpg";
import confessionsCover from "/images/books/VampirePrincess.png";
import confessionsBg from "/images/books/VampirePrincess-Bg.png";
import oneWayCover from "/images/books/OneWay.png";
import oneWayBg from "/images/books/OneWay-Bg.png";
import purgatoryCover from "/images/books/VampirePrincess2.png";
import purgatoryBg from "/images/books/VampirePrincess2-Bg.png";
import willyCover from "/images/books/Willy-Jones.png";
import willyBg from "/images/books/Willy-Jones-Bg.png";
import inquisitorCover from "/images/books/The-Inquisitor.png";
import inquisitorBg from "/images/books/The-Inquisitor-Bg.png";
import paradiseCover from "/images/books/Paradise.png";
import paradiseBg from "/images/books/Paradise-Bg.jpg";

type Theme = "fireflies" | "candles" | "embers" | "dust" | "redmist" | "sparkle";

type Book = {
    title: string;
    subtitle: string;
    line: string;
    cover: string;
    bg: string;
    accent: string;
    theme: Theme;
    desc: string;
    links: { ebook: string; paperback: string; hardcover: string };
};

const DESC =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London";
const LINKS = { ebook: "#", paperback: "#", hardcover: "#" };

const BOOKS: Book[] = [
    { title: "Daywalker", subtitle: "Vampire Princess", line: "Book 1: Genesis", cover: genesisCover, bg: genesisBg, accent: "#c9c25a", theme: "fireflies", desc: DESC, links: LINKS },
    { title: "Daywalker", subtitle: "Vampire Princess", line: "Book 2: Confessions of a Sinner", cover: confessionsCover, bg: confessionsBg, accent: "#e0473b", theme: "candles", desc: DESC, links: LINKS },
    { title: "Daywalker", subtitle: "Vampire Princess", line: "Book 3: One Way Ticket to Hell", cover: oneWayCover, bg: oneWayBg, accent: "#f0b545", theme: "embers", desc: DESC, links: LINKS },
    { title: "Daywalker", subtitle: "Vampire Princess", line: "Book 4: Purgatory", cover: purgatoryCover, bg: purgatoryBg, accent: "#e0473b", theme: "dust", desc: DESC, links: LINKS },
    { title: "Willy Jones", subtitle: "Paranormal Reporter", line: "Book 1: Willy Jones", cover: willyCover, bg: willyBg, accent: "#ff8a3d", theme: "embers", desc: DESC, links: LINKS },
    { title: "Willy Jones", subtitle: "Paranormal Reporter", line: "Book 2: The Inquisitor", cover: inquisitorCover, bg: inquisitorBg, accent: "#e5383b", theme: "redmist", desc: DESC, links: LINKS },
    { title: "Willy Jones", subtitle: "Paranormal Reporter", line: "Book 3: Terror in Paradise", cover: paradiseCover, bg: paradiseBg, accent: "#38d3d8", theme: "sparkle", desc: DESC, links: LINKS },
];

const N = BOOKS.length;
const PER_BOOK = 90;
const EXIT = 70;
const BOOKS_SPAN = (N - 1) * PER_BOOK;

type ThemeCfg = {
    count: number;
    anim: "bk-rise" | "bk-drift" | "bk-wander" | "bk-float";
    place: "bottom" | "left" | "anywhere";
    bg: string;
    size: [number, number];
    dur: [number, number];
    pulse: [number, number] | null;
};

const glow = (core: string, mid: string, edge: string) =>
    `radial-gradient(circle, ${core} 0%, ${mid} 30%, ${edge} 55%, transparent 70%)`;

const THEMES: Record<Theme, ThemeCfg> = {
    fireflies: { count: 14, anim: "bk-wander", place: "anywhere", bg: glow("#fbffd0", "#d8f05a", "rgba(150,200,40,0.35)"), size: [10, 20], dur: [7, 13], pulse: [1.4, 3.2] },
    candles: { count: 16, anim: "bk-float", place: "anywhere", bg: glow("#fff3cf", "#ffc864", "rgba(230,150,40,0.3)"), size: [6, 12], dur: [9, 16], pulse: [2, 4] },
    embers: { count: 16, anim: "bk-rise", place: "bottom", bg: glow("#fff2c0", "#ffb03a", "rgba(255,70,0,0.45)"), size: [10, 22], dur: [4.5, 8], pulse: [0.5, 1] },
    dust: { count: 16, anim: "bk-drift", place: "left", bg: glow("#fff1d6", "#f2c27a", "rgba(210,150,70,0.3)"), size: [5, 11], dur: [9, 15], pulse: null },
    redmist: { count: 12, anim: "bk-float", place: "anywhere", bg: glow("#ffd3d3", "#ff4a4a", "rgba(200,0,0,0.35)"), size: [12, 26], dur: [10, 18], pulse: [2.5, 5] },
    sparkle: { count: 16, anim: "bk-float", place: "anywhere", bg: glow("#ffffff", "#d8fbff", "rgba(120,230,255,0.35)"), size: [6, 14], dur: [8, 14], pulse: [0.9, 2.2] },
};

function seeded(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function Particles({ theme, seed }: { theme: Theme; seed: number }) {
    const cfg = THEMES[theme];
    const items = useMemo(() => {
        const r = seeded(seed + 11);
        const between = ([a, b]: [number, number]) => a + r() * (b - a);
        return Array.from({ length: cfg.count }, () => {
            const pos =
                cfg.place === "bottom"
                    ? { left: `${r() * 100}%`, bottom: "-3%" }
                    : cfg.place === "left"
                        ? { left: `${-5 + r() * 35}%`, top: `${15 + r() * 80}%` }
                        : { left: `${r() * 100}%`, top: `${10 + r() * 85}%` };
            const size = between(cfg.size);
            const d = between(cfg.dur);
            return {
                ...pos,
                width: size,
                height: size,
                "--anim": cfg.anim,
                "--d": `${d}s`,
                "--delay": `${-r() * d}s`,
                "--dx": `${(r() - 0.5) * 140}px`,
                "--dy": `${(r() - 0.5) * 120}px`,
                "--pd": cfg.pulse ? `${between(cfg.pulse)}s` : "0s",
                "--bg": cfg.bg,
            } as unknown as CSSProperties;
        });
    }, [cfg, seed]);

    return (
        <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            {items.map((style, i) => (
                <span key={i} className={`bk-p ${cfg.pulse ? "" : "no-pulse"}`} style={style}>
                    <i />
                </span>
            ))}
        </motion.div>
    );
}

export default function BooksShowcase() {
    const ref = useRef<HTMLElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion() ?? false;
    const onScreen = useInView(stickyRef, { amount: 0.1 });

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const progress = scrollYProgress;
    const pos = useTransform(progress, (v) => Math.min(1, (v * (BOOKS_SPAN + EXIT)) / BOOKS_SPAN) * (N - 1));
    const exit = useTransform(progress, (v) => Math.max(0, Math.min(1, (v * (BOOKS_SPAN + EXIT) - BOOKS_SPAN) / EXIT)));
    const exitY = useTransform(exit, [0, 1], ["0svh", "-12svh"]);
    const exitScale = useTransform(exit, [0, 1], [1, 0.94]);
    const exitOpacity = useTransform(exit, [0, 0.9], [1, 0]);
    const fadeOpacity = useTransform(exit, [0, 1], [0, 1]);

    const [active, setActive] = useState(0);
    const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1]));
    useMotionValueEvent(pos, "change", (v) => {
        const a = Math.min(N - 1, Math.max(0, Math.round(v)));
        setActive((prev) => (prev === a ? prev : a)); 
        setLoaded((prev) => {
            if ([a - 1, a, a + 1].every((n) => n < 0 || n >= N || prev.has(n))) return prev;
            const next = new Set(prev);
            [a - 1, a, a + 1].forEach((n) => n >= 0 && n < N && next.add(n));
            return next;
        });
    });

    useEffect(() => {
        let cancelled = false;
        const srcs = BOOKS.flatMap((b) => [b.bg, b.cover]);
        const idle = (cb: () => void) => {
            if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 1500 });
            else setTimeout(cb, 200);
        };
        const next = (k: number) => {
            if (cancelled || k >= srcs.length) return;
            idle(() => {
                const src = srcs[k];
                if (!src) return;
                const img = new Image();
                img.src = src;
                img.decode().catch(() => undefined).finally(() => next(k + 1));
            });
        };
        next(0);
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section
            ref={ref}
            id="book"
            aria-label="Books by Hans Paladini"
            className="bk-section relative bg-black"
            style={{ height: `calc(100svh + ${BOOKS_SPAN + EXIT}svh)` }}
        >
            <div ref={stickyRef} className={`sticky top-0 h-[100svh] overflow-hidden ${onScreen ? "" : "bk-paused"}`}>
                {BOOKS.map((b, i) => (loaded.has(i) ? <Background key={i} src={b.bg} i={i} pos={pos} /> : null))}

                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0.35), rgba(0,0,0,0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 30%, transparent 70%, rgba(0,0,0,0.55))",
                    }}
                />

                {!reduce && (
                    <AnimatePresence>
                        <Particles key={active} theme={BOOKS[active]?.theme ?? "embers"} seed={active} />
                    </AnimatePresence>
                )}

                <motion.div
                    className="absolute inset-0 flex items-center justify-center px-[4vw] py-[8svh] will-change-transform"
                    style={{ y: exitY, scale: exitScale, opacity: exitOpacity }}
                >
                    <div className="relative w-full max-w-[1180px]">
                        <div
                            aria-hidden
                            className="absolute inset-0 rounded-[28px] border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02)_45%,rgba(0,0,0,0.25))] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)]"
                        />
                        <div className="relative grid">
                            {BOOKS.map((b, i) => (
                                <Slide key={i} book={b} i={i} pos={pos} isActive={i === active} load={loaded.has(i)} />
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#000_0%,#000_18%,rgba(0,0,0,0.55)_50%,transparent_80%)]"
                    style={{ opacity: fadeOpacity }}
                />
            </div>
        </section>
    );
}

function Background({ src, i, pos }: { src: string; i: number; pos: MotionValue<number> }) {
    const x = useTransform(pos, (v) => `${(i - v) * 100}%`);
    const innerX = useTransform(pos, (v) => `${(v - i) * 18}%`);
    const visibility = useTransform(pos, (v) => (Math.abs(i - v) < 1.02 ? "visible" : "hidden"));

    return (
        <motion.div aria-hidden className="absolute inset-0 overflow-hidden" style={{ x, visibility }}>
            <motion.img
                src={src}
                alt=""
                decoding="async"
                className="absolute inset-y-0 left-[-12%] h-full w-[124%] max-w-none object-cover"
                style={{ x: innerX }}
            />
            <div className="absolute inset-y-0 left-0 w-[14%] bg-gradient-to-r from-black/70 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-[14%] bg-gradient-to-l from-black/70 to-transparent" />
        </motion.div>
    );
}

function Slide({ book, i, pos, isActive, load }: { book: Book; i: number; pos: MotionValue<number>; isActive: boolean; load: boolean }) {

    const opacity = useTransform(pos, [i - 0.5, i - 0.2, i + 0.2, i + 0.5], [0, 1, 1, 0]);
    const visibility = useTransform(opacity, (o) => (o > 0.001 ? "visible" : "hidden"));
    const textScale = useTransform(pos, [i - 0.5, i, i + 0.5], [0.97, 1, 0.97]);
    const coverScale = useTransform(pos, [i - 0.5, i, i + 0.5], [0.92, 1, 0.92]);
    const coverRotY = useTransform(pos, [i - 0.5, i, i + 0.5], [-10, 0, 10]);

    return (
        <motion.article
            className="relative grid items-center gap-8 px-8 py-10 [grid-area:1/1] md:grid-cols-[1.25fr_1fr] md:py-12 lg:px-16"
            style={{ opacity, visibility }}
            aria-hidden={!isActive}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -right-[10%] -top-[20%] h-[140%] w-[60%]"
                style={{ background: `radial-gradient(closest-side, ${book.accent}33, transparent)` }}
            />
            <span aria-hidden className="bk-number font-heading pointer-events-none absolute -left-2 -top-6 select-none text-[clamp(8rem,16vw,15rem)] leading-none">
                {String(i + 1).padStart(2, "0")}
            </span>

            <motion.div className="relative order-2 origin-left md:order-1" style={{ scale: textScale }}>
                <h3 className="font-heading flex items-baseline text-[clamp(2.6rem,5vw,5.2rem)] font-normal uppercase leading-[0.95] tracking-[0.03em] text-white">
                    {book.title.split(" ").map((w, wi) => (
                        <span key={wi} className="mr-[0.35em] inline-flex items-baseline">
                            {w.split("").map((ch, j) => (
                                <span key={j} style={{ fontSize: j === 0 ? "1em" : "0.76em" }}>
                                    {ch}
                                </span>
                            ))}
                        </span>
                    ))}
                </h3>
                <p className="font-section mt-2 text-[clamp(1.5rem,2.4vw,2.6rem)] leading-tight" style={{ color: book.accent }}>
                    {book.subtitle}
                </p>
                <p className="font-body mt-3 text-[clamp(1rem,1.35vw,1.45rem)] font-bold italic text-white">{book.line}</p>
                <p className="font-body mt-5 max-w-[34rem] text-[clamp(0.82rem,0.92vw,1rem)] font-light italic leading-[1.8] text-white/85">{book.desc}</p>
                <div className="mt-7 flex flex-wrap gap-4">
                    <BookButton href={book.links.ebook} tabbable={isActive}>Ebook</BookButton>
                    <BookButton href={book.links.paperback} tabbable={isActive}>Paperback</BookButton>
                    <BookButton href={book.links.hardcover} tabbable={isActive}>Hardcover</BookButton>
                </div>
            </motion.div>

            <div className="relative order-1 flex justify-center md:order-2" style={{ perspective: 1200 }}>
                <motion.div className="relative w-[clamp(160px,22vw,360px)]" style={{ scale: coverScale, rotateY: coverRotY }}>
                    <div aria-hidden className="absolute -inset-[18%] -z-10" style={{ background: `radial-gradient(closest-side, ${book.accent}40, transparent 70%)` }} />
                    <div aria-hidden className="absolute -bottom-[6%] left-[8%] right-[8%] -z-10 h-[10%]" style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.85), transparent)" }} />
                    <div className="aspect-[1622/2321] w-full">
                        {load && <img src={book.cover} alt={`${book.title} — ${book.line}`} decoding="async" draggable={false} className="h-full w-full object-contain" />}
                    </div>
                </motion.div>
            </div>
        </motion.article>
    );
}

function BookButton({ href, tabbable, children }: { href: string; tabbable: boolean; children: string }) {
    return (
        <a
            href={href}
            tabIndex={tabbable ? 0 : -1}
            className="bk-btn font-body relative inline-flex min-w-[8.5rem] items-center justify-center overflow-hidden rounded-full border border-[#ffb27a]/70 bg-gradient-to-b from-[#f38a45] to-[#d9622a] px-7 py-3 text-[clamp(0.85rem,0.95vw,1rem)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_6px_rgba(120,40,0,0.35),0_8px_24px_-6px_rgba(240,120,50,0.6)] outline-none transition-transform duration-300 hover:-translate-y-[3px] active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-300"
        >
            <span aria-hidden className="bk-btn-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            <span className="relative tracking-wide">{children}</span>
        </a>
    );
}