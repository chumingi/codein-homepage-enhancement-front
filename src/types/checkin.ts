// GET /attendance/me/status
export interface AttendanceStatus {
  has_attended_today: boolean;
  current_stamp_cycle: number;
  current_stamp_count: number;
  max_stamp_pieces: number;
}

// POST /attendance/me/check (200 OK)
export interface AttendanceCheckResult {
  success: boolean;
  attended_at: string;
  earned_points: number;
  current_stamp_count: number;
  is_board_completed: boolean;
  message: string;
}

// GET /attendance/me/history 응답 아이템 (출석한 날만 포함, 미출석 날은 배열에 없음)
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

// GET/PATCH /attendance/admin/policy
export interface AttendancePolicy {
  stamp_board_size: number;
  daily_points: number;
  reward_points: number;
  updated_at: string;
}
