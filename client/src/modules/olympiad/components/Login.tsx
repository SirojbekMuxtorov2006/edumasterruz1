import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';

const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { signIn } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Login muvaffaqiyatli bo'lgach qaytish sahifasi
	const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitting) return;
		setError(null);
		setSubmitting(true);
		try {
			await signIn(email.trim(), password);
			navigate(from, { replace: true });
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Kirish xatosi');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
			<Card className='w-full max-w-md shadow-xl border-indigo-100'>
				<CardHeader className='text-center'>
					<div className='mx-auto bg-indigo-50 p-3 rounded-full w-fit mb-2'>
						<LogIn className='w-8 h-8 text-indigo-600' />
					</div>
					<CardTitle className='text-2xl font-bold'>Xush kelibsiz</CardTitle>
					<CardDescription>Hisobingizga kiring</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Elektron pochta</Label>
							<Input
								id='email'
								type='email'
								placeholder='email@example.com'
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
								placeholder='••••••••'
								value={password}
								onChange={e => setPassword(e.target.value)}
								autoComplete='current-password'
								required
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
							{submitting ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Kirish'}
						</Button>

						<p className='text-center text-sm text-slate-600'>
							Hisobingiz yo'qmi?{' '}
							<Link to='/register' className='text-indigo-600 font-semibold hover:underline'>
								Ro'yxatdan o'tish
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default Login;
