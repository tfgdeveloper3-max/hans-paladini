import { useMemo, useRef, type CSSProperties, type PointerEvent } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import "./about.css";
import hansImg from "/images/about/hanz.png";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const P1 =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker";
const P2 =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London,";

const PHOTO_CROP: CSSProperties = { width: "163.75%", height: "154.41%", left: "-29.58%", top: "-16.11%", maxWidth: "none" };

const FIRE_COUNT = 22;

export default function AboutAuthor() {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion() ?? false;
    const visible = useInView(ref, { once: true, amount: 0.3 });
    const onScreen = useInView(ref, { amount: 0 });

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const glowAY = useTransform(scrollYProgress, [0, 1], ["-20%", "25%"]);
    const glowBY = useTransform(scrollYProgress, [0, 1], ["25%", "-20%"]);
    const frameY = useTransform(scrollYProgress, [0, 1], [70, -70]);
    const photoY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
    const textY = useTransform(scrollYProgress, [0, 1], [35, -35]);

    const fire = useMemo(
        () =>
            Array.from({ length: FIRE_COUNT }, (_, i) => ({
                left: `${(i * 47 + 7) % 100}%`,
                size: 10 + ((i * 7) % 16),
                d: `${4.5 + ((i * 3) % 5) * 0.8}s`,
                delay: `${-((i * 0.83) % 6)}s`,
                dx: `${(i % 2 ? 1 : -1) * (15 + ((i * 11) % 45))}px`,
            })),
        [],
    );

    const show = visible || reduce;

    return (
        <section
            ref={ref}
            id="about"
            aria-labelledby="about-title"
            className={`about relative isolate min-h-[100svh] overflow-hidden bg-black text-white ${onScreen ? "" : "is-paused"}`}
        >
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-[15%] -top-[25%] h-[85%] w-[60%] will-change-transform"
                style={{ y: glowAY, background: "radial-gradient(closest-side, rgba(176,98,28,0.5), rgba(120,60,15,0.15) 55%, transparent)" }}
            />
            <motion.div
                aria-hidden
                className="pointer-events-none absolute -bottom-[25%] -right-[12%] h-[80%] w-[55%] will-change-transform"
                style={{ y: glowBY, background: "radial-gradient(closest-side, rgba(176,98,28,0.45), rgba(120,60,15,0.14) 55%, transparent)" }}
            />

            {!reduce && (
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[rgba(255,90,20,0.12)] to-transparent" />
                    {fire.map((f, i) => (
                        <span
                            key={i}
                            className="about-fire"
                            style={{ left: f.left, width: f.size, height: f.size, "--d": f.d, "--delay": f.delay, "--dx": f.dx } as CSSProperties}
                        >
                            <i />
                        </span>
                    ))}
                </div>
            )}

            <div className="relative mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-12 px-6 py-24 md:grid-cols-[minmax(220px,22vw)_1fr] md:gap-14 lg:gap-16 lg:px-10">
                <motion.div style={{ y: reduce ? 0 : frameY }} className="mx-auto w-full max-w-[22rem] md:max-w-none">
                    <Photo show={show} reduce={reduce} photoY={photoY} />
                </motion.div>

                <motion.div style={{ y: reduce ? 0 : textY }} className="font-body">
                    <motion.p
                        className="about-script text-[clamp(1.4rem,2vw,2.2rem)] leading-tight text-[#d23b2f]"
                        initial={{ opacity: 0, x: -24 }}
                        animate={show ? { opacity: 1, x: 0 } : undefined}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
                    >
                        About The Author
                    </motion.p>

                    <Heading show={show} reduce={reduce} />

                    <Reveal show={show} delay={0.8}>
                        <p className="mt-7 max-w-[50rem] text-[clamp(0.85rem,0.98vw,1.05rem)] font-light italic leading-[1.85] tracking-[0.02em] text-white/90">{P1}</p>
                    </Reveal>
                    <Reveal show={show} delay={1}>
                        <p className="mt-10 max-w-[48rem] text-[clamp(0.95rem,1.12vw,1.22rem)] font-light italic leading-[1.8] tracking-[0.02em] text-white">{P2}</p>
                    </Reveal>
                    <Reveal show={show} delay={1.2}>
                        <div className="mt-8">
                            <MagneticButton href="#about-more" reduce={reduce}>
                                Learn More About Author
                            </MagneticButton>
                        </div>
                    </Reveal>
                </motion.div>
            </div>
        </section>
    );
}

