import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientTests } from '@/hooks/useClientTests';
import { Loader2, BookOpen, Calculator, HelpCircle, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

const formatPrice = (p: number) => (p === 0 ? 'Bepul' : p.toLocaleString('uz-UZ') + " so'm");

const ClientTests = () => {
	const {
		data,
		isLoading,
		error,
	} = useClientTests({ limit: 50 });
	const items = data?.items ?? [];
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [selectedId, setSelectedId] = useState<number | null>(null);

	return (
		<div className='min-h-screen flex flex-col bg-gray-50'>
			<Navbar />

			<main className='flex-1 pt-24 pb-10'>
				<div className='max-w-5xl mx-auto px-4 space-y-8'>
					<section className='text-center space-y-3'>
						<h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
							Online testlar
						</h1>
						<p className='text-gray-500 max-w-2xl mx-auto text-sm'>
							Testlar backend API orqali yuklanadi. Ushbu sahifada barcha mavjud testlar ro&apos;yxati
							ko&apos;rsatiladi.
						</p>
					</section>

					{isLoading && (
						<div className='flex items-center justify-center py-16'>
							<Loader2 className='w-6 h-6 animate-spin text-indigo-600' />
						</div>
					)}

					{error && (
						<div className='flex items-center justify-center py-10'>
							<div className='flex items-start gap-2 max-w-md bg-red-50 border border-red-200 px-3 py-2 rounded-lg'>
								<AlertCircle className='w-4 h-4 text-red-500 mt-0.5' />
								<div className='text-xs text-red-700 space-y-1'>
									<p>
										Testlarni yuklashda xatolik yuz berdi. Iltimos, backend server
										(`VITE_API_URL`) ishga tushganini tekshiring.
									</p>
									<p className='text-[11px] text-red-500/80 break-all'>
										{error instanceof Error ? error.message : String(error)}
									</p>
								</div>
							</div>
						</div>
					)}

					{!isLoading && !error && items.length === 0 && (
						<div className='flex flex-col items-center justify-center py-16 space-y-3'>
							<HelpCircle className='w-10 h-10 text-gray-300' />
							<p className='text-gray-600 text-sm'>Hozircha testlar topilmadi.</p>
						</div>
					)}

					{items.length > 0 && (
						<section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{items.map(test => {
								const isFree = test.price === 0;
								// Oddiy heuristika: level nomiga qarab subject ikonkasini tanlaymiz
								const levelName = test.level_name ?? '';
								const looksLikeMath = levelName.toLowerCase().includes('mat');
								const Icon = looksLikeMath ? Calculator : BookOpen;

								return (
									<Card
										key={test.id}
										className='border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col'
									>
										<CardHeader className='pb-3'>
											<div className='flex items-start justify-between gap-2'>
												<div className='space-y-1'>
													<CardTitle className='text-base font-semibold leading-snug'>
														{test.name}
													</CardTitle>
													<div className='flex items-center gap-1.5 text-xs text-gray-500'>
														<Icon className='w-3.5 h-3.5' />
														<span>{levelName || 'Darajasi ko‘rsatilmagan'}</span>
													</div>
												</div>
												<Badge variant='outline' className='text-xs'>
													{test.question_count} savol
												</Badge>
											</div>
										</CardHeader>
										<CardContent className='flex-1 flex flex-col justify-between pb-4 space-y-3'>
											<div className='flex items-center justify-between text-sm'>
												<span className='text-gray-500'>Narx</span>
												<span className='font-semibold text-indigo-700'>
													{formatPrice(test.price)}
												</span>
											</div>

											<Button
												className='w-full mt-2 bg-indigo-600 hover:bg-indigo-700'
												onClick={() => {
													if (!isAuthenticated) {
														navigate('/login', {
															state: { from: { pathname: `/tests/${test.id}` } },
														});
														return;
													}
													setSelectedId(test.id);
												}}
											>
												{isFree ? 'Testni boshlash' : 'Ro‘yxatdan o‘tib to‘lash'}
											</Button>
										</CardContent>
									</Card>
								);
							})}
						</section>
					)}
				</div>
			</main>

			<Footer />

			{/* Test payment / tasdiqlash modal — Olympiad flow'iga o'xshash */}
			{selectedId !== null && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div
						className='absolute inset-0 bg-black/50 backdrop-blur-sm'
						onClick={() => setSelectedId(null)}
					/>
					<div className='relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden'>
						<div className='h-2 bg-gradient-to-r from-indigo-500 to-purple-500' />
						<div className='p-6 space-y-4'>
							<div className='flex justify-between items-start'>
								<div>
									<h2 className='text-lg font-bold text-gray-900'>
										Testga kirishdan oldin to‘lov
									</h2>
									<p className='text-xs text-gray-500 mt-1'>
										Olimpiadadagi kabi: avval ro‘yxatga olingan test uchun to‘lov qilasiz (yoki
										admin bilan kelishilgan bo‘ladi), so‘ngra testni boshlashingiz mumkin.
									</p>
								</div>
								<button
									onClick={() => setSelectedId(null)}
									className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
								>
									<X className='w-4 h-4' />
								</button>
							</div>

							<div className='flex items-center gap-2 text-xs text-gray-500'>
								<ShieldCheck className='w-4 h-4 text-green-500' />
								<span>
									To‘lov ma’lumotlari backend / kassaga bog‘lanishi mumkin. Hozircha demo
									rejimida chipta lokal tarzda yaratiladi.
								</span>
							</div>

							<div className='flex gap-3 pt-2'>
								<Button
									className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm'
									onClick={() => {
										if (selectedId == null) return;
										// Olympiad flow'iga o'xshash: localStorage'da chipta saqlaymiz
										const ticket = `TEST-${String(selectedId).padStart(4, '0')}`;
										localStorage.setItem(`test_ticket_${selectedId}`, ticket);
										setSelectedId(null);
										navigate(`/tests/${selectedId}`);
									}}
								>
									To‘lov bajarildi, testga kirish
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ClientTests;

