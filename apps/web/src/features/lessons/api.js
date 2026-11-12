import apiClient from "@/lib/apiClient";

const lessonApi = {
    async getLessonsByCourse(courseId) {
        const response = await apiClient.get(
            `/lessons/course/${courseId}`
        );

        return response.data;
    },

    async getById(lessonId) {
        const response = await apiClient.get(
            `/lessons/${lessonId}`
        );

        return response.data;
    },

    async create(courseId, data, onProgress) {
        const response = await apiClient.post(
            `/lessons/course/${courseId}`,
            data,
            {
                timeout: 0,

                onUploadProgress: (event) => {
                    if (!event.total) {
                        return;
                    }

                    const progress = Math.round(
                        (event.loaded * 100) /
                        event.total
                    );

                    onProgress?.(progress);
                },
            }
        );

        return response.data;
    },

    async update(lessonId, data, onProgress) {
        const response = await apiClient.put(
            `/lessons/${lessonId}`,
            data,
            {
                timeout: 0,

                onUploadProgress: (event) => {
                    if (!event.total) {
                        return;
                    }

                    const progress = Math.round(
                        (event.loaded * 100) /
                        event.total
                    );

                    onProgress?.(progress);
                },
            }
        );

        return response.data;
    },

    async delete(lessonId) {
        const response = await apiClient.delete(
            `/lessons/${lessonId}`
        );

        return response.data;
    },

    async move(lessonId, direction) {
        const response = await apiClient.put(
            `/lessons/${lessonId}/move`,
            { direction }
        );

        return response.data;
    },

    async restore(lessonId) {
        const response = await apiClient.patch(
            `/lessons/${lessonId}/restore`
        );

        return response.data;
    },
};

export default lessonApi;
