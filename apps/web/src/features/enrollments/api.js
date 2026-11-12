import apiClient from "@/lib/apiClient";

const enrollmentApi = {
    async getByCourse(courseId) {
        const response = await apiClient.get(
            `/enrollments/course/${courseId}`
        );

        return response.data;
    },

    async checkEnrollment(courseId, studentCode) {
        const response = await apiClient.get(
            `/enrollments/course/${courseId}/check`,
            {
                params: {
                    studentCode,
                },
            }
        );

        return response.data;
    },

    async enrollStudent(courseId, studentCode, data = {}) {
        const response = await apiClient.post(
            `/enrollments/course/${courseId}`,
            {
                studentCode,
                ...data,
            }
        );

        return response.data;
    },

    async getById(enrollmentId) {
        const response = await apiClient.get(
            `/enrollments/${enrollmentId}`
        );

        return response.data;
    },

    async updateExpiration(enrollmentId, durationMonths) {
        const response = await apiClient.patch(
            `/enrollments/${enrollmentId}/expiration`,
            {
                durationMonths,
            }
        );

        return response.data;
    },

    async remove(enrollmentId) {
        const response = await apiClient.delete(
            `/enrollments/${enrollmentId}`
        );

        return response.data;
    },
};

export default enrollmentApi;
