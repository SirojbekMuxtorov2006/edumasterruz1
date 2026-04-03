import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientTests } from '@/hooks/useClientTests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
	Clock,
	BookOpen,
	Calculator,
	CalendarDays,
	ChevronRight,
	Lock,
	Search,
	CreditCard,
	Ticket,
	CheckCircle2,
} from 'lucide-react';
import PaymentModal from './PaymentModal';

const SUBJECTS = [
	{ id: 'all', label: 'Barchasi', icon: null },
	{ id: 'math', label: 'Matematika', icon: Calculator },
	{ id: 'english', label: 'Ingliz tili', icon: BookOpen },
];

const GRADES = ['Barchasi', '5-sinf', '6-sinf', '7-sinf', '8-sinf', '9-sinf', '10-sinf', '11-sinf'];

interface TestItem {
	id: number;
	name: string;
	price: number;
	level_id: number;
	level_name: string | null;
	subject_id: number | null;
	question_count: number;
}

const formatPrice = (p: number) => (p === 0 ? 'Bepul' : p.toLocaleString('uz-UZ') + " so'm");

const OlympiadCard = ({ test, onClick }: { test: TestItem; onClick: () => void }) => {
	const isMath = test.subject_id === 1 || test.name.toLowerCase().includes('mat');
	const isFree = test.price === 0;

	const themeGrad = isMath ? 'from-blue-500 to-cyan-500' : 'from-orange-500 to-amber-500';
	const themeBadge = isMath
		? 'bg-blue-50 text-blue-700 border-blue-200'
		: 'bg-orange-50 text-orange-700 border-orange-200';
	const themeBtn = isMath ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600';

	return (
		<Card className='relative overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-gray-200'>
			<div className={`h-1.5 bg-gradient-to-r ${themeGrad}`} />

			<CardHeader className='pb-3 pt-4 px-5'>
				<div className='flex items-start justify-between gap-3'>
					<div className='flex-1 min-w-0'>
						<div className='flex flex-wrap items-center gap-1.5 mb-2'>
							<Badge variant='outline' className={`text-xs font-semibold ${themeBadge}`}>
								{isMath ? (
									<>
										<Calculator className='w-3 h-3 mr-1 inline-block' />
										Matematika
									</>
								) : (
									<>
										<BookOpen className='w-3 h-3 mr-1 inline-block' />
										Ingliz tili
									</>
								)}
							</Badge>
							{test.level_name && (
								<Badge variant='outline' className='text-xs bg-gray-50 text-gray-600 border-gray-200'>
									{test.level_name}
								</Badge>
							)}
						</div>
						<h3 className='font-bold text-gray-900 text-base leading-snug'>{test.name}</h3>
					</div>

					<div className='flex-shrink-0 text-right'>
						{isFree ? (
							<span className='inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200'>
								<CheckCircle2 className='w-3 h-3' /> Bepul
							</span>
						) : (
							<div>
								<div className='flex items-center gap-1 justify-end text-indigo-700 font-extrabold text-sm'>
									<CreditCard className='w-3.5 h-3.5' />
									{formatPrice(test.price)}
								</div>
							</div>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className='px-5 pb-3 space-y-3'>
				<div className='flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500'>
					<span className='flex items-center gap-1'>
						<Ticket className='w-3.5 h-3.5 text-gray-400' />
						{test.question_count} ta savol
					</span>
				</div>
			</CardContent>

			<CardFooter className='px-5 pb-4 pt-1'>
				<Button
					className={`w-full text-white font-semibold flex items-center justify-center gap-2 ${themeBtn}`}
					onClick={onClick}
				>
					{isFree ? 'Testni Boshlash' : `Ro'yxatdan o'tish — ${formatPrice(test.price)}`}
					<ChevronRight className='w-4 h-4' />
				</Button>
			</CardFooter>
		</Card>
	);
};

const OlympiadList = () => {
	const navigate = useNavigate();
	const [subject, setSubject] = useState('all');
	const [grade, setGrade] = useState('Barchasi');
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<TestItem | null>(null);

	const { data, isLoading, error } = useClientTests({
		limit: 100,
	});

	const tests = data?.items ?? [];

	const filtered = tests.filter(test => {
		const matchSearch =
			search.trim() === '' ||
			test.name.toLowerCase().includes(search.toLowerCase()) ||
			(test.level_name ?? '').toLowerCase().includes(search.toLowerCase());
		const matchSubject =
			subject === 'all' ||
			(subject === 'math' && (test.subject_id === 1 || test.name.toLowerCase().includes('mat'))) ||
			(subject === 'english' && (test.subject_id === 2 || test.name.toLowerCase().includes('eng')));
		const matchGrade =
			grade === 'Barchasi' || (test.level_name ?? '').includes(grade);
		return matchSearch && matchSubject && matchGrade;
	});

	const handleSelect = (test: TestItem) => {
		if (test.price === 0) {
			navigate(`/tests/${test.id}`);
		} else {
			setSelected(test);
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
			<Navbar />

			<div className='bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white py-12 px-4 mt-24'>
				<div className='max-w-5xl mx-auto text-center'>
					<h1 className='text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight'>
						🏆 Turon International Olympiad
					</h1>
					<p className='text-indigo-200 text-base sm:text-lg max-w-xl mx-auto'>
						Bilimingizni sinab ko'ring. Matematika va Ingliz tili bo'yicha xalqaro darajadagi
						olimpiadalar.
					</p>
					<div className='flex flex-wrap justify-center gap-6 mt-8'>
						<div className='text-center'>
							<div className='text-2xl font-extrabold text-white'>{tests.length}</div>
							<div className='text-xs text-indigo-300 mt-0.5'>Olimpiada</div>
						</div>
						<div className='text-center'>
							<div className='text-2xl font-extrabold text-white'>2</div>
							<div className='text-xs text-indigo-300 mt-0.5'>Fan</div>
						</div>
					</div>
				</div>
			</div>

			<div className='sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm'>
				<div className='max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center'>
					<div className='relative flex-1 min-w-0'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
						<Input
							placeholder='Olimpiada qidirish...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							className='pl-9 h-9 text-sm border-gray-200 bg-gray-50 focus:bg-white'
						/>
					</div>

					<div className='flex gap-1 bg-gray-100 rounded-xl p-1'>
						{SUBJECTS.map(s => (
							<button
								key={s.id}
								onClick={() => setSubject(s.id)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
									subject === s.id
										? 'bg-white text-indigo-700 shadow-sm'
										: 'text-gray-500 hover:text-gray-700'
								}`}
							>
								{s.label}
							</button>
						))}
					</div>

					<div className='flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto'>
						{GRADES.map(g => (
							<button
								key={g}
								onClick={() => setGrade(g)}
								className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
									grade === g
										? 'bg-white text-indigo-700 shadow-sm'
										: 'text-gray-500 hover:text-gray-700'
								}`}
							>
								{g}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className='flex-1 max-w-5xl mx-auto w-full px-4 py-8'>
				{isLoading && (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{[1, 2, 3, 4, 5, 6].map(i => (
							<Card key={i} className='overflow-hidden'>
								<Skeleton className='h-1.5' />
								<div className='p-5 space-y-3'>
									<Skeleton className='h-4 w-3/4' />
									<Skeleton className='h-6 w-full' />
									<Skeleton className='h-10 w-full' />
								</div>
							</Card>
						))}
					</div>
				)}

				{error && (
					<div className='flex flex-col items-center justify-center py-24 text-center'>
						<p className='text-red-500 font-medium'>Ma'lumotlarni yuklashda xatolik</p>
						<Button variant='outline' className='mt-4' onClick={() => window.location.reload()}>
							Qayta yuklash
						</Button>
					</div>
				)}

				{!isLoading && !error && filtered.length === 0 && (
					<div className='flex flex-col items-center justify-center py-24 text-center'>
						<div className='text-5xl mb-4'>🔍</div>
						<p className='text-gray-500 font-medium'>Olimpiada topilmadi</p>
						<p className='text-gray-400 text-sm mt-1'>Filter yoki qidiruvni o'zgartiring</p>
						<Button
							variant='outline'
							className='mt-4'
							onClick={() => {
								setSubject('all');
								setGrade('Barchasi');
								setSearch('');
							}}
						>
							Filterlarni tozalash
						</Button>
					</div>
				)}

				{!isLoading && !error && filtered.length > 0 && (
					<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{filtered.map(test => (
							<OlympiadCard
								key={test.id}
								test={test}
								onClick={() => handleSelect(test)}
							/>
						))}
					</div>
				)}
			</div>

			<Footer />

			{selected && (
				<PaymentModal
					test={selected}
					onClose={() => setSelected(null)}
				/>
			)}
		</div>
	);
};

export default OlympiadList;
