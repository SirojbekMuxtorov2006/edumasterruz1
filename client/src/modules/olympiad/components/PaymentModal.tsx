import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/useAuth';
import { usePayment, PaymentProvider } from '../hooks/usePayment';
import {
	X,
	CreditCard,
	CheckCircle2,
	ShieldCheck,
	ArrowRight,
	Loader2,
	BookOpen,
	Calculator,
	XCircle,
	User,
	Upload,
} from 'lucide-react';
import { ClientTestListItem } from '@/hooks/useClientTests';

const fmt = (p: number) => (p === 0 ? 'Bepul' : p.toLocaleString('uz-UZ') + " so'm");

const PROVIDERS = [
	{ id: 'payme', label: 'Payme', logo: '💳' },
	{ id: 'click', label: 'Click', logo: '🟢' },
	{ id: 'uzum', label: 'Uzum', logo: '🟣' },
] as { id: PaymentProvider; label: string; logo: string }[];

interface Props {
	test: ClientTestListItem;
	onClose: () => void;
}

type PurchaseStore = Record<
	string,
	Record<number, { ticket: string; provider: PaymentProvider | 'free'; paid_at: string }>
>;

const PURCHASES_KEY = 'turon_purchases_v1';

const readPurchases = (): PurchaseStore => {
	try {
		const raw = localStorage.getItem(PURCHASES_KEY);
		if (!raw) return {};
		return JSON.parse(raw) as PurchaseStore;
	} catch {
		return {};
	}
};

const writePurchases = (data: PurchaseStore) => {
	try {
		localStorage.setItem(PURCHASES_KEY, JSON.stringify(data));
	} catch {
		// ignore
	}
};

