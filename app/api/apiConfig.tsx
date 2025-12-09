export const BASE_URL = "http://172.24.169.183:8000/api";

export const API_URLS = {
    TANAMAN: `${BASE_URL}/tanaman`,
    PAKAN: `${BASE_URL}/pakan`,
    PANEN: `${BASE_URL}/panen`,
    KANDANG: `${BASE_URL}/kandang`,
    LOGIN: `${BASE_URL}/login`,
    SENSOR: `${BASE_URL}/sensor`,
    LOGOUT: `${BASE_URL}/logout`,
    SUPPLY: `${BASE_URL}/supply`,
    REGISTER: `${BASE_URL}/register`,
    USER: `${BASE_URL}/user`,
    PENGIRIMAN: `${BASE_URL}/pengiriman`,
    USER_KURIR: `${BASE_URL}/user?role=kurir`, // Endpoint untuk get user dengan role kurir
};