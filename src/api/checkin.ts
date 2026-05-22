// import api from "./axios";
import type { TodayCheckInStatus, CheckInResult } from "../types/checkin";

// TODO: 백엔드 완성 후 실 API로 교체
const MOCK_TODAY_STATUS: TodayCheckInStatus = {
  date: "2026-05-22",
  checked_in: false,
  checked_in_at: null,
  points_earned: null,
  stamp: { board_size: 10, current_cycle: 1, progress: 3 },
};

const MOCK_CHECK_IN_RESULT: CheckInResult = {
  status: "success",
  checked_in_at: "2026-05-22T10:00:00+09:00",
  points_earned: 10,
  stamp: { board_size: 10, current_cycle: 1, progress: 4 },
};

export const getTodayCheckInStatus = async (): Promise<TodayCheckInStatus> => {
  return MOCK_TODAY_STATUS;
  // 실제 API
  // const res = await api.get<TodayCheckInStatus>("");
  // return res.data;
};

export const checkIn = async (): Promise<CheckInResult> => {
  return MOCK_CHECK_IN_RESULT;
  // 실제 API
  // const res = await api.post<CheckInResult>("");
  // return res.data;
};
