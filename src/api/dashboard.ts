import api from './axios';

export interface PopularPost {
  id: number;
  title: string;
  view_count: number;
  board_id: number;
  board_name?: string;
  author_id: number;
  author_name?: string;
  created_at: string;
  comment_count: number;
}

export interface PopularPostsResponse {
  posts: PopularPost[];
  period: string;
}

export const getPopularPosts = async (period: 'day' | 'week' | 'month' = 'week', limit: number = 5): Promise<PopularPostsResponse> => {
  const response = await api.get<PopularPostsResponse>('/dashboard/popular-posts', {
    params: { period, limit }
  });
  return response.data;
};

export interface OnboardingStep {
  title: string;
  path: string;
  completed: boolean;
  locked: boolean;
  description?: string;
}

export interface GuideCompletedResponse {
  is_guide_completed: boolean;
}

// TODO: 백엔드 API 연동 완료 후 목업 데이터 제거

export const getStartGuide = async (): Promise<OnboardingStep[]> => {
  // TODO: 실 API 교체
  // const response = await api.get<OnboardingStep[]>('/dashboard/guide');
  // return response.data;
  void api;
  return [];
};

export const getGuideCompleted = async (): Promise<GuideCompletedResponse> => {
  // TODO: 실 API 교체
  // const response = await api.get<GuideCompletedResponse>('/dashboard/guide/completed');
  // return response.data;
  return { is_guide_completed: false };
};
