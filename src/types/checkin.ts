// 공통

export interface StampInfo {
  board_size: number;
  current_cycle: number;
  progress: number;
}

// 사용자

export interface TodayCheckInStatus {
  date: string;
  checked_in: boolean;
  checked_in_at: string | null;
  points_earned: number | null;
  stamp: StampInfo;
}

export interface CheckInSuccess {
  status: "success";
  checked_in_at: string;
  points_earned: number;
  stamp: StampInfo;
}

export interface AlreadyCheckedIn {
  status: "already_checked_in";
  checked_in_at: string;
  message: string;
}

export type CheckInResult = CheckInSuccess | AlreadyCheckedIn;

// 관리자

export interface AdminAttendanceRecord {
  user_id: number;
  user_name: string;
  student_id: string;
  status: "present" | null;
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
  records: AdminAttendanceRecord[];
}
