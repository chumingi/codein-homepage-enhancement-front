export type RecruitmentType = 'STUDY' | 'PROJECT' | 'CONTEST' | 'MENTORING';
export type RecruitmentStatus = 'RECRUITING' | 'CLOSED' | 'COMPLETED';

export interface ActivityListItem {
  id: number;
  title: string;
  recruitment_type: RecruitmentType;
  recruitment_status: RecruitmentStatus;
  current_participants: number;
  max_participants: number;
  deadline: string;
  tech_stacks: string[];
}

export interface ActivityDetail extends ActivityListItem {
  content: string;
  activity_period?: string;
  is_owner: boolean;
}

export interface ApplicationItem {
  applicant_id: number;
  applicant_name: string;
  message?: string;
  applied_at: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ActivityListResponse {
  items: ActivityListItem[];
  total: number;
}

export interface ActivityListParams {
  recruitment_type?: RecruitmentType;
  recruitment_status?: RecruitmentStatus;
  search_keyword?: string;
  page?: number;
  size?: number;
}

export interface ApplyActivityPayload {
  message?: string;
}
