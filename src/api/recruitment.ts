import api from './axios';
import type {
  ActivityDetail,
  ActivityListItem,
  ActivityListParams,
  ActivityListResponse,
  ApplyActivityPayload,
  ApplicationItem,
} from '../types/recruitment';

// TODO: 백엔드 API 연동 완료 후 목업 데이터 제거

const MOCK_ITEMS: ActivityListItem[] = [
  {
    id: 1,
    title: '리액트 스터디 모집',
    recruitment_type: 'STUDY',
    recruitment_status: 'RECRUITING',
    current_participants: 2,
    max_participants: 5,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    tech_stacks: ['React', 'TypeScript'],
  },
];

const MOCK_DETAIL: ActivityDetail = {
  ...MOCK_ITEMS[0],
  content: '목업 상세 내용입니다.',
  is_owner: false,
};

export const getActivities = async (params: ActivityListParams): Promise<ActivityListResponse> => {
  // TODO: 실 API 교체
  // const response = await api.get<ActivityListResponse>('/recruitment', { params });
  // return response.data;
  void api; void params;
  return { items: MOCK_ITEMS, total: MOCK_ITEMS.length };
};

export const getActivity = async (id: number): Promise<ActivityDetail> => {
  // TODO: 실 API 교체
  // const response = await api.get<ActivityDetail>(`/recruitment/${id}`);
  // return response.data;
  void id;
  return MOCK_DETAIL;
};

export const applyActivity = async (id: number, payload: ApplyActivityPayload): Promise<void> => {
  // TODO: 실 API 교체
  // await api.post(`/recruitment/${id}/apply`, payload);
  void id; void payload;
};

export const cancelApplication = async (id: number): Promise<void> => {
  // TODO: 실 API 교체
  // await api.delete(`/recruitment/${id}/apply`);
  void id;
};

export const getApplications = async (id: number): Promise<ApplicationItem[]> => {
  // TODO: 실 API 교체
  // const response = await api.get<ApplicationItem[]>(`/recruitment/${id}/applications`);
  // return response.data;
  void id;
  return [];
};

export const updateApplicationStatus = async (
  activityId: number,
  applicantId: number,
  status: 'APPROVED' | 'REJECTED',
): Promise<void> => {
  // TODO: 실 API 교체
  // await api.patch(`/recruitment/${activityId}/applications/${applicantId}`, { status });
  void activityId; void applicantId; void status;
};
