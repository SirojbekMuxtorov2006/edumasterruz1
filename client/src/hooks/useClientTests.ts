import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ClientTestListItem {
	id: number;
	name: string;
	price: number;
	level_id: number;
	level_name?: string | null;
	subject_id?: number | null;
	question_count: number;
}

interface TestsListResponse {
	items: ClientTestListItem[];
	total: number;
	skip: number;
	limit: number;
}

interface UseClientTestsParams {
	subject_id?: number;
	level_id?: number;
	min_price?: number;
	max_price?: number;
	start_date?: string;
	end_date?: string;
	skip?: number;
	limit?: number;
}

export const useClientTests = (params: UseClientTestsParams = {}) => {
	return useQuery({
		queryKey: ['client-tests', params],
		queryFn: async () => {
			const { data } = await api.get<TestsListResponse>('/client/tests', {
				params,
			});
			return data;
		},
	});
};

