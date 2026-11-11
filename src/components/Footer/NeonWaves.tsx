import { useEffect, useRef } from "react";

const CYCLE = 4.6;
const MEET = 0.55;
const SPARKS = 70;
const BLEED = 240; 

export default function NeonWaves({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        const ctx: CanvasRenderingContext2D = context;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let w = 0;
        let h = 0;
        let raf = 0;
        let visible = true;
        const start = performance.now();

        const sparks = Array.from({ length: SPARKS }, () => {
            const a = Math.random() * Math.PI * 2;
            const s = 80 + Math.random() * 320;
            return { vx: Math.cos(a) * s * 1.9, vy: Math.sin(a) * s * 0.8, size: 1.2 + Math.random() * 2.2 };
        });

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const r = canvas.getBoundingClientRect();
            w = r.width;
            h = r.height;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const io = new IntersectionObserver(([e]) => {
            const wasVisible = visible;
            visible = !!e?.isIntersecting;
            if (visible && !wasVisible && !reduce) {
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(draw);
            }
        });
        io.observe(canvas);

        const neon = (path: () => void, color: string, boost: number) => {
            const passes: Array<[number, number]> = [
                [10, 0.06],
                [5, 0.16],
                [2.4, 0.5],
                [1.1, 1],
            ];
            for (const [lw, a] of passes) {
                ctx.beginPath();
                path();
                ctx.lineWidth = lw;
                ctx.strokeStyle = color;
                ctx.globalAlpha = Math.min(1, a * boost);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        };

        function draw(now: number) {
            const t = (now - start) / 1000;
            const p = reduce ? 0 : (t % CYCLE) / CYCLE;
            const cy = h * 0.5; // bleed dono taraf barabar hai, center wahi rehta hai
            const cx = w / 2;
            const band = Math.max(1, h - BLEED * 2); // asal 160px wali patti

            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "lighter";

            const after = p - MEET;
            const flash = after >= 0 ? Math.exp(-after / 0.1) : 0;

            neon(
                () => {
                    ctx.moveTo(0, cy);
                    ctx.lineTo(w, cy);
                },
                "#ff3fd0",
                0.75 + flash * 1.2,
            );

            if (after < 0) {
                const s = p / MEET;
                const ease = s * s * (3 - 2 * s);
                const xl = ease * cx;
                const xr = w - ease * cx;
                const sigma = w * 0.09;
                const amp = band * 0.17 * (0.55 + 0.45 * ease);
                const k = (Math.PI * 2) / Math.max(60, w * 0.035);
                neon(
                    () => {
                        for (let x = 0; x <= w; x += 3) {
                            const el = Math.exp(-((x - xl) ** 2) / (2 * sigma * sigma));
                            const er = Math.exp(-((x - xr) ** 2) / (2 * sigma * sigma));
                            const y = cy + amp * (el * Math.sin(k * x - t * 9) + er * Math.sin(-k * x - t * 9));
                            if (x === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                    },
                    "#ff6ae0",
                    1,
                );
            }

            if (after >= 0) {
                const life = after * CYCLE;

                const r = 30 + life * 260;
                const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                g.addColorStop(0, `rgba(255,255,255,${0.9 * flash})`);
                g.addColorStop(0.3, `rgba(255,120,230,${0.6 * flash})`);
                g.addColorStop(1, "rgba(255,60,200,0)");
                ctx.fillStyle = g;
                ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

                const ring = Math.max(0, 1 - life / 0.9);
                if (ring > 0) {
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, 20 + life * 420, 6 + life * 70, 0, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255,170,240,${0.8 * ring})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                const reach = Math.min(1, life / 1.1) * cx;
                const fade = Math.max(0, 1 - life / 1.4);
                for (const dir of [-1, 1]) {
                    const x = cx + dir * reach;
                    const grd = ctx.createLinearGradient(x - dir * 240, 0, x, 0);
                    grd.addColorStop(0, "rgba(255,80,220,0)");
                    grd.addColorStop(1, `rgba(255,255,255,${fade})`);
                    ctx.strokeStyle = grd;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(x - dir * 240, cy);
                    ctx.lineTo(x, cy);
                    ctx.stroke();
                }

                const sparkFade = Math.max(0, 1 - life / 1.5);
                if (sparkFade > 0) {
                    for (const sp of sparks) {
                        const x = cx + sp.vx * life;
                        const y = cy + sp.vy * life + 60 * life * life;
                        ctx.globalAlpha = sparkFade;
                        ctx.fillStyle = "#ffd6f6";
                        ctx.fillRect(x, y, sp.size, sp.size);
                    }
                    ctx.globalAlpha = 1;
                }
            }

            ctx.globalCompositeOperation = "source-over";
            if (visible && !reduce) raf = requestAnimationFrame(draw);
        }

        raf = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 block w-full ${className}`}
            style={{ top: -BLEED, height: `calc(100% + ${BLEED * 2}px)` }}
        />
    );
}