export const ROLE_HOME = {
    STUDENT: "/student",
    TEACHER: "/teacher",
    ADMIN: "/admin",
};

export const getRoleHome = (role) => {
    return ROLE_HOME[role] || "/login";
};

export const getRoleFromToken = (token) => {
    try {
        const payload = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);

        return JSON.parse(atob(padded)).role || null;
    } catch {
        return null;
    }
};
