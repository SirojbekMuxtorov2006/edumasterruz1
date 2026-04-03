import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, MailCheck, User, UserPlus } from 'lucide-react';

// Backend xato kalitlarini o'zbekchaga tarjima
const ERROR_MAP: Record<string, string> = {
	email_already_exists: "Bu email allaqachon ro'yxatdan o'tgan.",
	invalid_email: "Email manzil noto'g'ri formatda.",
	password_too_short: "Parol kamida 8 ta belgidan iborat bo'lishi kerak.",
	internal_error: "Server xatosi. Keyinroq urinib ko'ring.",
};

const translateError = (msg: string) => ERROR_MAP[msg] ?? msg;

const Register = () => {
	const { signUp } = useAuth();

	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting) return;

		// Frontend validatsiya
		if (password.length < 8) {
			setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
			return;
		}

		setError(null);
		setSubmitting(true);
		try {
			await signUp({ email: email.trim(), password, fullName: fullName.trim() });
			setIsSuccess(true);
		} catch (err: unknown) {
			const raw = err instanceof Error ? err.message : 'Xatolik yuz berdi';
			setError(translateError(raw));
		} finally {
			setSubmitting(false);
		}
	};

	// Muvaffaqiyatli ro'yxatdan o'tish
	if (isSuccess) {
		return (
			<div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
				<Card className='w-full max-w-md shadow-2xl text-center p-8 border-green-100'>
					<div className='mx-auto bg-green-50 p-4 rounded-full w-fit mb-4'>
						<MailCheck className='w-12 h-12 text-green-600' />
					</div>
					<h2 className='text-2xl font-bold text-slate-900 mb-3'>Pochtangizni tekshiring</h2>
					<p className='text-slate-600 mb-6'>
						<strong>{email}</strong> manziliga tasdiqlash xati yuborildi. Havola orqali hisobingizni
						faollashtiring.
					</p>
					<Button
						onClick={() => (window.location.href = '/login')}
						className='w-full bg-indigo-600 hover:bg-indigo-700 h-11'
					>
						Kirish sahifasiga o'tish
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
			<Card className='w-full max-w-md shadow-xl border-indigo-100'>
				<CardHeader className='text-center'>
					<div className='mx-auto bg-indigo-50 p-3 rounded-full w-fit mb-2'>
						<UserPlus className='w-8 h-8 text-indigo-600' />
					</div>
					<CardTitle className='text-2xl font-bold'>Ro'yxatdan o'tish</CardTitle>
					<CardDescription>Turon Olimpiadasi tizimida hisob yarating</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='fullName'>To'liq ism va familiya</Label>
							<div className='relative'>
								<User className='absolute left-3 top-2.5 w-4 h-4 text-slate-400' />
								<Input
									id='fullName'
									placeholder='Ali Valiyev'
									className='pl-10'
									value={fullName}
									onChange={e => setFullName(e.target.value)}
									autoComplete='name'
									required
								/>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='email'>Elektron pochta</Label>
							<Input
								id='email'
								type='email'
								placeholder='ali@example.com'
								value={email}
								onChange={e => setEmail(e.target.value)}
								autoComplete='email'
								required
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>Parol</Label>
							<Input
								id='password'
								type='password'
								placeholder='Kamida 8 ta belgi'
								value={password}
								onChange={e => setPassword(e.target.value)}
								autoComplete='new-password'
								required
								minLength={8}
							/>
						</div>

						{error && (
							<div className='flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100'>
								<AlertCircle className='w-4 h-4 flex-shrink-0' />
								<span>{error}</span>
							</div>
						)}

						<Button
							type='submit'
							disabled={submitting}
							className='w-full bg-indigo-600 hover:bg-indigo-700 h-11'
						>
							{submitting ? (
								<div className='flex items-center gap-2'>
									<Loader2 className='w-4 h-4 animate-spin' />
									<span>Ro'yxatdan o'tilmoqda...</span>
								</div>
							) : (
								"Ro'yxatdan o'tish"
							)}
						</Button>

						<p className='text-center text-sm text-slate-600'>
							Hisobingiz bormi?{' '}
							<Link to='/login' className='text-indigo-600 font-semibold hover:underline'>
								Kirish
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Register;
