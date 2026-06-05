import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AnalyzeRequest } from '@/lib/api-types';

export function useAnalyze() {
  return useMutation({
    mutationFn: (data: AnalyzeRequest) => apiClient.analyze(data),
  });
}

export function useAnalysisStatus(id: string) {
  return useQuery({
    queryKey: ['analysisStatus', id],
    queryFn: () => apiClient.getAnalysisStatus(id),
    // Poll every 3 seconds if it's still processing
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') {
        return false; // Stop polling
      }
      return 3000;
    },
    enabled: !!id,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => apiClient.getReport(id),
    enabled: !!id,
    retry: 2,
  });
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => apiClient.getReports(),
  });
}