function Reveal({ show, delay, children }: { show: boolean; delay: number; children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay, duration: 0.9, ease: EASE_OUT }}
        >
            {children}
        </motion.div>
    );
}

function Photo({ show, reduce, photoY }: { show: boolean; reduce: boolean; photoY: MotionValue<string> }) {
    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const srx = useSpring(rx, { stiffness: 120, damping: 18 });
    const sry = useSpring(ry, { stiffness: 120, damping: 18 });

    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx.set((0.5 - (e.clientY - r.top) / r.height) * 8);
    };
    const onLeave = () => {
        rx.set(0);
        ry.set(0);
    };

    const SLATS = 6;
    const line = "absolute bg-[#f4efe6]";
    const draw = (delay: number) => ({ initial: { scale: reduce ? 1 : 0 }, animate: show ? { scale: 1 } : undefined, transition: { delay, duration: 0.6, ease: EASE_OUT } });

    return (
        <div style={{ perspective: 1000 }}>
            <motion.div
                className="relative aspect-[240/329] w-full"
                style={{ rotateX: srx, rotateY: sry }}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={show ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 0.9, ease: EASE_OUT }}
            >
                <div className="absolute inset-0 overflow-hidden bg-neutral-800 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.9)]">
                    <motion.div className="absolute inset-0 will-change-transform" style={{ y: reduce ? 0 : photoY, scale: 1.12 }}>
                        <img src={hansImg} alt="Portrait of Hans Paladini" decoding="async" draggable={false} className="absolute select-none" style={PHOTO_CROP} />
                    </motion.div>

                    {!reduce &&
                        Array.from({ length: SLATS }, (_, i) => (
                            <motion.span
                                key={i}
                                aria-hidden
                                className="absolute inset-x-0 bg-black"
                                style={{ top: `${(i * 100) / SLATS}%`, height: `${100 / SLATS + 0.5}%`, originX: i % 2 ? 1 : 0 }}
                                initial={{ scaleX: 1 }}
                                animate={show ? { scaleX: 0 } : undefined}
                                transition={{ delay: 0.25 + i * 0.08, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            />
                        ))}
                </div>

                <motion.span aria-hidden className={`${line} inset-x-0 top-0 h-[3px] origin-left`} {...draw(0.1)} />
                <motion.span aria-hidden className={`${line} inset-y-0 right-0 w-[3px] origin-top`} {...draw(0.35)} />
                <motion.span aria-hidden className={`${line} inset-x-0 bottom-0 h-[3px] origin-right`} {...draw(0.6)} />
                <motion.span aria-hidden className={`${line} inset-y-0 left-0 w-[3px] origin-bottom`} {...draw(0.85)} />
            </motion.div>
        </div>
    );
}

function Heading({ show, reduce }: { show: boolean; reduce: boolean }) {
    const words = ["Hans", "Paladini"];
    return (
        <h2
            id="about-title"
            aria-label="Hans Paladini"
            className="font-heading mt-3 flex flex-wrap items-baseline gap-x-[0.4em] text-[clamp(2.4rem,4.4vw,4.8rem)] font-normal uppercase leading-none tracking-[0.04em] text-white"
        >
            {words.map((w, wi) => (
                <motion.span
                    key={w}
                    aria-hidden
                    className="inline-flex items-baseline"
                    initial={{ opacity: 0, y: 30 }}
                    animate={show ? { opacity: 1, y: 0 } : undefined}
                    transition={{ delay: reduce ? 0 : 0.4 + wi * 0.15, duration: 0.9, ease: EASE_OUT }}
                >
                    {w.split("").map((ch, j) => (
                        <span key={j} style={{ fontSize: j === 0 ? "1em" : "0.74em" }}>
                            {ch}
                        </span>
                    ))}
                </motion.span>
            ))}
        </h2>
    );
}

function MagneticButton({ href, reduce, children }: { href: string; reduce: boolean; children: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 15 });
    const sy = useSpring(y, { stiffness: 200, damping: 15 });

    const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.18);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.a
            href={href}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={{ x: sx, y: sy }}
            whileTap={{ scale: 0.96 }}
            className="about-btn group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#ffb27a]/70 bg-gradient-to-b from-[#f38a45] to-[#d9622a] px-8 py-3 text-[clamp(0.85rem,0.95vw,1rem)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_6px_rgba(120,40,0,0.35),0_8px_24px_-6px_rgba(240,120,50,0.6)] outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
        >
            <span aria-hidden className="about-btn-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            <span className="relative tracking-wide">{children}</span>
        </motion.a>
    );
}