import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Home } from 'lucide-react';
import type { SubmitAnswersResponse } from '@/hooks/useSubmitAnswers';

function ClientTestResult() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const raw = localStorage.getItem(`quiz_result_${id}`);
	const result: SubmitAnswersResponse | null = raw ? JSON.parse(raw) : null;

	if (!result) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center space-y-3'>
					<p className='text-gray-500'>Natija topilmadi.</p>
					<Button onClick={() => navigate('/dashboard')} className='bg-indigo-600'>
						Dashboardga qaytish
					</Button>
				</div>
			</div>
		);
	}

	const { score, correct_answers, total_questions, results } = result;
	const isPassed = score >= 60;

	return (
		<div className='min-h-screen bg-gray-50 py-10'>
			<div className='max-w-2xl mx-auto px-4 space-y-6'>
				{/* Score card */}
				<Card className='overflow-hidden'>
					<div className={`h-2 ${isPassed ? 'bg-green-500' : 'bg-red-400'}`} />
					<CardContent className='pt-8 pb-6 text-center space-y-4'>
						<div className='mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gray-50 border-4 border-gray-100'>
							<Trophy className={`w-10 h-10 ${isPassed ? 'text-yellow-500' : 'text-gray-400'}`} />
						</div>
						<div>
							<p className={`text-5xl font-bold ${isPassed ? 'text-green-600' : 'text-red-500'}`}>
								{score}%
							</p>
							<p className='text-gray-500 mt-1'>
								{correct_answers} / {total_questions} to'g'ri javob
							</p>
						</div>
						<p className={`font-semibold text-lg ${isPassed ? 'text-green-700' : 'text-red-600'}`}>
							{isPassed ? "Tabriklaymiz! O'tdingiz." : "Keyingi safar muvaffaq bo'lasiz."}
						</p>
					</CardContent>
				</Card>

				{/* Answers breakdown */}
				<Card>
					<CardContent className='pt-5 divide-y'>
						<p className='font-semibold text-sm text-gray-700 pb-3'>Javoblar tahlili</p>
						{results.map((r, i) => (
							<div key={r.question_id} className='flex items-center gap-3 py-2.5'>
								<span className='text-xs text-gray-400 w-5'>{i + 1}</span>
								{r.is_correct ? (
									<CheckCircle2 className='w-4 h-4 text-green-500 flex-shrink-0' />
								) : (
									<XCircle className='w-4 h-4 text-red-400 flex-shrink-0' />
								)}
								<div className='flex-1 text-sm'>
									<span className='text-gray-600'>Siz: </span>
									<span
										className={`font-medium ${r.is_correct ? 'text-green-700' : 'text-red-600'}`}
									>
										{r.submitted_answer || '—'}
									</span>
									{!r.is_correct && (
										<>
											<span className='text-gray-400 mx-2'>·</span>
											<span className='text-gray-500'>To'g'ri: </span>
											<span className='font-medium text-green-700'>{r.correct_answer}</span>
										</>
									)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Actions */}
				<div className='flex gap-3'>
					<Button
						variant='outline'
						className='flex-1 gap-2'
						onClick={() => navigate(`/tests/${id}`)}
					>
						<RotateCcw size={15} /> Qayta urinish
					</Button>
					<Button
						className='flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2'
						onClick={() => navigate('/dashboard')}
					>
						<Home size={15} /> Dashboard
					</Button>
				</div>
			</div>
		</div>
	);
}

export default ClientTestResult;
