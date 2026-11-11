import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { getRoleHome, getRoleFromToken } from '@/lib/roles.js';

const GuestRoute = ({ children, redirectTo }) => {
    const token = useAuthStore((state) => state.accessToken);
    const user = useAuthStore((state) => state.user);

    if (!token) {
        return children || <Outlet />;
    }

    const role = user?.role || getRoleFromToken(token);

    return (
        <Navigate
            to={redirectTo || (role ? getRoleHome(role) : '/')}
            replace
        />
    );
};

export default GuestRoute;
