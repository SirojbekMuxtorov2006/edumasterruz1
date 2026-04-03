import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ClientQuestionOption {
	id: number;
	label: string;
	text: string;
}

export interface ClientQuestionDetail {
	id: number;
	text: string;
	options: ClientQuestionOption[];
}

export interface ClientTestDetail {
	id: number;
	name: string;
	price: number;
	level_id: number;
	level_name?: string | null;
	subject_id?: number | null;
	questions: ClientQuestionDetail[];
}

export const useClientTestDetail = (testId?: number) => {
	return useQuery({
		queryKey: ['client-test-detail', testId],
		enabled: !!testId,
		queryFn: async () => {
			const { data } = await api.get<ClientTestDetail>(`/client/tests/${testId}`);
			return data;
		},
	});
};

