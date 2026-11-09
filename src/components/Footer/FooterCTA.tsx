import { useMemo, useRef, type CSSProperties } from "react";
import { motion, useInView } from "framer-motion";
import NeonWaves from "./NeonWaves";
import "./footer.css";

const NAV = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "My Book", href: "#book" },
    { label: "Blogs", href: "#blogs" },
    { label: "Contact Me", href: "#contact" },
];

// replace "#" with your profile links
const SOCIAL = [
    { label: "X", href: "#", icon: <span className="text-[13px] font-bold leading-none">X</span> },
    {
        label: "Instagram",
        href: "#",
        icon: (
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
            </svg>
        ),
    },
    {
        label: "Telegram",
        href: "#",
        icon: (
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor">
                <path d="M21 4 3 11l6 2 2 6 3-4 5 4z" />
            </svg>
        ),
    },
    { label: "Facebook", href: "#", icon: <span className="text-[14px] font-bold leading-none">f</span> },
];

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function FooterCTA() {
    const ref = useRef<HTMLElement>(null);
    const seen = useInView(ref, { once: true, amount: 0.25 });
    const onScreen = useInView(ref, { amount: 0 });

    const stars = useMemo(
        () =>
            Array.from({ length: 45 }, (_, i) => ({
                left: `${(i * 53.7) % 100}%`,
                top: `${(i * 29.3) % 70}%`,
                size: 1 + (i % 3) * 0.6,
                d: `${2 + (i % 5)}s`,
                delay: `${-(i % 7) * 0.6}s`,
            })),
        [],
    );

    const rise = (delay: number) => ({
        initial: "off",
        animate: seen ? "on" : "off",
        variants: { off: { opacity: 0, y: 28 }, on: { opacity: 1, y: 0, transition: { delay, duration: 0.9, ease: EASE_OUT } } },
    });

    return (
        <footer ref={ref} id="contact" className={`ft relative isolate overflow-hidden bg-[#07031a] text-white ${onScreen ? "" : "ft-paused"}`}>
            {/* ── background ── */}
            <div aria-hidden className="absolute inset-0 -z-10">
                {/* violet sky glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(150,40,200,0.55),rgba(50,15,110,0.35)_45%,transparent_75%)]" />
                {/* stars */}
                {stars.map((s, i) => (
                    <span
                        key={i}
                        className="ft-star absolute rounded-full bg-white"
                        style={{ left: s.left, top: s.top, width: s.size, height: s.size, "--d": s.d, "--delay": s.delay } as CSSProperties}
                    />
                ))}
                {/* pulse rings behind the CTA */}
                <span className="ft-ring absolute left-1/2 top-[32%] h-[min(70vw,720px)] w-[min(70vw,720px)] rounded-full border border-violet-300/25" />
                <span className="ft-ring absolute left-1/2 top-[32%] h-[min(70vw,720px)] w-[min(70vw,720px)] rounded-full border border-violet-300/20" style={{ animationDelay: "-3s" }} />
                {/* rolling grid floor */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
            </div>

            <div className="mx-auto max-w-4xl px-6 pb-16 pt-[clamp(6rem,10vw,9rem)] text-center">
                <motion.h2 {...rise(0)} className="font-heading text-[clamp(2rem,4.2vw,4.2rem)] font-normal uppercase leading-[1.1] tracking-[0.04em]">
                    <SmallCaps text="Lorem Ipsum Is Simply Dummy Text Of The Printing" />
                </motion.h2>
                <motion.span
                    aria-hidden
                    className="mx-auto mt-4 block h-[3px] w-[min(40vw,240px)] origin-center rounded-full bg-gradient-to-r from-transparent via-[#ff4fd8] to-[#7b5cff] shadow-[0_0_14px_rgba(255,80,220,0.8)]"
                    initial="off"
                    animate={seen ? "on" : "off"}
                    variants={{ off: { scaleX: 0 }, on: { scaleX: 1, transition: { delay: 0.3, duration: 0.9, ease: EASE_OUT } } }}
                />
                <motion.p {...rise(0.35)} className="font-body mx-auto mt-6 max-w-md text-[clamp(0.85rem,0.95vw,1rem)] text-white/80">
                    The purpose of a FAQ is generally to provide information on frequent questions or concerns.
                </motion.p>
                <motion.div {...rise(0.5)} className="mt-7">
                    <a
                        href="#books"
                        className="font-body group relative inline-flex overflow-hidden rounded-full border border-[#ffb27a]/70 bg-gradient-to-b from-[#f38a45] to-[#d9622a] px-7 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_24px_-6px_rgba(240,120,50,0.6)] outline-none transition-transform duration-300 hover:-translate-y-[3px] focus-visible:ring-2 focus-visible:ring-orange-300"
                    >
                        Get Your Book
                    </a>
                </motion.div>
            </div>

            <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
                <a href="#home" className="font-heading text-[clamp(1.8rem,3vw,2.8rem)] uppercase leading-none tracking-[0.04em]">
                    <SmallCaps text="Hans Paladini" />
                </a>
                <nav aria-label="Footer">
                    <ul className="font-body flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-bold">
                        {NAV.map((n) => (
                            <li key={n.label}>
                                <a href={n.href} className="ft-link outline-none focus-visible:ring-2 focus-visible:ring-pink-300">
                                    {n.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="relative mt-2 h-[160px]">
                <NeonWaves />
            </div>

            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 pb-8 md:flex-row">
                <p className="font-body text-xs text-white/60">© {new Date().getFullYear()} Hans Paladini. All rights reserved</p>
                <ul className="flex gap-3">
                    {SOCIAL.map((s) => (
                        <li key={s.label}>
                            <a
                                href={s.href}
                                aria-label={s.label}
                                className="grid h-8 w-8 place-items-center rounded-full border border-white/40 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff4fd8] hover:text-[#ff9be9] focus-visible:ring-2 focus-visible:ring-pink-300"
                            >
                                {s.icon}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}

function SmallCaps({ text }: { text: string }) {
    return (
        <span className="inline-flex flex-wrap items-baseline justify-center gap-x-[0.3em]">
            {text.split(" ").map((w, wi) => (
                <span key={wi} className="inline-flex items-baseline">
                    {w.split("").map((ch, j) => (
                        <span key={j} style={{ fontSize: j === 0 ? "1em" : "0.76em" }}>
                            {ch}
                        </span>
                    ))}
                </span>
            ))}
        </span>
    );
}