import axios, { AxiosError } from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || '/api',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Response interceptor: 401 da refresh qilishga urinadi
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: AxiosError | null) {
	failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(null)));
	failedQueue = [];
}

api.interceptors.response.use(
	res => res,
	async (error: AxiosError) => {
		const original = error.config as typeof error.config & {
			_retry?: boolean;
			skipAuthRefresh?: boolean;
		};

		// Sessiya tekshiruvi: 401 ni to‘g‘ridan-to‘g‘ri qaytarish (cheksiz refresh tsiklini oldini olish)
		if (original?.skipAuthRefresh) {
			return Promise.reject(error);
		}

		// 401 va retry qilinmagan bo'lsa — token refresh
		if (
			error.response?.status === 401 &&
			!original?._retry &&
			original?.url !== '/auth/refresh' &&
			original?.url !== '/auth/login'
		) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => api(original!))
					.catch(e => Promise.reject(e));
			}

			original!._retry = true;
			isRefreshing = true;

			try {
				await axios.post(
					`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
					{},
					{ withCredentials: true },
				);
				processQueue(null);
				return api(original!);
			} catch (refreshError) {
				processQueue(refreshError as AxiosError);
				// Refresh ham ishlamadi — sessionni tozalash
				window.dispatchEvent(new CustomEvent('auth:logout'));
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

export default api;
