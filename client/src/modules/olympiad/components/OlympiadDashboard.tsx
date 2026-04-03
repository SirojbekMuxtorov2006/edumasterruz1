import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { useClientTests } from '@/hooks/useClientTests';
import { useClientSubjects } from '@/hooks/useClientSubjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	BookOpen,
	Calculator,
	CheckCircle2,
	ChevronRight,
	CreditCard,
	LogOut,
	User,
	X,
} from 'lucide-react';

const formatPrice = (p: number) => (p === 0 ? 'Bepul' : p.toLocaleString('uz-UZ') + " so'm");

type LevelKey = 'ALL' | 'A' | 'B' | 'C';
type SubjectKey = 'ALL' | number;

export default function OlympiadDashboard() {
	const navigate = useNavigate();
	const { user, isAuthenticated, signOut } = useAuth();

	const {
		data: testsData,
		isLoading: testsLoading,
		error: testsError,
	} = useClientTests({ limit: 200 });
	const { data: subjects } = useClientSubjects();

	const [selectedLevel, setSelectedLevel] = useState<LevelKey>('ALL');
	const [selectedSubject, setSelectedSubject] = useState<SubjectKey>('ALL');
	const [payTestId, setPayTestId] = useState<number | null>(null);

	// subject id → name map
	const subjectNameById = useMemo(() => {
		const m = new Map<number, string>();
		(subjects ?? []).forEach(s => m.set(s.id, s.name));
		return m;
	}, [subjects]);

	// level_name'dan daraja aniqlash
	const inferLevel = (levelName?: string | null): LevelKey => {
		if (!levelName) return 'ALL';
		const s = levelName.toUpperCase();
		if (s.includes('A')) return 'A';
		if (s.includes('B')) return 'B';
		if (s.includes('C')) return 'C';
		return 'ALL';
	};

	// fan belgisi
	const getSubjectIcon = (subjectId?: number | null) => {
		const name = (subjectId ? subjectNameById.get(subjectId) : '') ?? '';
		const lower = name.toLowerCase();
		if (lower.includes('mat'))
			return { Icon: Calculator, label: 'Matematika', theme: 'from-blue-500 to-cyan-500' };
		if (lower.includes('ing') || lower.includes('eng'))
			return { Icon: BookOpen, label: 'Ingliz tili', theme: 'from-orange-500 to-amber-500' };
		return { Icon: BookOpen, label: name || 'Test', theme: 'from-indigo-500 to-purple-500' };
	};

	const filteredTests = useMemo(() => {
		const items = testsData?.items ?? [];
		return items.filter(t => {
			if (selectedLevel !== 'ALL' && inferLevel(t.level_name) !== selectedLevel) return false;
			if (selectedSubject !== 'ALL' && t.subject_id !== selectedSubject) return false;
			return true;
		});
	}, [testsData?.items, selectedLevel, selectedSubject]);

	const handleStartTest = (testId: number, price: number) => {
		if (price > 0) {
			const ticket = localStorage.getItem(`test_ticket_${testId}`);
			if (!ticket) {
				setPayTestId(testId);
				return;
			}
		}
		navigate(`/tests/${testId}`);
	};

	const handlePay = (testId: number) => {
		localStorage.setItem(`test_ticket_${testId}`, `TKT-${String(testId).padStart(4, '0')}`);
		setPayTestId(null);
		navigate(`/tests/${testId}`);
	};

	if (!isAuthenticated || !user) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center space-y-4'>
					<p className='text-gray-500'>Iltimos tizimga kiring</p>
					<Button onClick={() => navigate('/login')} className='bg-indigo-600'>
						Kirish
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<div className='bg-white border-b'>
				<div className='max-w-5xl mx-auto px-4 py-4 flex items-center justify-between'>
					<div>
						<h1 className='text-lg font-bold'>
							Xush kelibsiz, {user.full_name?.split(' ')[0] ?? user.email}
						</h1>
						<p className='text-sm text-gray-500'>
							{user.is_admin && <span className='text-indigo-600 font-medium'>Admin · </span>}
							{user.is_verified ? (
								<span className='text-green-600'>Tasdiqlangan hisob</span>
							) : (
								<span className='text-orange-500'>Email tasdiqlanmagan</span>
							)}
						</p>
					</div>
					<div className='flex items-center gap-2'>
						<Button variant='ghost' size='icon' onClick={() => navigate('/profile')}>
							<User size={18} />
						</Button>
						<Button
							variant='ghost'
							size='icon'
							onClick={async () => {
								await signOut();
								navigate('/');
							}}
						>
							<LogOut size={18} />
						</Button>
					</div>
				</div>
			</div>

			{/* Hero */}
			<div className='bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-10'>
				<div className='max-w-5xl mx-auto px-4'>
					<h2 className='text-3xl font-bold mb-2'>Turon Olympiad</h2>
					<p className='text-indigo-100'>Matematika va Ingliz tili testlari</p>
				</div>
			</div>

			{/* Filters + Tests */}
			<div className='max-w-5xl mx-auto px-4 py-8'>
				{/* Level filter */}
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5'>
					<h3 className='text-lg font-bold'>Testlar</h3>
					<div className='flex flex-wrap gap-2'>
						{(['ALL', 'A', 'B', 'C'] as LevelKey[]).map(lk => (
							<Button
								key={lk}
								size='sm'
								variant={selectedLevel === lk ? 'default' : 'outline'}
								className={selectedLevel === lk ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
								onClick={() => setSelectedLevel(lk)}
							>
								{lk === 'ALL' ? 'Barchasi' : `Level ${lk}`}
							</Button>
						))}
					</div>
				</div>

				{/* Subject filter */}
				{subjects && subjects.length > 0 && (
					<div className='flex flex-wrap gap-2 mb-5'>
						<Button
							size='sm'
							variant={selectedSubject === 'ALL' ? 'default' : 'outline'}
							className={selectedSubject === 'ALL' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
							onClick={() => setSelectedSubject('ALL')}
						>
							Barcha fanlar
						</Button>
						{subjects.map(s => (
							<Button
								key={s.id}
								size='sm'
								variant={selectedSubject === s.id ? 'default' : 'outline'}
								className={selectedSubject === s.id ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
								onClick={() => setSelectedSubject(s.id)}
							>
								{s.name}
							</Button>
						))}
					</div>
				)}

				{/* States */}
				{testsLoading && (
					<div className='flex items-center justify-center py-16 gap-3 text-gray-500'>
						<div className='w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
						Testlar yuklanmoqda...
					</div>
				)}
				{testsError && (
					<div className='text-center py-16 text-red-600 text-sm'>
						Testlarni yuklashda xatolik. Backend ishlaayotganini tekshiring.
					</div>
				)}
				{!testsLoading && !testsError && filteredTests.length === 0 && (
					<div className='text-center py-16 text-gray-500'>Test topilmadi</div>
				)}

				{/* Test cards */}
				{!testsLoading && !testsError && filteredTests.length > 0 && (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{filteredTests.map(t => {
							const isFree = t.price === 0;
							const { Icon, label, theme } = getSubjectIcon(t.subject_id);
							return (
								<Card key={t.id} className='overflow-hidden hover:shadow-lg transition-shadow'>
									<div className={`h-1.5 bg-gradient-to-r ${theme}`} />
									<CardHeader className='pb-2'>
										<div className='flex items-center justify-between'>
											<Badge variant='outline' className='gap-1'>
												<Icon size={13} />
												{label}
											</Badge>
											{isFree ? (
												<span className='flex items-center gap-1 text-green-600 text-xs font-semibold'>
													<CheckCircle2 size={13} /> Bepul
												</span>
											) : (
												<span className='flex items-center gap-1 text-indigo-600 text-xs font-semibold'>
													<CreditCard size={13} /> {formatPrice(t.price)}
												</span>
											)}
										</div>
										<h3 className='font-bold text-sm mt-2 line-clamp-2'>{t.name}</h3>
									</CardHeader>
									<CardContent className='space-y-3 text-sm text-gray-500'>
										<div className='flex justify-between'>
											<span>Daraja</span>
											<span className='font-medium text-gray-700'>{t.level_name ?? '—'}</span>
										</div>
										<div className='flex justify-between'>
											<span>Savollar</span>
											<span className='font-medium text-gray-700'>{t.question_count} ta</span>
										</div>
										<Button
											className='w-full mt-1 bg-indigo-600 hover:bg-indigo-700'
											onClick={() => handleStartTest(t.id, t.price)}
										>
											Testni boshlash
											<ChevronRight size={15} className='ml-1' />
										</Button>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>

			{/* Payment modal */}
			{payTestId !== null && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
					<div className='absolute inset-0 bg-black/50' onClick={() => setPayTestId(null)} />
					<div className='relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden'>
						<div className='h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500' />
						<div className='p-6 space-y-4'>
							<div className='flex justify-between items-start'>
								<div>
									<h2 className='text-lg font-bold text-gray-900'>To'lov</h2>
									<p className='text-sm text-gray-500 mt-1'>
										To'lovni amalga oshirib, testni boshlang.
									</p>
								</div>
								<button
									onClick={() => setPayTestId(null)}
									className='p-1 rounded hover:bg-gray-100'
								>
									<X className='w-4 h-4 text-gray-500' />
								</button>
							</div>
							<Button
								className='w-full bg-indigo-600 hover:bg-indigo-700'
								onClick={() => handlePay(payTestId)}
							>
								To'lov qildim — testga kirish
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
