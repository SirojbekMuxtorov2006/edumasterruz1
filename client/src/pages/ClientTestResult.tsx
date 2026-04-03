import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { SubmitAnswersResponse } from '@/hooks/useSubmitAnswers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, MinusCircle, Home } from 'lucide-react';

type LocationState = SubmitAnswersResponse;

const ClientTestResult = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState | null;

	if (!state) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center gap-3'>
				<p className='text-sm text-gray-600'>
					Bu sahifa faqat test topshirilgandan so&apos;ng ko&apos;rinadi.
				</p>
				<Button onClick={() => navigate('/tests')} className='bg-indigo-600 hover:bg-indigo-700'>
					Testlar ro&apos;yxatiga qaytish
				</Button>
			</div>
		);
	}

	const { score, total_questions, correct_answers, results } = state;
	const incorrect = total_questions - correct_answers;
	const percentage = total_questions ? Math.round((correct_answers / total_questions) * 100) : 0;

	return (
		<div className='min-h-screen bg-gray-50 flex flex-col'>
			<div className='max-w-3xl mx-auto w-full px-4 py-8 space-y-6'>
				<Card className='shadow-md border-indigo-100'>
					<CardHeader className='text-center'>
						<CardTitle className='text-2xl font-bold text-indigo-900'>
							Test yakunlandi (#{id})
						</CardTitle>
						<p className='text-sm text-gray-500 mt-1'>
							Umumiy ball: <b>{score}</b> · Savollar: <b>{total_questions}</b>
						</p>
					</CardHeader>
					<CardContent className='space-y-4 pb-6'>
						<div className='flex items-center justify-center gap-8'>
							<div className='text-center'>
								<div className='text-5xl font-extrabold text-indigo-600'>{percentage}%</div>
								<p className='text-xs text-gray-500 mt-1'>foiz natija</p>
							</div>
							<div className='grid grid-cols-3 gap-3 text-center text-xs'>
								<div className='bg-green-50 border border-green-100 rounded-xl px-3 py-2'>
									<CheckCircle className='w-4 h-4 text-green-500 mx-auto mb-1' />
									<div className='font-bold text-green-700'>{correct_answers}</div>
									<div className='text-green-600'>to&apos;g&apos;ri</div>
								</div>
								<div className='bg-red-50 border border-red-100 rounded-xl px-3 py-2'>
									<XCircle className='w-4 h-4 text-red-500 mx-auto mb-1' />
									<div className='font-bold text-red-700'>{incorrect}</div>
									<div className='text-red-600'>noto&apos;g&apos;ri</div>
								</div>
								<div className='bg-gray-50 border border-gray-200 rounded-xl px-3 py-2'>
									<MinusCircle className='w-4 h-4 text-gray-400 mx-auto mb-1' />
									<div className='font-bold text-gray-600'>
										{total_questions - correct_answers - incorrect}
									</div>
									<div className='text-gray-500'>javobsiz</div>
								</div>
							</div>
						</div>

						<div className='flex gap-3 pt-2'>
							<Button
								className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white'
								onClick={() => navigate(`/tests/${state.test_id}`)}
							>
								Testni qayta ishlash
							</Button>
							<Button
								variant='outline'
								className='flex-1'
								onClick={() => navigate('/')}
							>
								<Home className='w-4 h-4 mr-1' />
								Bosh sahifa
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className='border-gray-200'>
					<CardHeader>
						<CardTitle className='text-base text-gray-800'>Javoblar tafsiloti</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3 pb-6'>
						{results.map((r, idx) => {
							const notAnswered = !r.submitted_answer;
							const isCorrect = r.is_correct;

							return (
								<div
									key={r.question_id}
									className={`text-sm rounded-xl border px-3 py-2.5 flex items-start gap-2 ${
										notAnswered
											? 'bg-gray-50 border-gray-200'
											: isCorrect
												? 'bg-green-50 border-green-200'
												: 'bg-red-50 border-red-200'
									}`}
								>
									<div className='mt-0.5'>
										{notAnswered ? (
											<MinusCircle className='w-4 h-4 text-gray-400' />
										) : isCorrect ? (
											<CheckCircle className='w-4 h-4 text-green-500' />
										) : (
											<XCircle className='w-4 h-4 text-red-500' />
										)}
									</div>
									<div>
										<div className='text-gray-600 font-medium mb-1'>
											{idx + 1}-savol
										</div>
										<div className='text-xs text-gray-500'>
											Sizning javobingiz:{' '}
											<span className='font-semibold'>
												{r.submitted_answer || '—'}
											</span>
											{' · '}
											To&apos;g&apos;ri javob:{' '}
											<span className='font-semibold text-green-700'>
												{r.correct_answer}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ClientTestResult;

