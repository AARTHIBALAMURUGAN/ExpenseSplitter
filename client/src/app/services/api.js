import axios from "axios";

const API = axios.create({
  baseURL: "https://expensesplitter-yj5b.onrender.com/",
});

API.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const roll = Math.random();
    if (roll < 0.10) {
      console.warn(" Chaos: slow response simulated");
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    if (roll >= 0.10 && roll < 0.18) {
      console.warn(" Chaos: failed request simulated");
      throw {
        message: "Server is busy — please try again",
        isChaos: true,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);
API.interceptors.response.use(
  (response) => {

    const roll = Math.random();
    if (roll < 0.05) {
      console.warn("⚠️ Chaos: duplicate data scenario");
    }
    return response;
  },
  (error) => {
    const message =
      error?.message ||
      error?.response?.data?.message ||
      "Something went wrong — please try again";

    return Promise.reject({ message });
  }
);

export default API;