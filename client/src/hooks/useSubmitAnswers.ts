import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SubmitAnswerItem {
	question_id: number;
	answer: string;
}

export interface SubmitAnswersBody {
	answers: SubmitAnswerItem[];
}

export interface AnswerResult {
	question_id: number;
	submitted_answer: string;
	correct_answer: string;
	is_correct: boolean;
}

export interface SubmitAnswersResponse {
	test_id: number;
	total_questions: number;
	correct_answers: number;
	score: number;
	results: AnswerResult[];
}

export const useSubmitAnswers = () => {
	return useMutation({
		mutationFn: async ({ testId, body }: { testId: number; body: SubmitAnswersBody }) => {
			const { data } = await api.post<SubmitAnswersResponse>(
				`/client/tests/${testId}/submit-answers`,
				body,
			);
			return data;
		},
	});
};

