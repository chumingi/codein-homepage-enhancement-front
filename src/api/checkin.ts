// import api from "./axios";
import { format, getDaysInMonth } from "date-fns";
import type {
  AttendanceStatus,
  AttendanceCheckResult,
  AdminAttendanceDashboard,
  AttendanceHistoryItem,
  AttendancePolicy,
} from "../types/checkin";

// 사용자 API 목업
// TODO: 백엔드 완성 후 실 API로 교체

const today = format(new Date(), "yyyy-MM-dd");

const MOCK_STATUS: AttendanceStatus = {
  has_attended_today: false,
  current_stamp_cycle: 1,
  current_stamp_count: 3,
  max_stamp_pieces: 10,
  streak: 3, // TODO: 백엔드 완성 후 실 API로 교체
};

const MOCK_CHECK_RESULT: AttendanceCheckResult = {
  success: true,
  attended_at: `${today}T10:00:00+09:00`,
  earned_points: 10,
  current_stamp_count: 4,
  is_board_completed: false, // true 로 바꾸면 보상 모달 테스트 가능
  message: "출석 완료!",
  streak: 4, // TODO: 백엔드 완성 후 실 API로 교체
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

// 사용자 출석 이력 API 목업
// TODO: 백엔드 완성 후 실 API로 교체
export const getMyAttendanceHistory = async (
  year: number,
  month: number,
): Promise<AttendanceHistoryItem[]> => {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const items: AttendanceHistoryItem[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    if (day % 3 !== 0) { // ~67% 출석률 시뮬레이션 — 출석한 날만 배열에 추가
      const date = format(new Date(year, month - 1, day), "yyyy-MM-dd");
      items.push({
        date,
        attended_at: `${date}T09:${String(day).padStart(2, "0")}:00+09:00`,
        earned_points: 10,
      });
    }
  }

  return items;
  // const response = await api.get<AttendanceHistoryItem[]>("/attendance/me/history", {
  //   params: { year, month },
  // });
  // return response.data;
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

// 관리자 정책 API 목업
// TODO: 백엔드 완성 후 실 API로 교체

const MOCK_POLICY: AttendancePolicy = {
  stamp_board_size: 10,
  daily_points: 10,
  reward_points: 100,
  updated_at: `${today}T00:00:00+09:00`,
};

export const getAttendancePolicy = async (): Promise<AttendancePolicy> => {
  return MOCK_POLICY;
  // const res = await api.get<AttendancePolicy>("/attendance/admin/policy");
  // return res.data;
};

export const updateAttendancePolicy = async (
  payload: Omit<AttendancePolicy, "updated_at">,
): Promise<AttendancePolicy> => {
  return { ...payload, updated_at: new Date().toISOString() };
  // const res = await api.patch<AttendancePolicy>("/attendance/admin/policy", payload);
  // return res.data;
};

// 관리자 CSV 내보내기 API 목업
// TODO: 백엔드 완성 후 실 API로 교체
export const exportAttendanceCsv = async (
  start_date: string,
  end_date: string,
): Promise<Blob> => {
  // TODO: 백엔드 완성 후 실 API로 교체
  // const response = await api.get('/attendance/admin/export', {
  //   params: { start_date, end_date },
  //   responseType: 'blob',
  // });
  // return response.data;
  const csvContent = [
    "날짜,닉네임,출석상태,출석시각",
    `${start_date},부원1,ATTENDED,${start_date}T09:00:00+09:00`,
    `${start_date},부원2,ABSENT,`,
    `${end_date},부원1,ATTENDED,${end_date}T08:30:00+09:00`,
    `${end_date},부원3,ABSENT,`,
  ].join("\n");
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
};
