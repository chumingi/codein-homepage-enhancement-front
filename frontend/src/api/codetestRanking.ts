import api from './axios';

export interface CodetestRankingItem {
  user_id: number;
  nickname: string;
  total_submissions: number;
  correct_rate: number;
  last_active_at: string | null;
  rank: number;
  score: number;
  difficulty_breakdown: Record<string, number>;
}

export interface CodetestRankingResponse {
  rankings: CodetestRankingItem[];
  period: string;
}

export interface CodetestUserStats {
  user_id: number;
  nickname: string;
  total_submissions: number;
  correct_rate: number;
  last_active_at: string | null;
  rank: number;
  score: number;
  difficulty_breakdown: Record<string, number>;
}

export const getCodetestRankings = async (period: 'all' | 'semester' | 'month' = 'all') => {
  const response = await api.get<CodetestRankingResponse>('/codetest/rankings', { params: { period } });
  return response.data;
};

export const getCodetestUserStats = async (userId: number, period: 'all' | 'semester' | 'month' = 'all') => {
  const response = await api.get<CodetestUserStats>('/codetest/user-stats', { params: { user_id: userId, period } });
  return response.data;
};
