export const getAuthToken = () => {
    return window.localStorage.getItem('token');
};

export const setAuthHeader = (token: string | null) => {
    if (token !== null) {
        window.localStorage.setItem("token", token);
    } else {
        window.localStorage.removeItem("token");
    }
};