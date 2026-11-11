import apiClient from "@/lib/apiClient";
import useAuthStore from "@/stores/authStore";

const profileApi = {
    async getMe() {
        const response = await apiClient.get("/users/me");

        const { success, message, data } = response.data;

        if (!success || !data) {
            throw new Error(
                message ||
                    "Không thể lấy thông tin người dùng."
            );
        }

        useAuthStore
            .getState()
            .setUser(data);

        return {
            message,
            data,
        };
    },

    async changePassword(form) {
        const response = await apiClient.put(
            "/users/me/password",
            form
        );

        return response.data;
    },

    async updateMe(data) {
        const response = await apiClient.put(
            "/users/me",
            data
        );

        return response.data;
    },

    async deleteMe() {
        const response = await apiClient.delete(
            "/users/me"
        );

        return response.data;
    },

    async getById(userId) {
        const response = await apiClient.get(
            `/users/${userId}`
        );

        return response.data;
    },

    async restore(userId) {
        const response = await apiClient.patch(
            `/users/${userId}/restore`
        );

        return response.data;
    },
};

export default profileApi;
