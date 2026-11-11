import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import { getRoleHome } from "@/lib/roles.js";

const RoleRoute = ({ allowedRoles }) => {
    const user = useAuthStore(
        (state) => state.user
    );

    if (!user) {
        return <Navigate
            to={"/login"}
            replace
        />;
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={getRoleHome(user.role)}
                replace
            />
        );
    }

    return <Outlet />;
};

export default RoleRoute;
