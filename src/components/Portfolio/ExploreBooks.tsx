import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import "./portfolio.css";

import portfolioBg from "/images/portfolio/Portfolio-BG.png";
import genesisCover from "/images/books/DayWalker-Vampire.png";
import confessionsCover from "/images/books/VampirePrincess.png";
import oneWayCover from "/images/books/OneWay.png";
import purgatoryCover from "/images/books/VampirePrincess2.png";
import willyCover from "/images/books/Willy-Jones.png";
import inquisitorCover from "/images/books/The-Inquisitor.png";
import paradiseCover from "/images/books/Paradise.png";
import { idlePreload } from "@/utils/idlePreload";

type Series = "daywalker" | "willy";
type Book = { name: string; desc: string; cover: string; href: string };

const DESC = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";

const SERIES: Record<Series, { label: string; books: Book[] }> = {
    daywalker: {
        label: "Daywalker",
        books: [
            { name: "Genesis", desc: DESC, cover: genesisCover, href: "#" },
            { name: "Confessions of a Sinner", desc: DESC, cover: confessionsCover, href: "#" },
            { name: "One Way Ticket to Hell", desc: DESC, cover: oneWayCover, href: "#" },
            { name: "Purgatory", desc: DESC, cover: purgatoryCover, href: "#" },
        ],
    },
    willy: {
        label: "Willy Jones",
        books: [
            { name: "Willy Jones", desc: DESC, cover: willyCover, href: "#" },
            { name: "The Inquisitor", desc: DESC, cover: inquisitorCover, href: "#" },
            { name: "Terror in Paradise", desc: DESC, cover: paradiseCover, href: "#" },
        ],
    },
};
const TABS: Series[] = ["daywalker", "willy"];

const TITLE = "Explore The Books";
const SUBTITLE = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";
const TYPE_SPEED = 60;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const COVER_CROP = { width: "108.42%", height: "110.37%", left: "-4.95%", top: "-4.8%", maxWidth: "none" } as const;

