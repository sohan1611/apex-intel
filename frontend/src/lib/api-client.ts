import { AnalyzeRequest, AnalyzeResponse, AnalysisStatus } from './api-types';
import { FullReport, ReportListItem } from '@/types/report';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  if (typeof window !== 'undefined') {
    console.error('NEXT_PUBLIC_API_URL is not defined in the environment.');
  }
}


class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

import { getSession, signOut } from 'next-auth/react';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const session = await getSession();
  const token = (session as { accessToken?: string })?.accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        signOut({ callbackUrl: '/login?session_expired=true' });
      }
    }
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = Array.isArray(errorData.detail) 
          ? errorData.detail.map((d: { msg: string }) => d.msg).join(', ') 
          : errorData.detail;
      }
    } catch {
      // Ignore if no JSON body
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

export const apiClient = {
  analyze: (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
    return fetchApi<AnalyzeResponse>('/api/v1/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAnalysisStatus: (id: string): Promise<AnalysisStatus> => {
    return fetchApi<AnalysisStatus>(`/api/v1/analyze/${id}/status`);
  },

  getReport: (id: string): Promise<FullReport> => {
    return fetchApi<FullReport>(`/api/v1/report/${id}`);
  },

  getReports: async (): Promise<ReportListItem[]> => {
    const res = await fetchApi<{ reports: ReportListItem[]; total: number }>('/api/v1/reports');
    return res.reports ?? [];
  },

  upgradeSubscription: async (tier: string): Promise<{ message: string; new_tier: string; checkout_url?: string }> => {
    return fetchApi<{ message: string; new_tier: string; checkout_url?: string }>('/api/v1/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  },

  purchaseCredits: async (amount: number): Promise<{ message: string; purchased_credits: number; checkout_url?: string }> => {
    return fetchApi<{ message: string; purchased_credits: number; checkout_url?: string }>('/api/v1/billing/credits', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  getAdminStats: async (): Promise<{ total_analyses: number; active_users: number; average_score: number; system_health: string }> => {
    return fetchApi<{ total_analyses: number; active_users: number; average_score: number; system_health: string }>('/api/v1/admin/stats');
  },

  getAdminUsers: async (): Promise<{ id: string; email: string; name: string; is_admin: boolean; created_at: string }[]> => {
    return fetchApi<{ id: string; email: string; name: string; is_admin: boolean; created_at: string }[]>('/api/v1/admin/users');
  },
};
