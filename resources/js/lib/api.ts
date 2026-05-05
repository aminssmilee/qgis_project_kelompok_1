import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default api;
