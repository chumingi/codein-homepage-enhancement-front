export type RecruitmentType = 'STUDY' | 'PROJECT' | 'CONTEST' | 'MENTORING';

export type RecruitmentStatus = 'RECRUITING' | 'CLOSED' | 'COMPLETED';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ActivityListItem {
	id: number;
	title: string;
	recruitment_type: RecruitmentType;
	recruitment_status: RecruitmentStatus;
	current_participants: number;
	max_participants: number;
	tech_stacks: string[];
	deadline: string;
}

export interface ActivityDetail extends ActivityListItem {
	content: string;
	activity_period?: string | null;
	is_owner: boolean;
	is_applied?: boolean;
}

export interface ApplicationItem {
	applicant_id: number;
	applicant_name: string;
	message?: string | null;
	status: ApplicationStatus;
	applied_at: string;
}

export interface ActivityListResponse {
	items: ActivityListItem[];
	total: number;
}

export interface ActivityListParams {
	recruitment_type?: RecruitmentType;
	recruitment_status?: RecruitmentStatus;
	search_keyword?: string;
	size?: number;
}

export interface ApplyActivityPayload {
	message?: string;
}
