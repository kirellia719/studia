import apiClient from "@/lib/apiClient";
import useAuthStore from "@/stores/authStore";

const authApi = {
    async login({ email, password }) {
        const response = await apiClient.post(
            "/auth/login",
            { email, password }
        );

        const { success, message, data } = response.data;

        if (!success || !data?.accessToken) {
            throw new Error(
                message || "Đăng nhập không thành công."
            );
        }

        useAuthStore
            .getState()
            .setAccessToken(data.accessToken);

        if (data.user) {
            useAuthStore
                .getState()
                .setUser(data.user);
        }

        return {
            message,
            data,
        };
    },

    async register({ name, email, password }) {
        const response = await apiClient.post(
            "/auth/register",
            { name, email, password }
        );

        const { success, message, data } = response.data;

        if (!success) {
            throw new Error(
                message || "Đăng ký không thành công."
            );
        }

        return {
            message,
            data,
        };
    },

    async logout() {
        useAuthStore
            .getState()
            .logout();
    },

    // Cấp cookie ngắn hạn cho /uploads, để thẻ media
    // tải học liệu mà không cần token trong URL.
    async openMediaSession() {
        await apiClient.get("/auth/media-session");
    },
};

export default authApi;
