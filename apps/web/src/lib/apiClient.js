// src/api/apiClient.js

import axios from "axios";
import useAuthStore from "@/stores/authStore";

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    timeout: 10000,
    // Cần gửi kèm cookie để API đặt được cookie phiên media.
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken =
            useAuthStore.getState().accessToken;

        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// Response interceptor
// ==========================================

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status =
            error?.response?.status;

        if (status === 401) {
            // ProtectedRoute thấy token rỗng sẽ tự đưa về /login,
            // không reload cả trang như trước
            useAuthStore
                .getState()
                .logout();
        }

        return Promise.reject(error);
    }
);

export default apiClient;
