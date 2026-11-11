import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { idlePreload } from "../../utils/idlePreload";
import "./story.css";

type Story = {
    bg: string;
    title: string;
    subtitle: string;
    line: string;
    text: string;
    side: "left" | "right";
};

const TEXT =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London";

const STORIES: Story[] = [
    { bg: "/images/story/Story-BG1.png", title: "Heading Here", subtitle: "Lorem Dummy Text", line: "Lorem Ipsum is simply dummy text", text: TEXT, side: "right" },
    { bg: "/images/story/Story-BG2.png", title: "Heading Here", subtitle: "Lorem Dummy Text", line: "Lorem Ipsum is simply dummy text", text: TEXT, side: "left" },
    { bg: "/images/story/Story-BG3.png", title: "Heading Here", subtitle: "Lorem Dummy Text", line: "Lorem Ipsum is simply dummy text", text: TEXT, side: "right" },
    { bg: "/images/story/Story-BG4.png", title: "Heading Here", subtitle: "Lorem Dummy Text", line: "Lorem Ipsum is simply dummy text", text: TEXT, side: "left" },
];

const N = STORIES.length;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function StorySection() {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion() ?? false;
    const onScreen = useInView(ref, { amount: 0 });

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const pos = useTransform(scrollYProgress, (v) => v * (N - 1));

    useEffect(() => idlePreload(STORIES.map((s) => s.bg)), []);

    return (
        <section
            ref={ref}
            id="stories"
            aria-label="Stories"
            className={`story relative bg-black ${onScreen ? "" : "story-paused"}`}
            style={{ height: `${N * 100}svh` }}
        >
            <div aria-hidden className="sticky top-0 h-[100svh] overflow-hidden [contain:paint]">
                {STORIES.map((s, i) => (
                    <Background key={i} story={s} i={i} pos={pos} reduce={reduce} />
                ))}
                <div className="absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-black to-transparent" style={{ zIndex: N }} />
                <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-black to-transparent" style={{ zIndex: N }} />
            </div>

            <div className="relative -mt-[100svh]">
                {STORIES.map((s, i) => (
                    <StoryPanel key={i} story={s} reduce={reduce} />
                ))}
            </div>
        </section>
    );
}

function Background({ story, i, pos, reduce }: { story: Story; i: number; pos: MotionValue<number>; reduce: boolean }) {
    const opacity = useTransform(pos, [i - 0.65, i - 0.25], [i === 0 ? 1 : 0, 1]);
    const visibility = useTransform(pos, (v) => (v > i + 0.8 || v < i - 0.7 ? "hidden" : "visible"));
    const scale = useTransform(pos, [i - 0.65, i + 0.5], [1.08, 1]);

    return (
        <motion.div className="absolute inset-0 will-change-[opacity]" style={{ opacity, visibility, zIndex: i }}>
            <motion.img
                src={story.bg}
                alt=""
                decoding="async"
                loading={i < 2 ? "eager" : "lazy"}
                draggable={false}
                className="h-full w-full object-cover will-change-transform"
                style={{ scale: reduce ? 1 : scale }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background:
                        story.side === "right"
                            ? "linear-gradient(to left, rgba(0,0,0,0.75), rgba(0,0,0,0.35) 50%, transparent 75%)"
                            : "linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.35) 50%, transparent 75%)",
                }}
            />
        </motion.div>
    );
}

function StoryPanel({ story, reduce }: { story: Story; reduce: boolean }) {
    const ref = useRef<HTMLElement>(null);
    const onScreen = useInView(ref, { amount: 0 });
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const opacity = useTransform(scrollYProgress, [0.15, 0.4, 0.6, 0.85], [0, 1, 1, 0]);
    const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

    const item = {
        hide: { opacity: 0, y: 24 },
        show: (k: number) => ({ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.1 * k, duration: 0.8, ease: EASE_OUT } }),
    };

    return (
        <article
            ref={ref}
            className={`story-panel relative z-10 flex h-[100svh] items-center overflow-x-clip px-[6vw] ${story.side === "right" ? "justify-end" : "justify-start"} ${onScreen ? "is-on" : ""
                }`}
        >
            {/* ONE layer moves + fades (smoke and text together), instead of two separate fading layers */}
            <motion.div
                className="relative w-full max-w-[38rem] will-change-[transform,opacity] md:w-[46%]"
                style={{ y: reduce ? 0 : y, opacity: reduce ? 1 : opacity }}
            >
                <span aria-hidden className="story-smoke">
                    <span className="story-smoke__wisp story-smoke__wisp--a" />
                    <span className="story-smoke__wisp story-smoke__wisp--b" />
                    <span className="story-smoke__wisp story-smoke__wisp--c" />
                </span>

                <motion.div className="story-content relative" initial="hide" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
                    <motion.h3
                        custom={0}
                        variants={item}
                        className="font-heading flex flex-wrap items-baseline gap-x-[0.3em] text-[clamp(2.4rem,5vw,5rem)] font-normal uppercase leading-none tracking-[0.03em] text-white"
                    >
                        {story.title.split(" ").map((w, wi) => (
                            <span key={wi} className="inline-flex items-baseline">
                                {w.split("").map((ch, j) => (
                                    <span key={j} style={{ fontSize: j === 0 ? "1em" : "0.76em" }}>
                                        {ch}
                                    </span>
                                ))}
                            </span>
                        ))}
                    </motion.h3>
                    <motion.p custom={1} variants={item} className="font-section mt-3 text-[clamp(1.4rem,2.3vw,2.4rem)] leading-tight text-[#ff4a3d]">
                        {story.subtitle}
                    </motion.p>
                    <motion.p custom={2} variants={item} className="font-body mt-2 text-[clamp(0.95rem,1.25vw,1.3rem)] font-bold italic text-white">
                        {story.line}
                    </motion.p>
                    <motion.p custom={3} variants={item} className="font-body mt-4 text-[clamp(0.82rem,0.92vw,1rem)] font-light italic leading-[1.8] text-white/90">
                        {story.text}
                    </motion.p>
                </motion.div>
            </motion.div>
        </article>
    );
}