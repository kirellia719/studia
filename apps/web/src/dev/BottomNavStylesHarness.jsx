import { createRoot } from "react-dom/client";
import { BookOpen, Compass, UserRound } from "lucide-react";

import "@/styles/index.css";

const items = [
    { label: "Học tập", icon: BookOpen },
    { label: "Khám phá", icon: Compass },
    { label: "Hồ sơ", icon: UserRound },
];

const ItemShell = ({ children }) => (
    <a
        href="#"
        onClick={(event) => event.preventDefault()}
        className="flex flex-1 items-center justify-center px-2"
    >
        {children}
    </a>
);

const VariantPillIcon = () => (
    <div className="flex h-16 flex-1 border-t border-[var(--line)] bg-[var(--surface)]">
        {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;

            return (
                <ItemShell key={item.label}>
                    <span
                        className={[
                            "flex flex-col items-center justify-center gap-1",
                            "text-[12px] leading-none",
                            isActive
                                ? "font-semibold text-[var(--brand-text)]"
                                : "font-medium text-[var(--muted)]",
                        ].join(" ")}
                    >
                        <span
                            className={[
                                "flex h-7 w-12 items-center justify-center rounded-full",
                                isActive ? "bg-[var(--brand-soft)]" : "",
                            ].join(" ")}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.2 : 1.8}
                            />
                        </span>
                        <span>{item.label}</span>
                    </span>
                </ItemShell>
            );
        })}
    </div>
);

const VariantBlock = () => (
    <div className="flex h-16 flex-1 border-t border-[var(--line)] bg-[var(--surface)]">
        {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;

            return (
                <ItemShell key={item.label}>
                    <span
                        className={[
                            "flex min-w-[72px] flex-col items-center justify-center gap-1",
                            "rounded-2xl px-4 py-1.5",
                            "text-[12px] leading-none",
                            isActive
                                ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                                : "font-medium text-[var(--muted)]",
                        ].join(" ")}
                    >
                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                    </span>
                </ItemShell>
            );
        })}
    </div>
);

const VariantTopBar = () => (
    <div className="flex h-16 flex-1 border-t border-[var(--line)] bg-[var(--surface)]">
        {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;

            return (
                <ItemShell key={item.label}>
                    <span
                        className={[
                            "relative flex h-full w-full flex-col items-center justify-center gap-1",
                            "text-[12px] leading-none",
                            isActive
                                ? "font-semibold text-[var(--brand-text)]"
                                : "font-medium text-[var(--muted)]",
                        ].join(" ")}
                    >
                        <span
                            aria-hidden="true"
                            className={[
                                "absolute left-1/2 top-0 h-[3px] w-10 -translate-x-1/2",
                                "rounded-b-full",
                                isActive
                                    ? "bg-[var(--brand-solid)]"
                                    : "opacity-0",
                            ].join(" ")}
                        />

                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                    </span>
                </ItemShell>
            );
        })}
    </div>
);

const VariantChipLabel = () => (
    <div className="flex h-16 flex-1 border-t border-[var(--line)] bg-[var(--surface)]">
        {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;

            return (
                <ItemShell key={item.label}>
                    <span className="flex flex-col items-center justify-center gap-1.5">
                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2.2 : 1.8}
                            className={
                                isActive
                                    ? "text-[var(--brand-text)]"
                                    : "text-[var(--muted)]"
                            }
                        />

                        <span
                            className={[
                                "rounded-full px-2.5 py-0.5 text-[11px] leading-none",
                                isActive
                                    ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                                    : "font-medium text-[var(--muted)]",
                            ].join(" ")}
                        >
                            {item.label}
                        </span>
                    </span>
                </ItemShell>
            );
        })}
    </div>
);

const VariantSolidBrand = () => (
    <div className="flex h-16 flex-1 border-t border-[var(--line)] bg-[var(--surface)]">
        {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0;

            return (
                <ItemShell key={item.label}>
                    <span
                        className={[
                            "flex min-w-[72px] flex-col items-center justify-center gap-1",
                            "rounded-2xl px-4 py-1.5",
                            "text-[12px] leading-none",
                            isActive
                                ? "bg-[var(--brand-solid)] font-semibold text-white"
                                : "font-medium text-[var(--muted)]",
                        ].join(" ")}
                    >
                        <Icon
                            size={20}
                            strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                    </span>
                </ItemShell>
            );
        })}
    </div>
);

const variants = [
    {
        key: "pill-icon",
        title: "A · Nền pill sau icon",
        description: "Nền nhẹ chỉ bọc icon, nhãn nằm dưới.",
        render: <VariantPillIcon />,
    },
    {
        key: "block",
        title: "B · Khối nền ôm icon + nhãn (đang dùng)",
        description: "Cả icon và nhãn nằm trong một khối bo góc.",
        render: <VariantBlock />,
    },
    {
        key: "top-bar",
        title: "C · Gạch chỉ báo trên đỉnh",
        description: "Không nền, thêm gạch màu thương hiệu ở mép trên.",
        render: <VariantTopBar />,
    },
    {
        key: "chip-label",
        title: "D · Nhãn dạng viên thuốc",
        description: "Icon trần, nhãn được bọc trong viên thuốc khi active.",
        render: <VariantChipLabel />,
    },
    {
        key: "solid-brand",
        title: "E · Nền đặc màu thương hiệu",
        description:
            "Nền #E89A00 bọc icon + nhãn, icon và nhãn màu trắng, bo 16px, chừa lề quanh khối.",
        render: <VariantSolidBrand />,
    },
];

const Demo = () => (
    <div className="app-canvas min-h-dvh space-y-5 px-3 py-5">
        <header>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
                Kiểu active cho bottom navigation
            </h1>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
                Tab “Học tập” đang ở trạng thái active trong mỗi kiểu.
            </p>
        </header>

        {variants.map((variant) => (
            <section
                key={variant.key}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
            >
                <div className="px-4 py-2.5">
                    <p className="text-[13px] font-semibold text-[var(--ink)]">
                        {variant.title}
                    </p>
                    <p className="text-[12px] text-[var(--muted)]">
                        {variant.description}
                    </p>
                </div>

                {variant.render}
            </section>
        ))}
    </div>
);

createRoot(document.getElementById("root")).render(<Demo />);
