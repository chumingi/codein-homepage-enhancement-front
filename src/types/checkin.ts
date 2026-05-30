// GET /attendance/me/status
export interface AttendanceStatus {
  has_attended_today: boolean;
  current_stamp_cycle: number;
  current_stamp_count: number;
  max_stamp_pieces: number;
  streak?: number; // 연속 출석 일수 (2단계)
}

// POST /attendance/me/check (200 OK)
export interface AttendanceCheckResult {
  success: boolean;
  attended_at: string;
  earned_points: number;
  current_stamp_count: number;
  is_board_completed: boolean;
  message: string;
  streak?: number; // 연속 출석 일수 (2단계)
}

// GET /attendance/me/history 아이템 (2단계)
export interface AttendanceHistoryItem {
  date: string;            // "YYYY-MM-DD"
  attended_at: string;
  earned_points: number;
}

// GET /attendance/admin/status
export interface AdminAttendanceDashboard {
  summary: {
    total_members: number;
    attended_count: number;
    absent_count: number;
    attendance_rate: number;
  };
  member_list: AdminMemberAttendance[];
}

export interface AdminMemberAttendance {
  user_id: number;
  nickname: string;
  status: "ATTENDED" | "ABSENT";
  attended_at: string | null;
}

// GET /attendance/me?year=&month= 응답 아이템 (2단계)
export interface AttendanceDayRecord {
  date: string;           // "YYYY-MM-DD"
  checked_in: boolean;
  checked_in_at?: string; // ISO datetime — 출석한 날만 존재
  points_earned?: number;
}

export interface AttendanceHistoryResponse {
  year: number;
  month: number;
  records: AttendanceDayRecord[];
  summary: {
    total_attended: number;
    current_streak: number;
  };
}

// GET/PATCH /attendance/admin/policy
export interface AttendancePolicy {
  stamp_board_size: number;
  daily_points: number;
  reward_points: number;
  updated_at: string;
}
