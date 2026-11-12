import apiClient from "@/lib/apiClient";

const learningApi = {
    async getMyCourses() {
        const response = await apiClient.get(
            "/learning/my-courses"
        );

        return response.data;
    },

    async getCourseForLearning(courseId) {
        const response = await apiClient.get(
            `/learning/courses/${courseId}`
        );

        return response.data;
    },

    async accessLesson(lessonId) {
        const response = await apiClient.post(
            `/learning/lessons/${lessonId}/access`
        );

        return response.data;
    },

    async updateVideoProgress(
        lessonId,
        { positionSeconds, durationSeconds }
    ) {
        const response = await apiClient.patch(
            `/learning/lessons/${lessonId}/progress`,
            { positionSeconds, durationSeconds }
        );

        return response.data;
    },

    async markReadingComplete(lessonId) {
        const response = await apiClient.post(
            `/learning/lessons/${lessonId}/reading`
        );

        return response.data;
    },

    async getCourseProgress(courseId) {
        const response = await apiClient.get(
            `/learning/courses/${courseId}/progress`
        );

        return response.data;
    },

    async getLessonProgress(lessonId) {
        const response = await apiClient.get(
            `/learning/lessons/${lessonId}/progress`
        );

        return response.data;
    },
};

export default learningApi;
