import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useClientTestDetail } from '@/hooks/useClientTestDetail';
import { useSubmitAnswers } from '@/hooks/useSubmitAnswers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

const ClientTestQuiz = () => {
	const { id } = useParams<{ id: string }>();
	const testId = useMemo(() => (id ? Number(id) : NaN), [id]);
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	const { data: test, isLoading, error } = useClientTestDetail(Number.isNaN(testId) ? undefined : testId);
	const submitMutation = useSubmitAnswers();

	const draftKey = id ? `quiz_draft_page_${id}` : 'quiz_draft_page';
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string>>(() => {
		if (!id) return {};
		try {
			const raw = localStorage.getItem(`quiz_draft_page_${id}`);
			return raw ? (JSON.parse(raw) as Record<number, string>) : {};
		} catch {
			return {};
		}
	});

	useEffect(() => {
		if (Number.isNaN(testId)) return;
		try {
			localStorage.setItem(draftKey, JSON.stringify(answers));
		} catch {
			/* ignore */
		}
	}, [answers, draftKey, testId]);

	useEffect(() => {
		const onVis = () => {
			if (document.visibilityState === 'hidden') {
				toast.warning("Test oynasidan chiqdingiz", {
					description: "Javoblaringiz vaqtincha saqlanmoqda.",
					duration: 4000,
				});
			}
		};
		document.addEventListener('visibilitychange', onVis);
		return () => document.removeEventListener('visibilitychange', onVis);
	}, []);

	// Auth va "ticket" gate — Olympiad flow'iga o'xshash
	useEffect(() => {
		if (!id) return;

		// Foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga yuboramiz
		if (!isAuthenticated) {
			navigate('/login', { replace: true, state: { from: { pathname: `/tests/${id}` } } });
			return;
		}

		// To'lov / ro'yxatdan o'tishdan o'tmagan bo'lsa, testlar ro'yxatiga qaytaramiz
		const ticket = localStorage.getItem(`test_ticket_${id}`);
		if (!ticket) {
			navigate('/tests', { replace: true });
		}
	}, [id, isAuthenticated, navigate]);

	if (Number.isNaN(testId)) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-sm text-red-600'>Test ID noto&apos;g&apos;ri.</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<Loader2 className='w-6 h-6 animate-spin text-indigo-600' />
			</div>
		);
	}

	if (error || !test) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-sm text-red-600'>
					Testni yuklashda xatolik yuz berdi yoki test topilmadi.
				</p>
			</div>
		);
	}

	const total = test.questions.length;
	const current = test.questions[currentIndex];

	const handleSelect = (questionId: number, label: string) => {
		setAnswers(prev => ({ ...prev, [questionId]: label }));
	};

	const goPrev = () => {
		setCurrentIndex(i => Math.max(i - 1, 0));
	};

	const goNext = () => {
		setCurrentIndex(i => Math.min(i + 1, total - 1));
	};

	const handleSubmit = async () => {
		const body = {
			answers: test.questions.map(q => ({
				question_id: q.id,
				answer: answers[q.id] ?? '',
			})),
		};

		try {
			const result = await submitMutation.mutateAsync({ testId, body });
			localStorage.removeItem(draftKey);
			navigate(`/tests/${testId}/result`, { state: result });
		} catch {
			// Xato bo'lsa, mutation ichida console.log bo'lishi mumkin; UI uchun qisqa xabar kifoya
			alert("Natijani saqlashda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
			<div className='max-w-3xl mx-auto w-full px-4 py-6 space-y-5'>
				<button
					onClick={() => navigate('/tests')}
					className='inline-flex items-center text-xs text-gray-500 hover:text-gray-700 mb-2'
				>
					<ChevronLeft className='w-4 h-4 mr-1' />
					Testlar ro&apos;yxatiga qaytish
				</button>

				<Card className='border-gray-200 shadow-sm'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-lg font-semibold flex items-center justify-between'>
							<span>{test.name}</span>
							<Badge variant='outline' className='text-xs'>
								{currentIndex + 1} / {total}
							</Badge>
						</CardTitle>
						{test.level_name && (
							<p className='text-xs text-gray-500 mt-1'>{test.level_name}</p>
						)}
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='text-sm text-gray-700 whitespace-pre-line'>{current.text}</div>

						<div className='space-y-2'>
							{current.options.map(opt => {
								const selected = answers[current.id] === opt.label;
								return (
									<button
										key={opt.id}
										onClick={() => handleSelect(current.id, opt.label)}
										className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
											selected
												? 'border-indigo-500 bg-indigo-50 text-indigo-800'
												: 'border-gray-200 bg-white hover:border-indigo-300'
										}`}
									>
										<span className='w-7 h-7 flex items-center justify-center rounded-full border text-xs font-semibold'>
											{opt.label}
										</span>
										<span>{opt.text}</span>
									</button>
								);
							})}
						</div>

						<div className='flex justify-between pt-4 gap-3'>
							<Button
								variant='outline'
								onClick={goPrev}
								disabled={currentIndex === 0}
								className='flex-1'
							>
								<ChevronLeft className='w-4 h-4 mr-1' />
								Oldingi
							</Button>
							{currentIndex === total - 1 ? (
								<Button
									onClick={handleSubmit}
									className='flex-1 bg-green-600 hover:bg-green-700 text-white'
									disabled={submitMutation.isPending}
								>
									{submitMutation.isPending ? (
										<Loader2 className='w-4 h-4 animate-spin mr-2' />
									) : null}
									Testni yakunlash
								</Button>
							) : (
								<Button onClick={goNext} className='flex-1 bg-indigo-600 hover:bg-indigo-700'>
									Keyingi
									<ChevronRight className='w-4 h-4 ml-1' />
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ClientTestQuiz;

