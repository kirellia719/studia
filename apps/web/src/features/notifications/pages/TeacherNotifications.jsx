import { useEffect, useState } from "react";

import { Bell } from "lucide-react";

import Loading from "@/components/ui/Loading.jsx";
import NotificationItem from "@/features/notifications/components/NotificationItem.jsx";
import appToast from "@/lib/toast.js";
import enrollmentApi from "@/features/enrollments/api.js";

const TeacherNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // Fetch notifications
    // ==========================================

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            // const response =
            //     await enrollmentApi.getTeacherPendingRequests();

            setNotifications([]);
        } catch (error) {
            console.error(
                "Get teacher notifications error:",
                error
            );

            appToast.error(
                error?.response?.data?.message ||
                "Không thể tải thông báo."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Initial fetch
    // ==========================================

    useEffect(() => {
        fetchNotifications();
    }, []);

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {
        return <Loading />;
    }

    // ==========================================
    // Render
    // ==========================================

    return (
        <div className="space-y-3">
            {/* ==================================
                Header
            ================================== */}

            <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-center gap-2">
                    <Bell
                        size={18}
                        className="text-[var(--brand-text)]"
                    />

                    <h1 className="text-base font-semibold text-[var(--ink)]">
                        Thông báo
                    </h1>
                </div>

                <p className="mt-1 text-xs text-[var(--muted)]">
                    Các thông báo và yêu cầu cần bạn
                    xử lý.
                </p>
            </div>

            {/* ==================================
                Empty
            ================================== */}

            {notifications.length === 0 ? (
                <div className="border border-[var(--line)] bg-[var(--surface)] px-4 py-12 text-center">
                    <div
                        className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-[var(--surface-3)]
                            text-[var(--faint)]
                        "
                    >
                        <Bell size={21} />
                    </div>

                    <p className="mt-3 text-sm font-medium text-[var(--muted)]">
                        Không có thông báo mới
                    </p>

                    <p className="mt-1 text-xs text-[var(--faint)]">
                        Hiện tại bạn không có thông báo
                        nào cần xử lý.
                    </p>
                </div>
            ) : (
                /* ==================================
                    Notification list
                ================================== */

                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onProcessed={(id) => {
                                setNotifications((prev) =>
                                    prev.filter(
                                        (item) => item.id !== id
                                    )
                                );
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherNotifications;