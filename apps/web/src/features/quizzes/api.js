import apiClient from "@/lib/apiClient";

const quizApi = {
    // ==========================================
    // Teacher
    // ==========================================

    async getForTeacher(lessonId) {
        const response = await apiClient.get(
            `/quizzes/lessons/${lessonId}`
        );

        return response.data;
    },

    async save(lessonId, data) {
        const response = await apiClient.put(
            `/quizzes/lessons/${lessonId}`,
            data
        );

        return response.data;
    },

    async setPublished(lessonId, isPublished) {
        const response = await apiClient.patch(
            `/quizzes/lessons/${lessonId}/publish`,
            { isPublished }
        );

        return response.data;
    },

    async setRequiresPassForCompletion(
        lessonId,
        required
    ) {
        const response = await apiClient.patch(
            `/quizzes/lessons/${lessonId}/require-completion`,
            { required }
        );

        return response.data;
    },

    async remove(lessonId) {
        const response = await apiClient.delete(
            `/quizzes/lessons/${lessonId}`
        );

        return response.data;
    },

    // ==========================================
    // Student
    // ==========================================

    async getForStudent(lessonId) {
        const response = await apiClient.get(
            `/learning/lessons/${lessonId}/quiz`
        );

        return response.data;
    },

    async startAttempt(lessonId) {
        const response = await apiClient.post(
            `/learning/lessons/${lessonId}/quiz/attempts`
        );

        return response.data;
    },

    async saveAnswers(attemptId, answers) {
        const response = await apiClient.patch(
            `/learning/quiz-attempts/${attemptId}/answers`,
            { answers }
        );

        return response.data;
    },

    async submit(attemptId) {
        const response = await apiClient.post(
            `/learning/quiz-attempts/${attemptId}/submit`
        );

        return response.data;
    },

    async getResult(attemptId) {
        const response = await apiClient.get(
            `/learning/quiz-attempts/${attemptId}`
        );

        return response.data;
    },
};

export default quizApi;
