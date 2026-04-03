/// <reference types="vite/client" />

import "axios";

declare module "axios" {
	interface AxiosRequestConfig {
		/** 401 bo‘lsa /auth/refresh ga avtomat urinmaydi (sessiya tekshiruvi uchun) */
		skipAuthRefresh?: boolean;
	}
}
