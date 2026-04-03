import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

/**
 * ProtectedRoute — faqat login qilgan foydalanuvchilar uchun.
 * Loading paytida spinner ko'rsatadi, so'ng redirect qiladi.
 */
const ProtectedRoute = () => {
	const { isAuthenticated, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-slate-50'>
				<div className='flex flex-col items-center gap-3'>
					<div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
					<p className='text-sm text-slate-500'>Yuklanmoqda...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		// Login qilingandan keyin qaytish uchun from state saqlash
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
