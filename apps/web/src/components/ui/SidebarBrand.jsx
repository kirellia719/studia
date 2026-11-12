import Logo from "@/components/ui/Logo.jsx";

const SidebarBrand = ({ withTagline = true, className = "" }) => {
    return (
        <div className={["flex min-w-0 items-center gap-2.5", className].join(" ")}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[var(--line)]">
                <Logo size={40} className="h-full w-full object-contain" />
            </span>

            <span className="min-w-0">
                <span className="block truncate text-[16px] font-extrabold leading-5 tracking-tight text-[var(--ink)]">
                    Achan
                </span>

                {withTagline && (
                    <span className="block truncate text-[12px] font-medium leading-4 text-[var(--muted)]">
                        Học tiếng Lào
                    </span>
                )}
            </span>
        </div>
    );
};

export default SidebarBrand;
