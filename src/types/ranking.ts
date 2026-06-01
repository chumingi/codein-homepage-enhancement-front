export interface RankingEntry {
	rank: number;
	user_id: number;
	user_name: string;
	student_id: string;
	major: string;
	generation: string;
	rank_name: string;
	points: number;
	solved_count: number;
	accepted_rate: number;
	updated_at: string;
}

export interface RankingListResponse {
	items: RankingEntry[];
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
}

export interface RankingFilters {
	search?: string;
	rank?: string;
	page?: number;
	page_size?: number;
}
