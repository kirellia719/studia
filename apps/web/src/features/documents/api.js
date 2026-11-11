import apiClient from "@/lib/apiClient";

const documentApi = {
    async getByLesson(lessonId) {
        const response = await apiClient.get(
            `/documents/lesson/${lessonId}`
        );

        return response.data;
    },

    async create(lessonId, formData) {
        const response = await apiClient.post(
            `/documents/lesson/${lessonId}`,
            formData,
            { timeout: 0 }
        );

        return response.data;
    },

    async download(documentId, fileName) {
        const response = await apiClient.get(
            `/documents/${documentId}/download`,
            { responseType: "blob" }
        );

        const blob = new Blob([response.data], {
            type:
                response.headers["content-type"] ||
                "application/octet-stream",
        });

        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement("a");

        link.href = url;
        link.download = fileName || "tai-lieu";

        window.document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    },

    async delete(documentId) {
        const response = await apiClient.delete(
            `/documents/${documentId}`
        );

        return response.data;
    },
};

export default documentApi;
