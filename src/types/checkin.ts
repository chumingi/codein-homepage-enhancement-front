export interface StampInfo {
	board_size: number;
	current_cycle: number;
	progress: number;
	daily_points?: number;
	reward_points?: number;
}

export interface TodayCheckInStatus {
	date: string;
	checked_in: boolean;
	checked_in_at: string | null;
	points_earned: number | null;
	stamp: StampInfo;
}

export type CheckInResultStatus = 'success' | 'already_checked_in' | 'error';

export interface CheckInResult {
	status: CheckInResultStatus;
	message?: string;
	checked_in_at: string | null;
	points_earned: number | null;
	stamp: StampInfo;
}

export interface AdminDailyCheckInRecord {
	user_id: number;
	user_name: string;
	student_id: string;
	status: 'present' | null;
	checked_in_at: string | null;
}

export interface AdminDailyStats {
	date: string;
	stats: {
		total_members: number;
		attended: number;
		absent: number;
		attendance_rate: number;
	};
	records: AdminDailyCheckInRecord[];
}
