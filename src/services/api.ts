import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor xử lý lỗi và token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401, 403, v.v.
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Chuyển hướng về trang đăng nhập nếu hết phiên làm việc
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default api;
