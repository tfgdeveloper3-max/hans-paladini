export function idlePreload(srcs: string[]) {
    let cancelled = false;
    const idle = (cb: () => void) =>
        typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 2000 }) : window.setTimeout(cb, 250);

    const next = (k: number) => {
        if (cancelled || k >= srcs.length) return;
        idle(() => {
            if (cancelled) return;
            const img = new Image();
            img.decoding = "async";
            img.src = srcs[k]!;
            img.decode().catch(() => undefined).finally(() => next(k + 1));
        });
    };

    next(0);
    return () => {
        cancelled = true;
    };
}