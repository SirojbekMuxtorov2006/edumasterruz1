import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

type Status = 'loading' | 'success' | 'error';

const Verify = () => {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const { verifyEmail } = useAuth();

	const [status, setStatus] = useState<Status>('loading');
	const [message, setMessage] = useState('');

	// verifyEmail referensini saqlash — effect qayta ishlamasin
	const verifyRef = useRef(verifyEmail);
	useEffect(() => {
		verifyRef.current = verifyEmail;
	}, [verifyEmail]);

	useEffect(() => {
		const token = params.get('token');
		if (!token) {
			setStatus('error');
			setMessage("Tasdiqlash kodi topilmadi. Havola noto'g'ri.");
			return;
		}

		let cancelled = false;

		(async () => {
			try {
				await verifyRef.current(token);
				if (cancelled) return;
				setStatus('success');
				setMessage('Email muvaffaqiyatli tasdiqlandi!');
				setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
			} catch (err: unknown) {
				if (cancelled) return;
				setStatus('error');
				setMessage(err instanceof Error ? err.message : 'Tasdiqlashda xatolik yuz berdi.');
			}
		})();

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
			<Card className='w-full max-w-md shadow-xl text-center border-indigo-100'>
				<CardHeader>
					<div className='mx-auto mb-4'>
						{status === 'loading' && <Loader2 className='w-16 h-16 text-indigo-600 animate-spin' />}
						{status === 'success' && <CheckCircle className='w-16 h-16 text-green-600' />}
						{status === 'error' && <XCircle className='w-16 h-16 text-red-600' />}
					</div>
					<CardTitle className='text-2xl font-bold'>
						{status === 'loading'
							? 'Tasdiqlanmoqda...'
							: status === 'success'
								? 'Tasdiqlandi!'
								: 'Xatolik!'}
					</CardTitle>
					<CardDescription className='text-base mt-2'>
						{message || 'Iltimos, kuting...'}
					</CardDescription>
				</CardHeader>

				<CardContent className='space-y-3'>
					{status === 'success' && (
						<Button onClick={() => navigate('/dashboard')} className='w-full bg-indigo-600'>
							Dashboardga o'tish
						</Button>
					)}
					{status === 'error' && (
						<>
							<Button onClick={() => navigate('/register')} className='w-full bg-indigo-600'>
								Qayta ro'yxatdan o'tish
							</Button>
							<Button variant='outline' onClick={() => navigate('/login')} className='w-full'>
								Kirish sahifasiga o'tish
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Verify;
