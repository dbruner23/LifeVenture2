import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { fetchVentures, type VentureQuery } from '../api/ventures';

export function useVentures(query: VentureQuery = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['ventures', query],
    queryFn: () => fetchVentures(getToken, query),
  });
}
