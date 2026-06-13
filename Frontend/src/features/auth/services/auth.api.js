import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export async function register({ fullname, username, email, password, otp }) {
  try {
    const response = await api.post("/api/auth/register", {
      fullname,
      username,
      email,
      password,
      otp,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getme() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function forgotPasswordSendOTP({ email }) {
  try {
    const response = await api.post("/api/auth/forgot-password/send-otp", { email });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function forgotPasswordReset({ email, otp, newPassword }) {
  try {
    const response = await api.post("/api/auth/forgot-password/reset", { email, otp, newPassword });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}