import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { Users, CheckCircle, XCircle, TrendingUp, Download } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAdminDailyAttendance, getAttendancePolicy, updateAttendancePolicy, exportAttendanceCsv } from "../../api/checkin";
import type { AdminAttendanceDashboard, AttendancePolicy } from "../../types/checkin";

// Recharts는 SVG 기반이라 Tailwind 클래스 적용 불가 — 브랜드 토큰과 동일한 값 직접 사용
const CHART_COLORS = {
  attended: "#2563EB",
  absent: "#374151",
};

const inputClass =
  "rounded-lg border border-dark-line bg-dark-cardSoft px-3 py-2 text-sm text-dark-text " +
  "focus:outline-none focus:border-brand [color-scheme:dark]";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, highlight }) => (
  <div className="bg-dark-card border border-dark-line rounded-xl p-4 flex items-center gap-4">
    <div className={`p-2 rounded-lg ${highlight ? "bg-brand/10 text-brand" : "bg-dark-cardSoft text-dark-muted"}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-dark-muted">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-brand" : "text-dark-text"}`}>{value}</p>
    </div>
  </div>
);

const CheckInAdminPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [stats, setStats] = useState<AdminAttendanceDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState<AttendancePolicy | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyForm, setPolicyForm] = useState<{
    stamp_board_size: number;
    daily_points: number;
    reward_points: number;
  }>({ stamp_board_size: 10, daily_points: 10, reward_points: 100 });
  const [isUpdating, setIsUpdating] = useState(false);
  const [exportStartDate, setExportStartDate] = useState<string>(
    `${format(new Date(), "yyyy-MM")}-01`,
  );
  const [exportEndDate, setExportEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [isExporting, setIsExporting] = useState(false);

  const fetchStats = useCallback(async (date: string) => {
    setLoading(true);
    try {
      const data = await getAdminDailyAttendance(date);
      setStats(data);
    } catch (error) {
      console.error("출석 현황 조회 실패", error);
      toast.error("출석 현황을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPolicy = useCallback(async () => {
    setPolicyLoading(true);
    try {
      const data = await getAttendancePolicy();
      setPolicy(data);
      setPolicyForm({
        stamp_board_size: data.stamp_board_size,
        daily_points: data.daily_points,
        reward_points: data.reward_points,
      });
    } catch (error) {
      console.error("출석 정책 조회 실패", error);
      toast.error("출석 정책 정보를 불러오지 못했습니다.");
    } finally {
      setPolicyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(selectedDate);
  }, [selectedDate, fetchStats]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  const chartData = stats
    ? [
        { name: "출석", value: stats.summary.attended_count },
        { name: "미출석", value: stats.summary.absent_count },
      ]
    : [];

  const isDirty =
    policy !== null &&
    (policyForm.stamp_board_size !== policy.stamp_board_size ||
      policyForm.daily_points !== policy.daily_points ||
      policyForm.reward_points !== policy.reward_points);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const blob = await exportAttendanceCsv(exportStartDate, exportEndDate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${exportStartDate}_to_${exportEndDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV 내보내기 완료");
    } catch (error) {
      console.error("CSV 내보내기 실패", error);
      toast.error("CSV 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePolicySave = async () => {
    if (!isDirty || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await updateAttendancePolicy(policyForm);
      setPolicy(updated);
      setPolicyForm({
        stamp_board_size: updated.stamp_board_size,
        daily_points: updated.daily_points,
        reward_points: updated.reward_points,
      });
      toast.success("출석 정책이 저장되었습니다.");
    } catch (error) {
      console.error("출석 정책 저장 실패", error);
      toast.error("정책 저장에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-dark-text">출석 현황 관리</h1>
        <p className="text-sm text-dark-muted mt-1">날짜별 부원 출석 통계를 확인하세요.</p>
      </div>

      {/* 날짜 선택 */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-dark-muted shrink-0">조회 날짜</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-dark-muted">로딩 중...</div>
      ) : !stats ? (
        <div className="text-center py-20">
          <p className="text-dark-muted mb-3">출석 현황을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => fetchStats(selectedDate)}
            className="text-brand text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          >
            다시 시도하기
          </button>
        </div>
      ) : (
        <>
          {/* 통계 카드 + 도넛 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 통계 카드 4개 */}
            <div className="grid grid-cols-2 gap-3 content-start">
              <StatCard
                icon={<Users size={18} />}
                label="전체 부원"
                value={stats.summary.total_members}
              />
              <StatCard
                icon={<CheckCircle size={18} />}
                label="출석"
                value={stats.summary.attended_count}
                highlight
              />
              <StatCard
                icon={<XCircle size={18} />}
                label="미출석"
                value={stats.summary.absent_count}
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="출석률"
                value={`${stats.summary.attendance_rate}%`}
                highlight
              />
            </div>

            {/* 도넛 차트 */}
            <div className="bg-dark-card border border-dark-line rounded-2xl p-6">
              <h2 className="text-sm font-medium text-dark-muted mb-4">출석 비율</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill={CHART_COLORS.attended} />
                    <Cell fill={CHART_COLORS.absent} />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1930",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: "8px",
                      color: "#E8EEFC",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "13px", color: "#A8B3CF" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 부원 목록 테이블 */}
          <div className="bg-dark-card border border-dark-line rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-line">
              <h2 className="font-semibold text-dark-text">부원별 출석 현황</h2>
              <p className="text-xs text-dark-muted mt-0.5">
                {format(parseISO(selectedDate), "yyyy년 M월 d일")} 기준
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-line text-dark-muted">
                    <th className="text-left px-6 py-3 font-medium">이름</th>
                    <th className="text-left px-6 py-3 font-medium">출석 상태</th>
                    <th className="text-left px-6 py-3 font-medium">출석 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.member_list.map((member) => (
                    <tr
                      key={member.user_id}
                      className={[
                        "border-b border-dark-line last:border-0 transition-colors",
                        member.status === "ATTENDED"
                          ? "bg-green-500/5"
                          : "",
                      ].join(" ")}
                    >
                      <td className="px-6 py-3 text-dark-text font-medium">
                        {member.nickname}
                      </td>
                      <td className="px-6 py-3">
                        {member.status === "ATTENDED" ? (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                            <CheckCircle size={13} />
                            출석
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-dark-muted text-xs">
                            <XCircle size={13} />
                            미출석
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-dark-muted">
                        {member.attended_at
                          ? format(parseISO(member.attended_at), "HH:mm")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 출석 정책 설정 */}
      <div className="bg-dark-card border border-dark-line rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-line">
          <h2 className="font-semibold text-dark-text">출석 정책 설정</h2>
          <p className="text-xs text-dark-muted mt-0.5">변경 사항은 다음 출석 체크부터 적용됩니다.</p>
        </div>
        {policyLoading ? (
          <div className="px-6 py-8 text-center text-sm text-dark-muted">로딩 중...</div>
        ) : !policy ? (
          <div className="px-6 py-8 text-center text-sm text-dark-muted">
            정책 정보를 불러오지 못했습니다.
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-dark-muted mb-1.5">스탬프판 칸 수</label>
                <input
                  type="number"
                  min={1}
                  value={policyForm.stamp_board_size}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      stamp_board_size: Number(e.target.value),
                    }))
                  }
                  className={`w-full ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1.5">일일 출석 포인트</label>
                <input
                  type="number"
                  min={0}
                  value={policyForm.daily_points}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      daily_points: Number(e.target.value),
                    }))
                  }
                  className={`w-full ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1.5">완성 보상 포인트</label>
                <input
                  type="number"
                  min={0}
                  value={policyForm.reward_points}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      reward_points: Number(e.target.value),
                    }))
                  }
                  className={`w-full ${inputClass}`}
                />
              </div>
            </div>
            <p className="text-xs text-dark-muted">
              저장하면 이후 출석부터 즉시 반영됩니다. 이전에 지급된 포인트는 변경되지 않습니다.
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-dark-muted">
                마지막 수정: {format(parseISO(policy.updated_at), "yyyy.MM.dd HH:mm")}
              </p>
              <button
                onClick={handlePolicySave}
                disabled={!isDirty || isUpdating}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-brand text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {isUpdating ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 데이터 내보내기 */}
      <div className="bg-dark-card border border-dark-line rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-line">
          <h2 className="font-semibold text-dark-text">데이터 내보내기</h2>
          <p className="text-xs text-dark-muted mt-0.5">기간별 출석 데이터를 CSV 파일로 다운로드합니다.</p>
        </div>
        <div className="px-6 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div>
              <label className="block text-xs text-dark-muted mb-1.5">시작일</label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-dark-muted mb-1.5">종료일</label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Download size={15} />
              {isExporting ? "다운로드 중..." : "CSV 다운로드"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInAdminPage;
