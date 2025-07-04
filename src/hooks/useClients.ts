
import { useQuery } from '@tanstack/react-query';
import { createApiUrl } from '@/lib/api';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch(createApiUrl('/api/clients'));
      if (!res.ok) throw new Error('Error fetching clients');
      return res.json();
    }
  });
}
