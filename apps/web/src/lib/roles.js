export const ROLE_HOME = {
    STUDENT: "/student",
    TEACHER: "/teacher",
    ADMIN: "/admin",
};

export const getRoleHome = (role) => {
    return ROLE_HOME[role] || "/login";
};
