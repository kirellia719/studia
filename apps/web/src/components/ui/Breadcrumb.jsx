import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumb = ({
    items = [],
    className = "",
    currentAs: CurrentTag = "span",
}) => {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`
                flex
                min-w-0
                items-center
                gap-1.5
                text-sm
                ${className}
            `}
        >
            {items.map((item, index) => {
                const isLast =
                    index === items.length - 1;

                const TextTag = isLast
                    ? CurrentTag
                    : "span";

                return (
                    <div
                        key={`${item.label}-${index}`}
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                        "
                    >
                        {index > 0 && (
                            <ChevronRight
                                size={15}
                                className="
                                    shrink-0
                                    text-gray-300
                                "
                            />
                        )}

                        {isLast || !item.to ? (
                            <TextTag
                                className={`
                                    min-w-0
                                    truncate
                                    ${isLast
                                        ? "font-medium text-[var(--ink)]"
                                        : "text-[var(--muted)]"
                                    }
                                `}
                                title={item.label}
                            >
                                {item.icon && (
                                    <item.icon
                                        size={16}
                                        className="
                                            mr-1.5
                                            inline-block
                                            align-[-3px]
                                        "
                                    />
                                )}

                                {item.label}
                            </TextTag>
                        ) : (
                            <Link
                                to={item.to}
                                className="
                                    inline-flex
                                    min-w-0
                                    shrink-0
                                    -my-1
                                    items-center
                                    py-1
                                    text-[var(--muted)]
                                    transition
                                    hover:text-[var(--brand-text)]
                                "
                                title={item.label}
                            >
                                {item.icon && (
                                    <item.icon
                                        size={16}
                                        className="
                                            mr-1.5
                                            shrink-0
                                        "
                                    />
                                )}

                                <span className="truncate">
                                    {item.label}
                                </span>
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;
