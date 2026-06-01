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

// TODO: 실 API 연동 시 GuideStepItem으로 교체.
// 필드명 변경: path→target_url, completed→is_completed, locked→is_locked
// 추가 필드: step_id, slug, is_hidden
// Swagger GuideStepItem: { step_id, slug, title, description, target_url, is_completed, is_locked, is_hidden }
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
  // TODO: 실 API 교체 — GET /guide/status
  // 주의: 실 API 응답은 OnboardingStep[]이 아닌 GuideDashboard 객체.
  // 연동 시: const res = await api.get<GuideDashboard>('/guide/status'); return res.data.steps;
  // GuideDashboard 타입도 함께 정의 필요: { is_all_completed: boolean; steps: GuideStepItem[] }
  void api;
  return [
    { title: '회원가입', path: '/register', completed: true, locked: false, description: 'CodeIn 계정을 생성하고 동아리 멤버가 되어보세요.' },
    { title: '프로필 작성', path: '/profile', completed: false, locked: false, description: '관심 분야와 기술 스택을 입력하여 나를 소개하세요.' },
    { title: '코딩테스트 응시', path: '/contest', completed: false, locked: true, description: '레벨 테스트에 응시하여 나의 실력을 증명하세요.' },
    { title: '랭크 배정', path: '/profile', completed: false, locked: true, description: '테스트 결과에 따라 초기 랭크를 부여받습니다.' },
    { title: '추천 스터디 안내', path: '/events', completed: false, locked: true, description: '나의 관심사와 레벨에 맞는 스터디를 추천받고 참여하세요.' },
  ];
};

export const getGuideCompleted = async (): Promise<GuideCompletedResponse> => {
  // TODO: 실 API 교체 — GET /guide/completed
  // const response = await api.get<GuideCompletedResponse>('/guide/completed');
  // return response.data;
  return { is_guide_completed: false };
};
