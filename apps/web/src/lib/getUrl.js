import useAuthStore from "@/stores/authStore";

const PRIVATE_MEDIA = /^\/uploads\/(lessons|documents)\//;

const getUrl = (url) => {
    if (!url) {
        return "";
    }

    // Ảnh vừa chọn từ máy
    if (url.startsWith("blob:")) {
        return url;
    }

    // BE/Cloud đã trả URL đầy đủ
    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    // URL tương đối từ BE
    const fullUrl = `${import.meta.env.VITE_API_URL}${url}`;

    // Học liệu nằm sau middleware auth, thẻ media không gắn được header
    if (!PRIVATE_MEDIA.test(url)) {
        return fullUrl;
    }

    const token =
        useAuthStore.getState().accessToken;

    return token
        ? `${fullUrl}?token=${encodeURIComponent(token)}`
        : fullUrl;
};

export default getUrl;
