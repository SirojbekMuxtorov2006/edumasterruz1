import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useClientTestDetail } from '@/hooks/useClientTestDetail';
import { useSubmitAnswers } from '@/hooks/useSubmitAnswers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, Clock, Flag } from 'lucide-react';

const QUIZ_DURATION = 45 * 60; // 45 daqiqa (soniyada)

function ClientTestQuiz() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const testId = Number(id);

	const { data: test, isLoading, error } = useClientTestDetail(testId);
	const { mutateAsync: submitAnswers, isPending: submitting } = useSubmitAnswers();

	const draftKey = `quiz_draft_${testId}`;
	const [currentIdx, setCurrentIdx] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string>>(() => {
		try {
			const raw = localStorage.getItem(draftKey);
			return raw ? (JSON.parse(raw) as Record<number, string>) : {};
		} catch {
			return {};
		}
	});
	const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
	const [finished, setFinished] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const finishRef = useRef<() => void | Promise<void>>(() => {});

	useEffect(() => {
		try {
			localStorage.setItem(draftKey, JSON.stringify(answers));
		} catch {
			/* ignore */
		}
	}, [answers, draftKey]);

	useEffect(() => {
		const onVis = () => {
			if (document.visibilityState === 'hidden') {
				toast.warning("Test oynasidan chiqdingiz", {
					description: "Javoblaringiz qurilmangizda vaqtincha saqlanmoqda.",
					duration: 4000,
				});
			}
		};
		document.addEventListener('visibilitychange', onVis);
		return () => document.removeEventListener('visibilitychange', onVis);
	}, []);

	const formatTime = (s: number) => {
		const m = String(Math.floor(s / 60)).padStart(2, '0');
		const sec = String(s % 60).padStart(2, '0');
		return `${m}:${sec}`;
	};

	const handleFinish = async () => {
		if (finished || !test) return;
		clearInterval(timerRef.current!);
		setFinished(true);

		try {
			const payload = test.questions.map(q => ({
				question_id: q.id,
				answer: answers[q.id] ?? '',
			}));
			const result = await submitAnswers({ testId, body: { answers: payload } });
			localStorage.removeItem(draftKey);
			// Natijani localStorage ga saqlash — result sahifasida o'qiladi
			localStorage.setItem(`quiz_result_${testId}`, JSON.stringify(result));
			navigate(`/tests/${testId}/result`, { replace: true });
		} catch {
			navigate(`/tests/${testId}/result`, { replace: true });
		}
	};

	finishRef.current = handleFinish;

	// Timer — finishRef orqali closure xatolari va eslint ogohlantirishlari yo‘q
	useEffect(() => {
		if (!test || finished) return;
		timerRef.current = setInterval(() => {
			setTimeLeft(t => {
				if (t <= 1) {
					clearInterval(timerRef.current!);
					void finishRef.current();
					return 0;
				}
				return t - 1;
			});
		}, 1000);
		return () => clearInterval(timerRef.current!);
	}, [test, finished]);

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='flex flex-col items-center gap-3'>
					<div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
					<p className='text-sm text-slate-500'>Test yuklanmoqda...</p>
				</div>
			</div>
		);
	}

	if (error || !test) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center space-y-3'>
					<p className='text-red-600'>Test topilmadi yoki xatolik yuz berdi.</p>
					<Button onClick={() => navigate('/dashboard')} variant='outline'>
						Orqaga
					</Button>
				</div>
			</div>
		);
	}

	const questions = test.questions;
	const totalQ = questions.length;
	const currentQ = questions[currentIdx];
	const answeredCount = Object.keys(answers).length;
	const progressPct = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;
	const isLowTime = timeLeft < 60;

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
			{/* Top bar */}
			<div className='bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between shadow'>
				<span className='font-bold text-sm truncate max-w-xs'>{test.name}</span>
				<div
					className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-sm ${
						isLowTime ? 'bg-red-500/90 animate-pulse' : 'bg-white/20'
					}`}
				>
					{isLowTime ? <AlertTriangle className='w-4 h-4' /> : <Clock className='w-4 h-4' />}
					{formatTime(timeLeft)}
				</div>
			</div>

			{/* Progress bar */}
			<div className='bg-white border-b px-4 py-2.5'>
				<div className='flex justify-between text-xs text-gray-500 mb-1.5'>
					<span>
						Savol <strong className='text-gray-800'>{currentIdx + 1}</strong> / {totalQ}
					</span>
					<span>
						Javob: <strong className='text-indigo-600'>{answeredCount}</strong> ta
					</span>
				</div>
				<Progress value={progressPct} className='h-2' />
			</div>

			{/* Content */}
			<div className='flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-4'>
				{/* Question dots */}
				<div className='flex flex-wrap gap-1.5 justify-center'>
					{questions.map((q, i) => (
						<button
							key={q.id}
							onClick={() => setCurrentIdx(i)}
							className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${
								i === currentIdx
									? 'bg-indigo-600 text-white border-indigo-600 scale-110'
									: answers[q.id]
										? 'bg-green-500 text-white border-green-500'
										: 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
							}`}
						>
							{i + 1}
						</button>
					))}
				</div>

				{/* Question card */}
				<div className='bg-white rounded-2xl border border-gray-200 shadow-sm p-5'>
					<div className='flex items-center gap-2 mb-3'>
						{answers[currentQ.id] && (
							<Badge
								variant='outline'
								className='text-green-600 border-green-200 bg-green-50 text-xs'
							>
								<CheckCircle2 className='w-3 h-3 mr-1' /> Javob berildi
							</Badge>
						)}
					</div>
					<p className='text-gray-900 font-medium leading-relaxed whitespace-pre-line'>
						{currentQ.text}
					</p>
				</div>

				{/* Options */}
				<div className='space-y-2'>
					{currentQ.options.map(opt => {
						const selected = answers[currentQ.id] === opt.label;
						return (
							<button
								key={opt.id}
								onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.label }))}
								className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
									selected
										? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-semibold'
										: 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-gray-800'
								}`}
							>
								<span className='w-7 h-7 flex-shrink-0 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold'>
									{opt.label}
								</span>
								<span className='text-sm leading-snug'>{opt.text}</span>
							</button>
						);
					})}
				</div>

				{/* Navigation */}
				<div className='flex gap-3 mt-auto pt-2'>
					<Button
						variant='outline'
						className='flex-1'
						onClick={() => setCurrentIdx(i => Math.max(i - 1, 0))}
						disabled={currentIdx === 0}
					>
						<ChevronLeft className='w-4 h-4 mr-1' /> Oldingi
					</Button>

					{currentIdx === totalQ - 1 ? (
						<Button
							className='flex-1 bg-green-600 hover:bg-green-700 text-white font-bold'
							onClick={handleFinish}
							disabled={submitting || finished}
						>
							{submitting ? (
								<div className='flex items-center gap-2'>
									<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
									Yuborilmoqda...
								</div>
							) : (
								<>
									<Flag className='w-4 h-4 mr-2' />
									Tugatish ({answeredCount}/{totalQ})
								</>
							)}
						</Button>
					) : (
						<Button
							className='flex-1 bg-indigo-600 hover:bg-indigo-700'
							onClick={() => setCurrentIdx(i => Math.min(i + 1, totalQ - 1))}
						>
							Keyingi <ChevronRight className='w-4 h-4 ml-1' />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
export default ClientTestQuiz;
