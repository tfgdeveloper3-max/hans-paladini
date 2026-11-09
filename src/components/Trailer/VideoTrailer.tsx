import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import "./trailer.css";

const VIDEO = {
    youtube: "",
    file: "/videos/trailer.mp4",
};

const PLATFORMS = ["Apple TV", "Android", "Amazon", "YouTube TV"];
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function VideoTrailer() {
    const ref = useRef<HTMLElement>(null);
    const seen = useInView(ref, { once: true, amount: 0.3 });
    const onScreen = useInView(ref, { amount: 0 });
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const rise = (delay: number) => ({
        initial: "off",
        animate: seen ? "on" : "off",
        variants: { off: { opacity: 0, y: 30 }, on: { opacity: 1, y: 0, transition: { delay, duration: 0.9, ease: EASE_OUT } } },
    });

    return (
        <section
            ref={ref}
            id="trailer"
            aria-labelledby="trailer-title"
            className={`trailer relative isolate overflow-hidden bg-black py-[clamp(4rem,7vw,7rem)] ${onScreen ? "" : "tr-paused"}`}
        >
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80%] w-[70%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(110,60,200,0.22),transparent)]" />

            <motion.h2 id="trailer-title" {...rise(0)} className="font-heading text-center text-[clamp(2.2rem,4.6vw,4.6rem)] font-normal uppercase leading-none tracking-[0.04em] text-white">
                <SmallCaps text="Video Trailer" />
            </motion.h2>

            <motion.div {...rise(0.15)} className="mx-auto mt-10 w-[min(92vw,820px)]">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Play the video trailer"
                    className="tr-frame group relative block aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-[#0a0a0f] p-[3%] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)] outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                    <span className="relative block h-full w-full overflow-hidden rounded-[10px]">
                        <span className="tr-poster absolute inset-0 block">
                            <span className="absolute inset-0 bg-[#3a0610]" />
                            <span
                                className="tr-streaks absolute inset-y-0 left-0 w-[200%]"
                                style={{
                                    background:
                                        "repeating-linear-gradient(90deg, rgba(150,20,35,0) 0px, rgba(190,30,50,0.65) 14px, rgba(90,8,20,0.2) 30px, rgba(220,60,70,0.5) 44px, rgba(120,10,25,0) 70px)",
                                }}
                            />
                            <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65))]" />
                            <span className="font-heading tr-metal absolute inset-0 flex items-center justify-center whitespace-nowrap text-[clamp(1.8rem,7vw,5.6rem)] uppercase leading-none tracking-[0.02em]">
                                Hans Paladini
                            </span>
                        </span>

                        <span className="absolute left-1/2 top-1/2 grid h-[clamp(52px,7vw,72px)] w-[clamp(52px,7vw,72px)] -translate-x-1/2 -translate-y-1/2 place-items-center">
                            <span className="tr-ping absolute inset-0 rounded-full bg-white/40" />
                            <span className="relative grid h-full w-full place-items-center rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-transform duration-300 group-hover:scale-110">
                                <svg viewBox="0 0 24 24" className="ml-[8%] h-[42%] w-[42%]" fill="#5b2bd6" aria-hidden>
                                    <path d="M6 4l14 8-14 8z" />
                                </svg>
                            </span>
                        </span>
                    </span>
                </button>
            </motion.div>

            <motion.ul {...rise(0.3)} className="font-body mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-white/55">
                {PLATFORMS.map((p) => (
                    <li key={p} className="flex items-center gap-2 transition-colors duration-300 hover:text-white">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        {p}
                    </li>
                ))}
            </motion.ul>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Video trailer"
                    >
                        <motion.div
                            className="relative aspect-video w-[min(94vw,1100px)] overflow-hidden rounded-xl bg-black shadow-2xl"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE_OUT }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {VIDEO.youtube ? (
                                <iframe
                                    src={`${VIDEO.youtube}?autoplay=1&rel=0`}
                                    title="Hans Paladini video trailer"
                                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                    allowFullScreen
                                    className="h-full w-full"
                                />
                            ) : (
                                <video src={VIDEO.file} controls autoPlay playsInline className="h-full w-full" />
                            )}
                        </motion.div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            autoFocus
                            className="font-body absolute right-5 top-5 rounded-full border border-white/30 px-4 py-1.5 text-sm text-white hover:bg-white/10"
                        >
                            Close ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
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