export default function ExploreBooks() {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion() ?? false;
    const start = useInView(ref, { once: true, amount: 0.3 });

    const [tab, setTab] = useState<Series>("daywalker"); 
    const [typed, setTyped] = useState(0);
    const [done, setDone] = useState(false); 

    useEffect(() => {
        if (!start) return;
        if (reduce) {
            setTyped(TITLE.length);
            setDone(true);
            return;
        }
        let i = 0;
        const id = window.setInterval(() => {
            i += 1;
            setTyped(i);
            if (i >= TITLE.length) {
                window.clearInterval(id);
                setDone(true);
            }
        }, TYPE_SPEED);
        return () => window.clearInterval(id);
    }, [start, reduce]);

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

    const books = SERIES[tab].books;

    useEffect(() => idlePreload([portfolioBg, ...Object.values(SERIES).flatMap((s) => s.books.map((b) => b.cover))]), []);

    return (
        <section ref={ref} id="books" aria-labelledby="pf-title" className="portfolio relative isolate overflow-hidden bg-[#140b2e] py-[clamp(4rem,7vw,7rem)]">
            <motion.div aria-hidden className="absolute -inset-y-[8%] inset-x-0 -z-10" style={{ y: reduce ? 0 : bgY }}>
                <img src={portfolioBg} alt="" decoding="async" loading="lazy" className="h-full w-full object-cover" />
            </motion.div>
            <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-black to-transparent" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-black/80 to-transparent" />

            <div className="mx-auto max-w-[1240px] px-6">
                <h2
                    id="pf-title"
                    aria-label={TITLE}
                    className="font-heading flex items-baseline justify-center gap-x-[0.35em] text-center text-[clamp(2.4rem,5.2vw,5.4rem)] font-normal uppercase leading-none tracking-[0.04em] text-white"
                    style={{ textShadow: "0 0 24px rgba(200,160,255,0.35)" }}
                >
                    <TypedTitle typed={typed} showCaret={start && !done} />
                </h2>

                <motion.p
                    className="font-body mx-auto mt-4 max-w-xl text-center text-[clamp(0.8rem,0.95vw,1rem)] font-light italic text-white/85"
                    initial="off"
                    animate={done ? "on" : "off"}
                    variants={{ off: { opacity: 0, y: 12 }, on: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } } }}
                >
                    {SUBTITLE}
                </motion.p>

                <motion.div
                    role="tablist"
                    aria-label="Book series"
                    className="mt-7 flex justify-center gap-4"
                    initial="off"
                    animate={done ? "on" : "off"}
                    variants={{ off: { opacity: 0, y: 14 }, on: { opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.7, ease: EASE_OUT } } }}
                >
                    {TABS.map((t) => {
                        const selected = t === tab;
                        return (
                            <button
                                key={t}
                                role="tab"
                                aria-selected={selected}
                                aria-controls="pf-panel"
                                onClick={() => setTab(t)}
                                className={`font-body relative min-w-[7.5rem] rounded-lg border px-6 py-2 text-[clamp(0.85rem,0.95vw,1rem)] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-white/70 ${selected ? "border-white text-[#1d1336]" : "border-white/50 text-white/85 hover:border-white hover:text-white"
                                    }`}
                            >
                                {selected && (
                                    <motion.span
                                        layoutId="pf-tab"
                                        className="absolute inset-0 rounded-[7px] bg-gradient-to-b from-[#f1ecff] to-[#c9bdf0] shadow-[0_0_24px_rgba(200,170,255,0.6)]"
                                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                    />
                                )}
                                <span className="relative">{SERIES[t].label}</span>
                            </button>
                        );
                    })}
                </motion.div>

                <div id="pf-panel" role="tabpanel" className="mt-8 min-h-[34rem]">
                    <AnimatePresence mode="wait">
                        <motion.ul
                            key={tab}
                            className="flex flex-wrap justify-center gap-5"
                            initial="off"
                            animate={done ? "on" : "off"}
                            exit="out"
                            variants={{ off: {}, on: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.25 } }, out: { transition: { staggerChildren: 0.05 } } }}
                        >
                            {books.map((b) => (
                                <motion.li
                                    key={b.name}
                                    className="w-[clamp(220px,21vw,280px)]"
                                    variants={{
                                        off: { opacity: 0, y: 40, scale: 0.95 },
                                        on: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
                                        out: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.25 } },
                                    }}
                                >
                                    <BookCard book={b} />
                                </motion.li>
                            ))}
                        </motion.ul>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

function BookCard({ book }: { book: Book }) {
    return (
        <article className="pf-card flex h-full flex-col rounded-2xl border border-white/15 bg-[linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03)_50%,rgba(20,8,45,0.35))] p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="pf-cover relative aspect-[1496/2103] overflow-hidden rounded-lg">
                <img src={book.cover} alt={`${book.name} — book cover`} decoding="async" loading="lazy" className="absolute" style={COVER_CROP} />
                <span aria-hidden className="pf-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            <h3 className="font-body mt-4 text-[clamp(1.05rem,1.3vw,1.3rem)] font-bold leading-tight text-white">{book.name}</h3>
            <p className="font-body mt-2 text-[clamp(0.78rem,0.85vw,0.9rem)] font-light italic leading-relaxed text-white/80">{book.desc}</p>
            <a
                href={book.href}
                className="pf-link font-body mt-3 self-start bg-[linear-gradient(currentColor,currentColor)] text-[0.9rem] text-[#f0843a] outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
            >
                View Details
            </a>
        </article>
    );
}

function TypedTitle({ typed, showCaret }: { typed: number; showCaret: boolean }) {
    const caret = showCaret ? <span className="pf-caret ml-[0.04em] inline-block h-[0.85em] w-[2px] self-center bg-white" /> : null;
    let g = 0;
    return (
        <>
            {typed === 0 && caret}
            {TITLE.split(" ").map((w, wi) => {
                const start = g;
                g += w.length + 1;
                return (
                    <span key={wi} aria-hidden className="inline-flex items-baseline">
                        {w.split("").map((ch, j) => {
                            const idx = start + j;
                            return (
                                <span key={j} className="inline-flex items-baseline">
                                    <span style={{ fontSize: j === 0 ? "1em" : "0.76em", opacity: idx < typed ? 1 : 0 }}>{ch}</span>
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