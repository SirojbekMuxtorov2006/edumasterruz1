import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Olympiad } from '../data/olympiadData';

interface Props {
	olympiad: Olympiad;
}

// answers: { [questionId]: selectedOptionId }
type Answers = Record<string, string>;

const RESULT_KEY = (id: string) => `turon_result_${id}`;
const DRAFT_KEY = (id: string) => `olympiad_draft_${id}`;

export const useOlympiadLogic = ({ olympiad }: Props) => {
	const navigate = useNavigate();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Answers>(() => {
		try {
			const raw = localStorage.getItem(DRAFT_KEY(olympiad.id));
			return raw ? (JSON.parse(raw) as Answers) : {};
		} catch {
			return {};
		}
	});
	const [timeLeft, setTimeLeft] = useState(olympiad.duration * 60);
	const [isFinished, setIsFinished] = useState(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const finishRef = useRef<() => void>(() => {});

	const totalQuestions = olympiad.questions.length;
	const currentQuestion = olympiad.questions[currentQuestionIndex];

	// TZ: javoblarni uzilishdan keyin yo'qolmasligi uchun vaqtincha saqlash
	useEffect(() => {
		try {
			localStorage.setItem(DRAFT_KEY(olympiad.id), JSON.stringify(answers));
		} catch {
			/* ignore quota */
		}
	}, [answers, olympiad.id]);

	// TZ: boshqa varaqga o'tganda ogohlantirish (anti-cheat)
	useEffect(() => {
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') {
				toast.warning("Test oynasidan chiqdingiz", {
					description: "Javoblaringiz saqlanmoqda; imkon qadar testni bu yerdan yakunlang.",
					duration: 4000,
				});
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		return () => document.removeEventListener('visibilitychange', onVisibility);
	}, []);

	const formatTime = (seconds: number) => {
		const m = String(Math.floor(seconds / 60)).padStart(2, '0');
		const s = String(seconds % 60).padStart(2, '0');
		return `${m}:${s}`;
	};

	const selectAnswer = useCallback((questionId: string, optionId: string) => {
		setAnswers(prev => ({ ...prev, [questionId]: optionId }));
	}, []);

	const nextQuestion = useCallback(() => {
		setCurrentQuestionIndex(i => Math.min(i + 1, totalQuestions - 1));
	}, [totalQuestions]);

	const prevQuestion = useCallback(() => {
		setCurrentQuestionIndex(i => Math.max(i - 1, 0));
	}, []);

	// ── Calculate results ──
	const calculateResults = useCallback(() => {
		let correct = 0;
		olympiad.questions.forEach(q => {
			if (answers[q.id] === q.correctAnswerId) correct++;
		});
		const incorrect = totalQuestions - correct;
		const scorePerQuestion = 10;
		const total = correct * scorePerQuestion;
		const percentage = Math.round((correct / totalQuestions) * 100);
		return { correctCount: correct, incorrectCount: incorrect, score: total, percentage };
	}, [answers, olympiad.questions, totalQuestions]);

	const handleFinish = useCallback(() => {
		if (isFinished) return;
		clearInterval(timerRef.current!);
		setIsFinished(true);

		const results = {
			answers,
			...calculateResults(),
			totalQuestions,
		};

		localStorage.removeItem(DRAFT_KEY(olympiad.id));
		// Save to localStorage so OlympiadResult can read it
		localStorage.setItem(RESULT_KEY(olympiad.id), JSON.stringify(results));

		navigate(`/olympiad/${olympiad.id}/result`);
	}, [isFinished, answers, calculateResults, navigate, olympiad.id, totalQuestions]);

	finishRef.current = handleFinish;

	// Start countdown — finishRef orqali har doim yangi handleFinish (taymer qayta ishlamaydi)
	useEffect(() => {
		if (isFinished) return;
		timerRef.current = setInterval(() => {
			setTimeLeft(t => {
				if (t <= 1) {
					clearInterval(timerRef.current!);
					finishRef.current();
					return 0;
				}
				return t - 1;
			});
		}, 1000);
		return () => clearInterval(timerRef.current!);
	}, [isFinished]);

	// For OlympiadResult page — load saved results
	const savedRaw = localStorage.getItem(RESULT_KEY(olympiad.id));
	const saved = savedRaw ? JSON.parse(savedRaw) : null;

	return {
		currentQuestionIndex,
		currentQuestion,
		answers,
		timeLeft,
		totalQuestions,
		isFinished,
		formatTime,
		selectAnswer,
		nextQuestion,
		prevQuestion,
		finishQuiz: handleFinish,
		// Result data
		score: saved?.score ?? 0,
		correctCount: saved?.correctCount ?? 0,
		incorrectCount: saved?.incorrectCount ?? 0,
		percentage: saved?.percentage ?? 0,
		savedAnswers: saved?.answers ?? {},
	};
};