export default function PaymentModal({ test, onClose }: Props) {
	const navigate = useNavigate();
	const { user } = useAuth();

	const { status, ticketCode, pay, reset } = usePayment();

	const [provider, setProvider] = useState<PaymentProvider | null>(null);
	const [agreed, setAgreed] = useState(false);
	const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

	const isMath = test.subject_id === 1 || test.name.toLowerCase().includes('mat');
	const isFree = test.price === 0;
	const isPending = status === 'pending';
	const isPaid = status === 'paid';
	const isFailed = status === 'failed';

	const handleClose = () => {
		reset();
		onClose();
	};

	const persistPurchase = (ticket: string, paidProvider: PaymentProvider | 'free') => {
		if (!user?.email) return;
		const store = readPurchases();
		const byUser = store[user.email] ?? {};
		byUser[test.id] = {
			ticket,
			provider: paidProvider,
			paid_at: new Date().toISOString(),
		};
		store[user.email] = byUser;
		writePurchases(store);
	};

	const handlePay = () => {
		if (isFree) {
			const ticket = `FREE-${test.id}`;
			localStorage.setItem(`ticket_${test.id}`, ticket);
			persistPurchase(ticket, 'free');
			navigate(`/tests/${test.id}`);
			return;
		}

		if (!provider) return;

		pay(String(test.id), provider);
	};

	if (!user) {
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
				<div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />
				<div className='relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden'>
					<div className='h-2 bg-gradient-to-r from-indigo-500 to-purple-500' />
					<div className='p-6 space-y-4'>
						<div className='flex justify-between items-start'>
							<div>
								<h2 className='text-lg font-bold text-gray-900'>Avval tizimga kiring</h2>
								<p className='text-sm text-gray-500 mt-1'>
									Olimpiada testida qatnashish uchun avval ro&apos;yxatdan o&apos;ting yoki tizimga
									kiring. Shundan so&apos;ng to&apos;lovni amalga oshirib testni boshlashingiz mumkin.
								</p>
							</div>
							<button
								onClick={onClose}
								className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
							>
								<X />
							</button>
						</div>

						<div className='flex gap-3 pt-2'>
							<Button
								className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white'
								onClick={() => {
									onClose();
									navigate('/login');
								}}
							>
								Kirish
							</Button>
							<Button
								variant='outline'
								className='flex-1'
								onClick={() => {
									onClose();
									navigate('/register');
								}}
							>
								Ro&apos;yxatdan o&apos;tish
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isPaid && ticketCode) {
		persistPurchase(ticketCode, provider ?? 'payme');
		return (
			<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
				<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={handleClose} />

				<div className='relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95'>
					<div className='h-2 bg-gradient-to-r from-green-400 to-emerald-500' />

					<div className='p-8 text-center space-y-4'>
						<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
							<CheckCircle2 className='w-8 h-8 text-green-600' />
						</div>

						<h2 className='text-xl font-bold'>To&apos;lov muvaffaqiyatli</h2>
						<p className='text-sm text-muted-foreground'>{test.name}</p>

						<div className='border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-xl p-5 space-y-2'>
							<div className='flex items-center justify-center gap-2 text-indigo-700 font-semibold text-sm'>
								<CreditCard className='w-4 h-4' />
								Chipta ID
							</div>
							<div className='font-mono text-2xl font-extrabold tracking-widest text-indigo-700'>
								{ticketCode}
							</div>
						</div>

						<div className='grid grid-cols-2 gap-2'>
							<Button
								variant='outline'
								className='w-full gap-2'
								onClick={() => {
									handleClose();
									navigate('/profile');
								}}
							>
								<User size={16} />
								Profil
							</Button>
							<Button
								className='w-full gap-2 bg-indigo-600 hover:bg-indigo-700'
								onClick={() => {
									handleClose();
									navigate(`/tests/${test.id}`);
								}}
							>
								Testni boshlash
								<ArrowRight size={16} />
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<div
				className='absolute inset-0 bg-black/50 backdrop-blur-sm'
				onClick={!isPending ? handleClose : undefined}
			/>

			<div className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95'>
				<div
					className={`h-2 bg-gradient-to-r ${
						isMath ? 'from-blue-400 to-cyan-400' : 'from-orange-400 to-amber-400'
					}`}
				/>

				<div className='flex items-start justify-between p-6 pb-3'>
					<div className='space-y-2'>
						<div className='flex gap-2'>
							<Badge variant='outline'>
								{isMath ? <Calculator size={14} /> : <BookOpen size={14} />}
								{isMath ? 'Matematika' : 'Ingliz tili'}
							</Badge>
							{test.level_name && <Badge variant='outline'>{test.level_name}</Badge>}
						</div>
						<h2 className='text-lg font-bold'>{test.name}</h2>
					</div>

					{!isPending && (
						<button onClick={handleClose} className='p-2 rounded-lg hover:bg-gray-100 transition'>
							<X />
						</button>
					)}
				</div>

				<div className='px-6 pb-6 space-y-5'>
					<div className='rounded-xl border bg-muted/40 divide-y'>
						<div className='flex justify-between text-sm p-3'>
							<span className='text-muted-foreground'>Savollar</span>
							<span className='font-semibold'>{test.question_count} ta</span>
						</div>
						<div className='flex justify-between text-sm p-3'>
							<span className='text-muted-foreground'>Narxi</span>
							<span className='font-semibold text-indigo-600'>{fmt(test.price)}</span>
						</div>
					</div>

					<div className='border-2 border-dashed rounded-xl p-4 space-y-4'>
						<div className='flex justify-between items-center'>
							<div className='flex items-center gap-2 font-semibold'>
								<CreditCard size={16} />
								To&apos;lov
							</div>
							<span className='text-lg font-bold text-indigo-600'>{fmt(test.price)}</span>
						</div>

						{!isFree && !isPending && !isFailed && (
							<div className='rounded-xl border border-gray-200 bg-gray-50 p-3'>
								<label className='text-xs font-semibold text-gray-700 flex items-center gap-2 mb-2'>
									<Upload className='w-4 h-4 text-indigo-600' />
									Chekni yuklash (ixtiyoriy)
								</label>
								<input
									type='file'
									accept='image/*,application/pdf'
									onChange={e => setReceiptFileName(e.target.files?.[0]?.name ?? null)}
									className='block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-50'
								/>
								{receiptFileName && <p className='mt-2 text-xs text-gray-500'>Tanlangan: {receiptFileName}</p>}
							</div>
						)}

						{!isFree && !isPending && !isFailed && (
							<div className='grid grid-cols-3 gap-3'>
								{PROVIDERS.map(p => (
									<button
										key={p.id}
										onClick={() => setProvider(p.id)}
										className={`relative rounded-xl border p-3 text-center font-semibold text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95 ${
											provider === p.id
												? 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50'
												: 'border-gray-200 hover:border-indigo-300'
										}`}
									>
										<div className='text-xl mb-1'>{p.logo}</div>
										{p.label}
										{provider === p.id && (
											<CheckCircle2 className='absolute -top-2 -right-2 w-5 h-5 text-indigo-600 bg-white rounded-full' />
										)}
									</button>
								))}
							</div>
						)}

						{isPending && (
							<div className='flex flex-col items-center gap-3 py-4'>
								<Loader2 className='animate-spin' />
								<p className='text-sm font-semibold'>To&apos;lov amalga oshirilmoqda...</p>
							</div>
						)}

						{isFailed && (
							<div className='space-y-3'>
								<div className='flex items-center gap-2 text-red-600'>
									<XCircle size={16} />
									To&apos;lov amalga oshmadi
								</div>
								<Button variant='outline' className='w-full' onClick={reset}>
									Qayta urinish
								</Button>
							</div>
						)}
					</div>

					{!isFree && !isPending && !isFailed && (
						<label className='flex gap-2 text-xs cursor-pointer'>
							<input type='checkbox' checked={agreed} onChange={e => setAgreed(e.target.checked)} />
							<span>
								Men <span className='underline text-indigo-600'>shartlar va qoidalar</span> bilan tanishdim
							</span>
						</label>
					)}

					<div className='flex items-center gap-2 text-xs text-muted-foreground'>
						<ShieldCheck size={16} className='text-green-500' />
						To&apos;lov Payme / Click / Uzum tomonidan himoyalangan
					</div>

					{!isPending && !isFailed && (
						<Button
							className='w-full gap-2'
							onClick={handlePay}
							disabled={!isFree && (!provider || !agreed)}
						>
							{isFree ? 'Testni boshlash' : fmt(test.price) + " — To'lash"}
							<ArrowRight size={16} />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
