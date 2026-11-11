import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import useAuthStore from "@/stores/authStore";
import Loading from "@/components/ui/Loading.jsx";
import profileApi from "@/features/profile/api.js";

const ProtectedRoute = ({ redirectTo = "/login" }) => {
    const accessToken = useAuthStore(
        (state) => state.accessToken
    );

    const user = useAuthStore(
        (state) => state.user
    );

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                if (!user) {
                    await profileApi.getMe();
                }
            } catch (error) {
                console.log("Protected Error:", error);
                useAuthStore.getState().logout();
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [accessToken, user]);

    if (!accessToken) {
        return (
            <Navigate
                to={redirectTo}
                replace
            />
        );
    }

    if (loading) {
        return (
            <Loading text="Đang kiểm tra tài khoản..." />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;