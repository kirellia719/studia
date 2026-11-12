import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const DeleteCourseModal = ({
    open,
    courseTitle,
    deleting,
    onClose,
    onConfirm,
}) => {
    const [confirmText, setConfirmText] =
        useState("");

    useEffect(() => {
        if (open) {
            setConfirmText("");
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const canDelete =
        confirmText === courseTitle;

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/40
                px-4
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="
                    w-full
                    max-w-md
                    rounded-2xl
                    bg-[var(--surface)]
                    shadow-xl
                "
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                {/* Header */}

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
                        border-b
                        border-[var(--line)]
                        px-5
                        py-4
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[var(--danger-soft)]
                                text-[var(--danger)]
                            "
                        >
                            <AlertTriangle
                                size={18}
                            />
                        </div>

                        <h2
                            className="
                                    text-base
                                    font-semibold
                                    text-[var(--ink)]
                                "
                        >
                            Xóa khóa học
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-[var(--faint)]
                            transition
                            hover:bg-[var(--surface-2)]
                            hover:text-[var(--muted)]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}

                <div className="px-5 py-5">

                    <p
                        className="
                            text-sm
                            leading-6
                            text-[var(--muted)]
                        "
                    >
                        Để xác nhận, hãy nhập chính xác
                        tên khóa học vào ô bên dưới.
                    </p>

                    <input
                        type="text"
                        value={confirmText}
                        onChange={(event) =>
                            setConfirmText(
                                event.target.value
                            )
                        }
                        placeholder={courseTitle}
                        disabled={deleting}
                        autoFocus
                        className="
                            mt-3
                            w-full
                            rounded-full
                            border
                            border-[var(--line)]
                            px-3
                            py-2.5
                            text-sm
                            text-[var(--ink)]
                            outline-none
                            transition
                            placeholder:text-[var(--faint)]
                            focus:border-red-400
                            focus:ring-2
                            focus:ring-red-100
                            disabled:bg-[var(--surface-2)]
                        "
                    />
                </div>

                {/* Footer */}

                <div
                    className="
                        flex
                        flex-row
                        justify-end
                        gap-2
                        border-t
                        border-[var(--line)]
                        px-5
                        py-4
                    "
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="
                            rounded-full
                            border
                            border-[var(--line)]
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-[var(--muted)]
                            transition
                            hover:bg-[var(--surface-3)]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={
                            !canDelete ||
                            deleting
                        }
                        className="
                            rounded-full
                            bg-[var(--danger-solid)]
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[var(--danger-solid)]
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        {deleting
                            ? "Đang xóa..."
                            : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCourseModal;