import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { createVenture, type NewVentureInput } from '../api/ventures';

export function useCreateVenture() {
  const { getToken } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: NewVentureInput) => createVenture(getToken, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventures'] });
    },
  });
}
