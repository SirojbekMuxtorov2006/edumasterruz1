import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ClientSubject {
	id: number;
	name: string;
}

export const useClientSubjects = () => {
	return useQuery({
		queryKey: ['client-subjects'],
		queryFn: async () => {
			const { data } = await api.get<ClientSubject[]>('/client/subjects');
			return data;
		},
	});
};

