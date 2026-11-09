import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Hero from "./Hero/Hero";
import AboutAuthor from "./About/AboutAuthor";

const HERO_H = "max(100svh, 63.54vw, 680px)"; 

export default function HeroAboutStack() {
    const aboutRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion() ?? false;
    const [covered, setCovered] = useState(false);

    const { scrollYProgress } = useScroll({ target: aboutRef, offset: ["start end", "start start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
    const dim = useTransform(scrollYProgress, [0, 1], [0, 0.85]);

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        const isCovered = v >= 0.999;
        setCovered((c) => (c === isCovered ? c : isCovered));
    });

    return (
        <div className="relative">
            <div className="sticky z-0" style={{ top: `min(0px, calc(100svh - ${HERO_H}))`, visibility: covered ? "hidden" : "visible" }}>
                <motion.div style={{ y: reduce ? 0 : heroY }}>
                    <Hero />
                </motion.div>
                <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />
            </div>

            <div ref={aboutRef} className="relative z-10">
                <AboutAuthor />
            </div>
        </div>
    );
}