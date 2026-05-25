// import api from "./axios";
import { format } from "date-fns";
import type {
  TodayCheckInStatus,
  CheckInResult,
  AdminDailyStats,
} from "../types/checkin";

// 사용자 API 목업
// TODO: 백엔드 완성 후 실 API로 교체

const today = format(new Date(), "yyyy-MM-dd");

const MOCK_TODAY_STATUS: TodayCheckInStatus = {
  date: today,
  checked_in: false,
  checked_in_at: null,
  points_earned: null,
  stamp: {
    board_size: 10,
    current_cycle: 1,
    progress: 3,
    daily_points: 10,
    reward_points: 100,
  },
};

const MOCK_CHECK_IN_RESULT: CheckInResult = {
  status: "success",
  checked_in_at: `${today}T10:00:00+09:00`,
  points_earned: 10,
  // cycle_complete: true 로 바꾸면 보상 모달 테스트 가능
  stamp: {
    board_size: 10,
    current_cycle: 1,
    progress: 4,
    daily_points: 10,
    reward_points: 100,
    cycle_complete: false,
  },
};

export const getTodayCheckInStatus = async (): Promise<TodayCheckInStatus> => {
  return MOCK_TODAY_STATUS;
  // const res = await api.get<TodayCheckInStatus>("");
  // return res.data;
};

export const checkIn = async (): Promise<CheckInResult> => {
  return MOCK_CHECK_IN_RESULT;
  // const res = await api.post<CheckInResult>("/attendance/check");
  // return res.data;
};

// 관리자 API 목업
// TODO: 백엔드 완성 후 실 API로 교체

export const getAdminDailyAttendance = async (
  date: string,
): Promise<AdminDailyStats> => {
  const MOCK_ADMIN_STATS: AdminDailyStats = {
    date,
    stats: {
      total_members: 30,
      attended: 18,
      absent: 12,
      attendance_rate: 60,
    },
    records: [
      {
        user_id: 1,
        user_name: "부원1",
        student_id: "202600001",
        status: "present",
        checked_in_at: `${today}T08:00:00+09:00`,
      },
      {
        user_id: 2,
        user_name: "부원2",
        student_id: "202600002",
        status: "present",
        checked_in_at: `${today}T09:00:00+09:00`,
      },
      {
        user_id: 3,
        user_name: "부원3",
        student_id: "202600003",
        status: null,
        checked_in_at: null,
      },
      {
        user_id: 4,
        user_name: "부원4",
        student_id: "202600004",
        status: "present",
        checked_in_at: `${today}T10:00:00+09:00`,
      },
      {
        user_id: 5,
        user_name: "부원5",
        student_id: "202600005",
        status: null,
        checked_in_at: null,
      },
    ],
  };

  return MOCK_ADMIN_STATS;
  // const res = await api.get<AdminDailyStats>(``);
  // return res.data;
};
