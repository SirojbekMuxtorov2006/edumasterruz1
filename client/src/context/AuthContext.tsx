/**
 * AuthContext — backend bilan to'g'ri ishlash uchun yaxshilangan versiya.
 *
 * O'zgarishlar:
 * - localStorage fallback olib tashlandi (xavfsizlik uchun)
 * - /auth/me har doim User ni to'g'ridan qaytaradi
 * - signUp payload'i to'g'rilandi (full_name → backend)
 * - auth:logout eventi orqali interceptordan chiqish
 * - loading holati to'g'ri boshqariladi
 */

import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import axios, { AxiosError } from 'axios';
import api from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
	id: number;
	email: string;
	is_verified: boolean;
	is_admin: boolean;
	created_at: string;
	full_name?: string;
	level?: string;
	coins?: number;
}

type AuthResponse = {
	message: string;
	user: User | null;
};

export type AuthContextType = {
	user: User | null;
	loading: boolean;
	error: string | null;
	isAuthenticated: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (payload: { email: string; password: string; fullName: string }) => Promise<void>;
	signOut: () => Promise<void>;
	verifyEmail: (token: string) => Promise<void>;
	checkAuth: () => Promise<void>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const getErrorMessage = (err: unknown, fallback: string): string => {
	if (axios.isAxiosError(err)) {
		const detail = err.response?.data?.detail;
		if (typeof detail === 'string') return detail;
		if (Array.isArray(detail) && detail.length > 0) {
			return detail.map((d: { msg?: string }) => d.msg ?? fallback).join(', ');
		}
	}
	if (err instanceof Error) return err.message;
	return fallback;
};

// /auth/me backend'da User to'g'ridan yoki {message, user} ichida qaytarishi mumkin
function extractUser(data: User | AuthResponse | null): User | null {
	if (!data) return null;
	if ('email' in data && 'id' in data) return data as User;
	return (data as AuthResponse).user ?? null;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// -----------------------------------------------------------------------
	// checkAuth — mount'da session tiklash
	// -----------------------------------------------------------------------
	const checkAuth = useCallback(async () => {
		setLoading(true);
		try {
			// Bitta so‘rov: 401 yo‘q — /auth/session cookie + tokenlarni serverda tekshiradi
			const { data } = await api.get<{
				authenticated: boolean;
				user: User | null;
			}>('/auth/session', { skipAuthRefresh: true });
			setUser(data.authenticated && data.user ? data.user : null);
		} catch (err) {
			console.error('[checkAuth] unexpected error:', err);
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// interceptor'dan kelgan logout eventi
	useEffect(() => {
		const handler = () => {
			setUser(null);
		};
		window.addEventListener('auth:logout', handler);
		return () => window.removeEventListener('auth:logout', handler);
	}, []);

	// -----------------------------------------------------------------------
	// signIn
	// -----------------------------------------------------------------------
	const signIn = useCallback(
		async (email: string, password: string): Promise<void> => {
			setError(null);
			try {
				const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
				if (data.user) {
					setUser(data.user);
				} else {
					// Login muvaffaqiyatli — /auth/me dan user olish
					await checkAuth();
				}
			} catch (err) {
				const msg = getErrorMessage(err, "Email yoki parol noto'g'ri");
				setError(msg);
				throw new Error(msg);
			}
		},
		[checkAuth],
	);

	// -----------------------------------------------------------------------
	// signUp
	// -----------------------------------------------------------------------
	const signUp = useCallback(
		async (payload: { email: string; password: string; fullName: string }): Promise<void> => {
			setError(null);
			try {
				await api.post<AuthResponse>('/auth/register', {
					email: payload.email,
					password: payload.password,
					full_name: payload.fullName,
				});
				// Register muvaffaqiyatli — email tekshirish kerak, login qilinmaydi
			} catch (err) {
				const msg = getErrorMessage(err, "Ro'yxatdan o'tishda xatolik");
				setError(msg);
				throw new Error(msg);
			}
		},
		[],
	);

	// -----------------------------------------------------------------------
	// verifyEmail
	// -----------------------------------------------------------------------
	const verifyEmail = useCallback(
		async (token: string): Promise<void> => {
			setError(null);
			try {
				await api.get('/auth/verify', { params: { token } });
				// Backend cookie o'rnatadi — /auth/me dan user olamiz
				await checkAuth();
			} catch (err) {
				const msg = getErrorMessage(err, 'Email tasdiqlashda xatolik');
				setError(msg);
				throw new Error(msg);
			}
		},
		[checkAuth],
	);

	// -----------------------------------------------------------------------
	// signOut
	// -----------------------------------------------------------------------
	const signOut = useCallback(async (): Promise<void> => {
		try {
			await api.post('/auth/logout');
		} catch {
			// Server xatosi bo'lsa ham local state tozalansin
		} finally {
			setUser(null);
		}
	}, []);

	// -----------------------------------------------------------------------
	// Context value
	// -----------------------------------------------------------------------
	const value = useMemo<AuthContextType>(
		() => ({
			user,
			loading,
			error,
			isAuthenticated: !!user,
			signIn,
			signUp,
			signOut,
			verifyEmail,
			checkAuth,
		}),
		[user, loading, error, signIn, signUp, signOut, verifyEmail, checkAuth],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
