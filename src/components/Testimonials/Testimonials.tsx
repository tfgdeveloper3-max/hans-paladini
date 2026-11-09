import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./testimonials.css";

type Quote = { text: string; name: string; company: string };

const Q1: Quote = {
    text: "GEN 1's customer segmentation and marketing insights have dramatically increased our engagement and conversion rates.",
    name: "Sarah Lee, Marketing Head",
    company: "Scope Co.",
};
const Q2: Quote = {
    text: "The real-time analytics and predictive capabilities of GEN 1 have kept us ahead in the competitive market landscape.",
    name: "Emily Santos, Chief Data Officer",
    company: "Scope Co.",
};
const Q3: Quote = {
    text: "GEN 1 transformed our data handling, providing seamless integration and insightful visualizations that boosted our business decisions.",
    name: "Sophia Lang, CEO",
    company: "Scope Co.",
};

const ROW_1: Quote[] = [Q1, Q2, Q3, Q1, Q2, Q3];
const ROW_2: Quote[] = [Q3, Q2, Q1, Q3, Q2, Q1];
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function Testimonials() {
    const ref = useRef<HTMLElement>(null);
    const seen = useInView(ref, { once: true, amount: 0.25 });
    const onScreen = useInView(ref, { amount: 0 });

    return (
        <section
            ref={ref}
            id="testimonials"
            aria-labelledby="tm-title"
            className={`relative isolate overflow-hidden bg-black py-[clamp(3.5rem,6vw,6rem)] ${onScreen ? "" : "tm-paused"}`}
        >
            <motion.h2
                id="tm-title"
                initial="off"
                animate={seen ? "on" : "off"}
                variants={{ off: { opacity: 0, y: 30 }, on: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } } }}
                className="font-heading px-6 text-center text-[clamp(1.9rem,3.8vw,3.9rem)] font-normal uppercase leading-none tracking-[0.04em] text-white"
            >
                <SmallCaps text="Two Worlds, Endless Mysteries." />
            </motion.h2>

            <motion.div
                className="mt-12 flex flex-col gap-5"
                initial="off"
                animate={seen ? "on" : "off"}
                variants={{ off: { opacity: 0 }, on: { opacity: 1, transition: { delay: 0.25, duration: 1 } } }}
            >
                {/* row 1 → moves right, row 2 → moves left */}
                <Row quotes={ROW_1} direction="right" duration={50} />
                <Row quotes={ROW_2} direction="left" duration={46} />
            </motion.div>

            {/* fade the edges into black (plain gradients = cheap) */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[12vw] bg-gradient-to-r from-black to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[12vw] bg-gradient-to-l from-black to-transparent" />
        </section>
    );
}

function Row({ quotes, direction, duration }: { quotes: Quote[]; direction: "left" | "right"; duration: number }) {
    // the list is rendered twice so the loop is seamless (track moves exactly half its width)
    const items = [...quotes, ...quotes];
    return (
        <div className="tm-row overflow-hidden py-2">
            <ul
                className={`tm-track flex w-max gap-5 ${direction === "left" ? "to-left" : "to-right"}`}
                style={{ ["--dur" as string]: `${duration}s` }}
            >
                {items.map((q, i) => (
                    <li key={i} aria-hidden={i >= quotes.length}>
                        <Card quote={q} glow={i % 3 === 0} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Card({ quote, glow }: { quote: Quote; glow: boolean }) {
    return (
        <figure
            className={`tm-card relative flex h-full w-[clamp(250px,26vw,340px)] flex-col items-center justify-center rounded-2xl border border-white/15 px-6 py-6 text-center ${glow
                    ? "bg-[radial-gradient(ellipse_at_30%_40%,rgba(120,70,220,0.55),rgba(40,20,90,0.35)_55%,rgba(15,10,30,0.9))]"
                    : "bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))]"
                }`}
        >
            <blockquote className="font-body text-[clamp(0.78rem,0.85vw,0.92rem)] leading-relaxed text-white/90">“{quote.text}”</blockquote>
            <figcaption className="mt-3">
                <span className="font-section block text-[clamp(1rem,1.2vw,1.3rem)] text-[#d93a30]">{quote.name}</span>
                <span className="font-body mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-white">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                        <circle cx="12" cy="12" r="9" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="40 17" />
                    </svg>
                    {quote.company}
                </span>
            </figcaption>
        </figure>
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