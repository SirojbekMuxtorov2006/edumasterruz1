import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

import {
	ChevronLeft,
	CircleCheck,
	CircleX,
	Coins,
	GraduationCap,
	LogOut,
	Mail,
	User,
	ArrowRight,
	Ticket,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { activeOlympiads } from '../data/olympiadData';

type PurchaseStore = Record<
	string,
	Record<string, { ticket: string; provider: string; paid_at: string }>
>;
const PURCHASES_KEY = 'turon_purchases_v1';

const readPurchasesForUser = (
	email: string,
): Record<string, { ticket: string; provider: string; paid_at: string }> => {
	try {
		const raw = localStorage.getItem(PURCHASES_KEY);
		if (!raw) return {};
		const store = JSON.parse(raw) as PurchaseStore;
		return store[email] ?? {};
	} catch {
		return {};
	}
};

export default function ProfilePage() {
	const navigate = useNavigate();
	const { user, signOut } = useAuth();

	if (!user) {
		navigate('/login');
		return null;
	}

	const displayName = user.full_name ?? user.email;
	const level = user.level ?? 'A';
	const coins = user.coins ?? 0;
	const verified = user.is_verified;
	const purchases = readPurchasesForUser(user.email);
	const purchaseEntries = Object.entries(purchases);

	const handleLogout = () => {
		signOut();
		navigate('/');
	};

	return (
		<div className='min-h-screen bg-gray-50 py-10'>
			<div className='max-w-md mx-auto px-4 space-y-6'>
				{/* NAV */}

				<div className='flex items-center justify-between'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => navigate('/dashboard')}
						className='gap-1'
					>
						<ChevronLeft size={16} />
						Dashboard
					</Button>

					<Button
						variant='ghost'
						size='sm'
						onClick={handleLogout}
						className='gap-2 text-red-500 hover:text-red-600'
					>
						<LogOut size={16} />
						Chiqish
					</Button>
				</div>

				{/* PROFILE HERO */}

				<Card className='overflow-hidden'>
					<div className='h-2 bg-gradient-to-r from-indigo-500 to-blue-500' />

					<CardContent className='flex items-center gap-4 pt-6'>
						<div className='h-14 w-14 rounded-xl bg-indigo-100 flex items-center justify-center'>
							<User className='text-indigo-600' size={26} />
						</div>

						<div>
							<p className='font-bold text-lg'>{displayName}</p>

							<p className='text-sm text-muted-foreground flex items-center gap-1'>
								<Mail size={13} />

								{user.email}
							</p>

							<div className='mt-1'>
								<Badge className='bg-indigo-100 text-indigo-700 border-indigo-200'>
									Level {level}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* STATS */}

				<div className='grid grid-cols-3 gap-3'>
					<Card className='hover:shadow-md transition'>
						<CardContent className='p-4 text-center space-y-2'>
							<GraduationCap className='mx-auto text-blue-600' size={20} />

							<p className='text-xs text-muted-foreground'>Daraja</p>

							<p className='font-semibold'>{level}</p>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition'>
						<CardContent className='p-4 text-center space-y-2'>
							<Coins className='mx-auto text-yellow-600' size={20} />

							<p className='text-xs text-muted-foreground'>Coinlar</p>

							<p className='font-semibold'>{coins}</p>
						</CardContent>
					</Card>

					<Card className='hover:shadow-md transition'>
						<CardContent className='p-4 text-center space-y-2'>
							{verified ? (
								<CircleCheck className='mx-auto text-green-600' size={20} />
							) : (
								<CircleX className='mx-auto text-orange-500' size={20} />
							)}

							<p className='text-xs text-muted-foreground'>Holat</p>

							<p className='font-semibold'>{verified ? 'Tasdiqlangan' : 'Kutilmoqda'}</p>
						</CardContent>
					</Card>
				</div>

				{/* INFO */}

				<Card>
					<CardContent className='divide-y'>
						<div className='flex justify-between py-3 text-sm'>
							<span className='text-muted-foreground'>To'liq ism</span>

							<span className='font-medium'>{user.full_name ?? '—'}</span>
						</div>

						<div className='flex justify-between py-3 text-sm'>
							<span className='text-muted-foreground'>Email</span>

							<span className='font-medium'>{user.email}</span>
						</div>

						<div className='flex justify-between py-3 text-sm'>
							<span className='text-muted-foreground'>Daraja</span>

							<span className='font-medium'>{level}</span>
						</div>

						<div className='flex justify-between py-3 text-sm'>
							<span className='text-muted-foreground'>Holat</span>

							<span className={`font-medium ${verified ? 'text-green-600' : 'text-orange-500'}`}>
								{verified ? 'Tasdiqlangan' : 'Kutilmoqda'}
							</span>
						</div>
					</CardContent>
				</Card>

				{/* PURCHASES / TICKETS */}

				<Card>
					<CardContent className='p-5 space-y-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='font-semibold text-gray-900'>Mening chiptalarim</p>
								<p className='text-xs text-muted-foreground'>To&apos;lov qilingan olimpiadalar</p>
							</div>
							<Badge variant='outline' className='text-xs'>
								{purchaseEntries.length} ta
							</Badge>
						</div>

						{purchaseEntries.length === 0 ? (
							<div className='text-sm text-muted-foreground'>
								Hali chipta yo&apos;q. Olimpiadalar bo&apos;limidan to&apos;lov qilib olishingiz
								mumkin.
							</div>
						) : (
							<div className='space-y-3'>
								{purchaseEntries.map(([olympiadId, p]) => {
									const olymp = activeOlympiads.find(o => o.id === olympiadId);
									return (
										<div
											key={olympiadId}
											className='rounded-xl border border-gray-200 bg-white p-4 space-y-3'
										>
											<div className='flex items-start justify-between gap-3'>
												<div className='min-w-0'>
													<p className='font-semibold text-gray-900 truncate'>
														{olymp?.title ?? olympiadId}
													</p>
													<p className='text-xs text-muted-foreground mt-0.5'>
														{new Date(p.paid_at).toLocaleString('uz-UZ')} •{' '}
														{String(p.provider).toUpperCase()}
													</p>
												</div>
												<Badge
													variant='outline'
													className='text-xs bg-indigo-50 text-indigo-700 border-indigo-200'
												>
													<Ticket className='w-3 h-3 mr-1' />
													Chipta
												</Badge>
											</div>

											<div className='rounded-lg border border-dashed border-indigo-200 bg-indigo-50 px-3 py-2 font-mono text-sm font-semibold text-indigo-700'>
												{p.ticket}
											</div>

											<div className='grid grid-cols-2 gap-2'>
												<Button
													variant='outline'
													onClick={() => navigate('/olympiads')}
													className='w-full'
												>
													Olimpiadalar
												</Button>
												<Button
													onClick={() => navigate(`/quiz/${olympiadId}`)}
													className='w-full bg-indigo-600 hover:bg-indigo-700 gap-2'
												>
													Testni boshlash
													<ArrowRight size={16} />
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* ACTIONS */}

				<div className='space-y-3'>
					<div className='grid grid-cols-2 gap-3'>
						<Button variant='outline' onClick={() => navigate('/dashboard')}>
							Dashboard
						</Button>

						<Button onClick={() => navigate('/olympiads')} className='gap-2'>
							Olimpiadalar
							<ArrowRight size={16} />
						</Button>
					</div>

					<Button variant='destructive' className='w-full gap-2' onClick={handleLogout}>
						<LogOut size={16} />
						Hisobdan chiqish
					</Button>
				</div>
			</div>
		</div>
	);
}
