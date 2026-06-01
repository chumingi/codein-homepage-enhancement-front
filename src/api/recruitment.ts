import { format } from 'date-fns';
import type {
	ActivityDetail,
	ActivityListParams,
	ActivityListResponse,
	ApplicationItem,
	ApplyActivityPayload,
	RecruitmentStatus,
} from '../types/recruitment';

const today = format(new Date(), 'yyyy-MM-dd');

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ACTIVITY_FIXTURES: ActivityDetail[] = [
	{
		id: 1,
		title: 'CodeIn 프론트엔드 스터디 2기',
		recruitment_type: 'STUDY',
		recruitment_status: 'RECRUITING',
		current_participants: 8,
		max_participants: 10,
		tech_stacks: ['React', 'TypeScript', 'Vite'],
		deadline: `${today}T23:59:00+09:00`,
		content: '프론트엔드 기초부터 실전 프로젝트까지 함께 학습하는 스터디입니다.',
		activity_period: '2026.06 - 2026.08',
		is_owner: false,
		is_applied: false,
	},
	{
		id: 2,
		title: 'AI 서비스 개발 프로젝트 팀원 모집',
		recruitment_type: 'PROJECT',
		recruitment_status: 'RECRUITING',
		current_participants: 4,
		max_participants: 6,
		tech_stacks: ['Python', 'FastAPI', 'Next.js'],
		deadline: `${today}T20:00:00+09:00`,
		content: '생성형 AI를 활용한 캠퍼스 서비스 제작 프로젝트입니다.',
		activity_period: '2026.06 - 2026.09',
		is_owner: true,
		is_applied: false,
	},
	{
		id: 3,
		title: '여름 공모전 참가팀 모집 완료',
		recruitment_type: 'CONTEST',
		recruitment_status: 'CLOSED',
		current_participants: 5,
		max_participants: 5,
		tech_stacks: ['Design', 'Branding'],
		deadline: `${today}T09:00:00+09:00`,
		content: '공모전 참가 준비를 위한 팀 빌딩이 완료된 모집 글입니다.',
		activity_period: '2026.05 - 2026.07',
		is_owner: false,
		is_applied: true,
	},
];

const APPLICATION_FIXTURES: Record<number, ApplicationItem[]> = {
	2: [
		{
			applicant_id: 101,
			applicant_name: '김개발',
			message: '백엔드와 배포를 맡아보고 싶습니다.',
			status: 'PENDING',
			applied_at: `${today}T08:40:00+09:00`,
		},
		{
			applicant_id: 102,
			applicant_name: '이디자인',
			message: 'UX 기획 경험이 있습니다.',
			status: 'APPROVED',
			applied_at: `${today}T09:15:00+09:00`,
		},
	],
};

const matchesKeyword = (item: ActivityDetail, keyword?: string) => {
	if (!keyword) return true;
	const normalized = keyword.toLowerCase();
	return [item.title, item.content, ...item.tech_stacks].some((value) => value.toLowerCase().includes(normalized));
};

const matchesStatus = (item: ActivityDetail, status?: RecruitmentStatus) => {
	if (!status) return true;
	return item.recruitment_status === status;
};

const matchesType = (item: ActivityDetail, type?: ActivityListParams['recruitment_type']) => {
	if (!type) return true;
	return item.recruitment_type === type;
};

const toListItem = ({ content, activity_period, is_owner, is_applied, ...item }: ActivityDetail) => item;

export const getActivities = async (filters: ActivityListParams = {}): Promise<ActivityListResponse> => {
	const items = ACTIVITY_FIXTURES.filter((item) => matchesType(item, filters.recruitment_type))
		.filter((item) => matchesStatus(item, filters.recruitment_status))
		.filter((item) => matchesKeyword(item, filters.search_keyword))
		.map(toListItem)
		.slice(0, filters.size ?? ACTIVITY_FIXTURES.length);

	return {
		items: clone(items),
		total: items.length,
	};
};

export const getActivity = async (id: number): Promise<ActivityDetail> => {
	const activity = ACTIVITY_FIXTURES.find((item) => item.id === id);
	if (!activity) {
		throw new Error('Activity not found');
	}
	return clone(activity);
};

export const applyActivity = async (_id: number, _payload: ApplyActivityPayload): Promise<void> => {
	return;
};

export const cancelApplication = async (_id: number): Promise<void> => {
	return;
};

export const getApplications = async (id: number): Promise<ApplicationItem[]> => {
	return clone(APPLICATION_FIXTURES[id] ?? []);
};

export const updateApplicationStatus = async (
	id: number,
	applicantId: number,
	status: Exclude<ApplicationItem['status'], 'PENDING'>,
): Promise<void> => {
	const applications = APPLICATION_FIXTURES[id];
	if (!applications) return;

	const application = applications.find((item) => item.applicant_id === applicantId);
	if (application) {
		application.status = status;
	}
};
