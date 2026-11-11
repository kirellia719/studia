import apiClient from "@/lib/apiClient";

const courseApi = {
    // ==============================
    // PUBLIC
    // ==============================

    async searchPublishedCourses({ search, page, limit } = {}) {
        const response = await apiClient.get(
            "/courses/search",
            {
                params: {
                    search,
                    page,
                    limit,
                },
            }
        );

        return response.data;
    },

    async getCourseDetails(courseId) {
        const response = await apiClient.get(
            `/courses/${courseId}`
        );

        return response.data;
    },

    // ==============================
    // TEACHER
    // ==============================

    async createCourse(data) {
        const response = await apiClient.post(
            "/courses",
            data
        );

        return response.data;
    },

    async getMyCourses({ page, limit } = {}) {
        const response = await apiClient.get(
            "/courses/my",
            {
                params: {
                    page,
                    limit,
                },
            }
        );

        return response.data;
    },

    async updateCourse(courseId, data) {
        const response = await apiClient.put(
            `/courses/${courseId}`,
            data
        );

        return response.data;
    },

    async deleteCourse(courseId) {
        const response = await apiClient.delete(
            `/courses/${courseId}`
        );

        return response.data;
    },

    // ==============================
    // ADMIN
    // ==============================

    async getActiveCourses({ page, limit } = {}) {
        const response = await apiClient.get(
            "/courses/admin/active",
            {
                params: {
                    page,
                    limit,
                },
            }
        );

        return response.data;
    },

    async getDeletedCourses({ page, limit } = {}) {
        const response = await apiClient.get(
            "/courses/admin/deleted",
            {
                params: {
                    page,
                    limit,
                },
            }
        );

        return response.data;
    },

    async restoreCourse(courseId) {
        const response = await apiClient.patch(
            `/courses/admin/${courseId}/restore`
        );

        return response.data;
    },
};

export default courseApi;
