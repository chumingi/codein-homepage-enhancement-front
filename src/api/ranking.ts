import type { RankingFilters, RankingListResponse } from '../types/ranking';

const MOCK_RANKINGS: RankingListResponse = {
	items: [
		{
			rank: 1,
			user_id: 1,
			user_name: '박알고',
			student_id: '20240001',
			major: '컴퓨터공학과',
			generation: '12기',
			rank_name: 'diamond',
			points: 18420,
			solved_count: 148,
			accepted_rate: 92,
			updated_at: '2026-06-01T09:00:00+09:00',
		},
		{
			rank: 2,
			user_id: 2,
			user_name: '이코드',
			student_id: '20240012',
			major: '소프트웨어학과',
			generation: '12기',
			rank_name: 'platinum',
			points: 16230,
			solved_count: 131,
			accepted_rate: 89,
			updated_at: '2026-06-01T09:00:00+09:00',
		},
		{
			rank: 3,
			user_id: 3,
			user_name: '최문제',
			student_id: '20250008',
			major: '인공지능학과',
			generation: '13기',
			rank_name: 'gold',
			points: 14110,
			solved_count: 119,
			accepted_rate: 87,
			updated_at: '2026-06-01T09:00:00+09:00',
		},
		{
			rank: 4,
			user_id: 4,
			user_name: '정배열',
			student_id: '20250015',
			major: '컴퓨터공학과',
			generation: '13기',
			rank_name: 'gold',
			points: 12960,
			solved_count: 104,
			accepted_rate: 84,
			updated_at: '2026-06-01T09:00:00+09:00',
		},
		{
			rank: 5,
			user_id: 5,
			user_name: '한풀이',
			student_id: '20250021',
			major: '데이터사이언스학과',
			generation: '13기',
			rank_name: 'silver',
			points: 11840,
			solved_count: 93,
			accepted_rate: 81,
			updated_at: '2026-06-01T09:00:00+09:00',
		},
	],
	total: 5,
	page: 1,
	page_size: 10,
	total_pages: 1,
};

export const getRankings = async (filters: RankingFilters = {}): Promise<RankingListResponse> => {
	const pageSize = filters.page_size ?? MOCK_RANKINGS.page_size;
	const page = filters.page ?? 1;
	const keyword = filters.search?.toLowerCase() ?? '';

	const items = MOCK_RANKINGS.items
		.filter((item) => (filters.rank ? item.rank_name === filters.rank : true))
		.filter((item) => {
			if (!keyword) return true;
			return [item.user_name, item.student_id, item.major, item.generation].some((value) =>
				value.toLowerCase().includes(keyword),
			);
		});

	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const start = (page - 1) * pageSize;

	return {
		items: items.slice(start, start + pageSize),
		total,
		page,
		page_size: pageSize,
		total_pages: totalPages,
	};
};
