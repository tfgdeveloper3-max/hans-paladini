import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

export type NavLink = { label: string; sub: string; href: string };

export const NAV_LINKS: NavLink[] = [
    { label: "Home", sub: "Intro and more", href: "#home" },
    { label: "About Me", sub: "The author", href: "#about" },
    { label: "My Book", sub: "The story", href: "#book" },
    { label: "Reviews", sub: "What readers say", href: "#reviews" },
    { label: "Blogs", sub: "Notes and news", href: "#blogs" },
    { label: "Contact Me", sub: "Say hello", href: "#contact" },
];

const LEFT_LINKS = NAV_LINKS.slice(0, 3);
const RIGHT_LINKS = NAV_LINKS.slice(3);

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const TEXT_SHADOW = "0 2px 14px rgba(5,3,15,0.75), 0 0 2px rgba(5,3,15,0.6)";

type Props = { show: boolean; reduce: boolean };

/**
 * Fixed top navbar. Rendered through a portal into <body>, so it stays on top
 * of every section while scrolling, even though <Hero /> renders it.
 */
export default function HeroNav({ show, reduce }: Props) {
    const [mounted, setMounted] = useState(false);
    const [active, setActive] = useState("#home");
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => setMounted(true), []);

    // Solid background once the page is scrolled
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Highlight the link of the section currently on screen
    useEffect(() => {
        const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter((el): el is Element => !!el);
        if (!sections.length) return;
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
            { rootMargin: "-45% 0px -50% 0px" },
        );
        sections.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);

    // Close the mobile menu on Escape or when growing to desktop
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const mq = window.matchMedia("(min-width: 1024px)");
        const onMq = () => mq.matches && setOpen(false);
        window.addEventListener("keydown", onKey);
        mq.addEventListener("change", onMq);
        return () => {
            window.removeEventListener("keydown", onKey);
            mq.removeEventListener("change", onMq);
        };
    }, [open]);

    const select = (href: string) => {
        setActive(href);
        setOpen(false);
    };

    const solid = scrolled || open;

    const bar = (
        <motion.header
            className={`font-body fixed inset-x-0 top-0 z-[100] transition-[background-color,box-shadow] duration-500 ${solid ? "bg-[#07041a]/95 shadow-[0_1px_0_rgba(140,230,255,0.18)]" : "bg-transparent"
                }`}
            initial={{ y: -90, opacity: 0 }}
            animate={show ? { y: 0, opacity: 1 } : { y: -90, opacity: 0 }}
            transition={{ delay: reduce ? 0 : 0.5, duration: 0.9, ease: EASE_OUT }}
        >
            <LayoutGroup id="hero-nav">
                <nav
                    aria-label="Primary"
                    className={`mx-auto grid max-w-[1680px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 transition-[height] duration-500 lg:px-12 ${scrolled ? "h-16 lg:h-[4.5rem]" : "h-20 lg:h-28"
                        }`}
                >
                    <ul className="col-start-1 hidden items-center gap-[clamp(1.25rem,2.6vw,3.25rem)] lg:flex">
                        {LEFT_LINKS.map((l) => (
                            <NavItem key={l.href} link={l} active={active === l.href} onSelect={select} />
                        ))}
                    </ul>

                    <BrandTitle show={show} reduce={reduce} compact={scrolled} onClick={() => select("#home")} />

                    <ul className="col-start-3 hidden items-center justify-end gap-[clamp(1.25rem,2.6vw,3.25rem)] lg:flex">
                        {RIGHT_LINKS.map((l) => (
                            <NavItem key={l.href} link={l} active={active === l.href} onSelect={select} />
                        ))}
                    </ul>

                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-controls="hero-mobile-menu"
                        aria-label={open ? "Close menu" : "Open menu"}
                        className="col-start-3 row-start-1 grid h-10 w-10 place-items-center justify-self-end rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 lg:hidden"
                    >
                        <span className="relative block h-3.5 w-6">
                            <span className={`absolute left-0 top-0 h-[2px] w-full bg-white transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
                            <span className={`absolute left-0 top-[6px] h-[2px] w-full bg-white transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
                            <span className={`absolute left-0 top-[12px] h-[2px] w-full bg-white transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
                        </span>
                    </button>
                </nav>
            </LayoutGroup>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        id="hero-mobile-menu"
                        className="overflow-hidden border-t border-white/10 px-5 lg:hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE_OUT }}
                    >
                        {NAV_LINKS.map((l) => {
                            const isActive = active === l.href;
                            return (
                                <li key={l.href} className="border-b border-white/5 last:border-0">
                                    <a
                                        href={l.href}
                                        onClick={() => select(l.href)}
                                        aria-current={isActive ? "page" : undefined}
                                        className="flex items-baseline justify-between py-3.5 outline-none focus-visible:text-cyan-200"
                                    >
                                        <span className={`text-lg font-bold ${isActive ? "text-white" : "text-white/75"}`}>{l.label}</span>
                                        <span className="text-xs font-light italic text-white/50">{l.sub}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </motion.header>
    );

    return mounted ? createPortal(bar, document.body) : null;
}

function NavItem({ link, active, onSelect }: { link: NavLink; active: boolean; onSelect: (href: string) => void }) {
    return (
        <li>
            <a
                href={link.href}
                onClick={() => onSelect(link.href)}
                aria-current={active ? "page" : undefined}
                className="group relative block rounded-sm py-2 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            >
                <span
                    className={`whitespace-nowrap text-[clamp(0.95rem,1.1vw,1.25rem)] font-bold tracking-wide transition-colors duration-300 ${active ? "text-white" : "text-white/80 group-hover:text-white"
                        }`}
                    style={{ textShadow: TEXT_SHADOW }}
                >
                    {link.label}
                </span>

                {active ? (
                    <motion.span layoutId="hero-nav-underline" className="absolute inset-x-0 -bottom-0.5 flex items-center justify-center">
                        <span className="h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_rgba(140,230,255,0.9)]" />
                        <span className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_3px_rgba(140,230,255,0.85)]" />
                    </motion.span>
                ) : (
                    <span className="absolute inset-x-0 -bottom-0.5 h-[2px] origin-center scale-x-0 rounded-full bg-cyan-300/80 transition-transform duration-300 group-hover:scale-x-100" />
                )}
            </a>
        </li>
    );
}

/** "Hans Paladini" in the middle of the navbar: big at the top of the page, shrinks once you scroll. */
function BrandTitle({ show, reduce, compact, onClick }: { show: boolean; reduce: boolean; compact: boolean; onClick: () => void }) {
    const words = ["Hans", "Paladini"];
    let n = 0;
    return (
        <a
            href="#home"
            onClick={onClick}
            className="col-start-2 row-start-1 justify-self-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
        >
            <h1
                aria-label="Hans Paladini"
                className={`font-heading flex items-baseline gap-[0.45em] whitespace-nowrap font-normal uppercase leading-none tracking-[0.04em] text-white transition-[font-size] duration-500 ${compact ? "text-[clamp(1.3rem,2vw,2.3rem)]" : "text-[clamp(1.6rem,3.6vw,4.6rem)]"
                    }`}
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
                                    transition={{ delay: reduce ? 0 : 0.6 + i * 0.05, duration: 0.8, ease: EASE_OUT }}
                                >
                                    {ch}
                                </motion.span>
                            );
                        })}
                    </span>
                ))}
            </h1>
        </a>
    );
}