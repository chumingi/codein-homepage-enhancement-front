// import api from "./axios";
import { format } from "date-fns";
import type {
  AttendanceStatus,
  AttendanceCheckResult,
  AdminAttendanceDashboard,
} from "../types/checkin";

// 사용자 API 목업
// TODO: 백엔드 완성 후 실 API로 교체

const today = format(new Date(), "yyyy-MM-dd");

const MOCK_STATUS: AttendanceStatus = {
  has_attended_today: false,
  current_stamp_cycle: 1,
  current_stamp_count: 3,
  max_stamp_pieces: 10,
};

const MOCK_CHECK_RESULT: AttendanceCheckResult = {
  success: true,
  attended_at: `${today}T10:00:00+09:00`,
  earned_points: 10,
  current_stamp_count: 4,
  is_board_completed: false, // true 로 바꾸면 보상 모달 테스트 가능
  message: "출석 완료!",
};

export const getTodayCheckInStatus = async (): Promise<AttendanceStatus> => {
  return MOCK_STATUS;
  // const res = await api.get<AttendanceStatus>("/attendance/me/status");
  // return res.data;
};

export const checkIn = async (): Promise<AttendanceCheckResult> => {
  return MOCK_CHECK_RESULT;
  // const res = await api.post<AttendanceCheckResult>("/attendance/me/check");
  // return res.data;
};

// 관리자 API 목업
// TODO: 백엔드 완성 후 실 API로 교체

export const getAdminDailyAttendance = async (
  date: string,
): Promise<AdminAttendanceDashboard> => {
  const MOCK_ADMIN_STATS: AdminAttendanceDashboard = {
    summary: {
      total_members: 30,
      attended_count: 18,
      absent_count: 12,
      attendance_rate: 60,
    },
    member_list: [
      {
        user_id: 1,
        nickname: "부원1",
        status: "ATTENDED",
        attended_at: `${date}T08:00:00+09:00`,
      },
      {
        user_id: 2,
        nickname: "부원2",
        status: "ATTENDED",
        attended_at: `${date}T09:00:00+09:00`,
      },
      {
        user_id: 3,
        nickname: "부원3",
        status: "ABSENT",
        attended_at: null,
      },
      {
        user_id: 4,
        nickname: "부원4",
        status: "ATTENDED",
        attended_at: `${date}T10:00:00+09:00`,
      },
      {
        user_id: 5,
        nickname: "부원5",
        status: "ABSENT",
        attended_at: null,
      },
    ],
  };

  return MOCK_ADMIN_STATS;
  // const res = await api.get<AdminAttendanceDashboard>(`/attendance/admin/status?date=${date}`);
  // return res.data;
};
