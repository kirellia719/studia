import { useEffect, useRef, useState } from "react";
import { Check, Palette, X } from "lucide-react";

import { THEMES } from "@/lib/themes.js";
import useThemeStore from "@/stores/themeStore.js";

const Swatch = ({ colors }) => (
    <span className="flex shrink-0 overflow-hidden rounded-full border border-[var(--line)]">
        {colors.map((color) => (
            <span
                key={color}
                className="h-4 w-2.5"
                style={{ backgroundColor: color }}
            />
        ))}
    </span>
);

const ThemeList = ({ theme, onPick }) => (
    <div role="listbox" aria-label="Chọn giao diện" className="space-y-1">
        {THEMES.map((item) => {
            const active = item.id === theme;

            return (
                <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => onPick(item.id)}
                    className={[
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                        active
                            ? "bg-[var(--brand-soft)]"
                            : "hover:bg-[var(--surface-2)]",
                    ].join(" ")}
                >
                    <Swatch colors={item.swatch} />

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-[var(--ink)]">
                            {item.label}
                        </span>

                        <span className="block truncate text-[12px] text-[var(--muted)]">
                            {item.hint}
                        </span>
                    </span>

                    {active && (
                        <Check
                            size={16}
                            strokeWidth={2.5}
                            className="shrink-0 text-[var(--brand-text)]"
                        />
                    )}
                </button>
            );
        })}
    </div>
);

const ThemeSwitcher = ({ variant = "sidebar", className = "" }) => {
    const theme = useThemeStore((state) => state.theme);
    const setTheme = useThemeStore((state) => state.setTheme);

    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];

    const pick = (id) => {
        setTheme(id);
        setOpen(false);
    };

    if (variant === "floating") {
        return (
            <div ref={rootRef} className={`relative ${className}`}>
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-label="Chọn giao diện"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] shadow-sm transition-colors hover:border-[var(--brand)]/40 hover:bg-[var(--surface-2)] hover:text-[var(--brand-text)]"
                >
                    <Palette size={17} strokeWidth={2} />
                </button>

                {open && (
                    <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl">
                        <p className="px-2 pb-1.5 pt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                            Giao diện
                        </p>

                        <ThemeList theme={theme} onPick={pick} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Giao diện: ${current.label}`}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[var(--ink-2)] transition-colors hover:bg-[var(--surface-2)]"
            >
                <Palette size={16} strokeWidth={2} className="shrink-0" />

                <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                    Giao diện
                </span>

                <Swatch colors={current.swatch} />
            </button>

            {open && (
                <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl">
                    <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                            Giao diện
                        </p>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Đóng"
                            className="rounded-full p-0.5 text-[var(--faint)] transition-colors hover:text-[var(--ink)]"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    <ThemeList theme={theme} onPick={pick} />
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
