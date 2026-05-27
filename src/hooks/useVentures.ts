import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { fetchVentures } from '../api/ventures';

export function useVentures() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['ventures'],
    queryFn: () => fetchVentures(getToken),
  });
}
