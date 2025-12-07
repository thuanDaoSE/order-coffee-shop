import axios from 'axios';

// 1. Hàm lấy Cookie (Giữ nguyên)
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// 2. Tạo instance (Giữ nguyên)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 3. Request Interceptor: Tự động gắn CSRF Token vào mọi request (Giữ nguyên)
api.interceptors.request.use(config => {
  const csrfToken = getCookie('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
}, error => Promise.reject(error));

// 4. Response Interceptor: Xử lý Refresh Token (Đã sửa lỗi 1 & 3)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 (Hết hạn) và chưa từng thử lại (tránh lặp vô tận)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // --- VÁ LỖI SỐ 1: Lấy thủ công CSRF Token hiện tại ---
        // Lý do: Lệnh axios.post bên dưới là instance gốc, nó không chạy qua interceptor bên trên
        // nên ta phải tự tay gắn header vào để không bị Spring chặn (Lỗi 403).
        const csrfToken = getCookie('XSRF-TOKEN');

        // Gọi API Refresh
        await axios.post("/api/v1/auth/refresh", {}, { 
            baseURL: import.meta.env.VITE_API_URL, 
            withCredentials: true,
            headers: {
                'X-XSRF-TOKEN': csrfToken // <--- Gắn token vào đây
            }
        });

        // --- VÁ LỖI SỐ 3: Gọi lại request ban đầu ---
        // Lưu ý: Ta dùng 'api(originalRequest)' thay vì 'axios(originalRequest)'
        // Lý do: Biến 'api' sẽ chạy lại qua Request Interceptor (bước 3),
        // nó sẽ tự động đọc Cookie mới nhất (vừa được cập nhật sau khi refresh) để gắn vào.
        return api(originalRequest);

      } catch (refreshError) {
        // Nếu refresh cũng thất bại (Hết hạn hẳn) -> Logout
        console.error("Refresh token failed, logging out.");
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;