export interface StampInfo {
  board_size: number;
  current_cycle: number;
  progress: number;
}

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
