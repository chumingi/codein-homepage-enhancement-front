import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { Users, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAdminDailyAttendance } from "../../api/checkin";
import type { AdminDailyStats } from "../../types/checkin";

// Recharts는 SVG 기반이라 Tailwind 클래스 적용 불가 — 브랜드 토큰과 동일한 값 직접 사용
const CHART_COLORS = {
  attended: "#2563EB",
  absent: "#374151",
};

const inputClass =
  "rounded-lg border border-dark-line bg-dark-cardSoft px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-brand";

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
  const [stats, setStats] = useState<AdminDailyStats | null>(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchStats(selectedDate);
  }, [selectedDate, fetchStats]);

  const chartData = stats
    ? [
        { name: "출석", value: stats.stats.attended },
        { name: "미출석", value: stats.stats.absent },
      ]
    : [];

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
      ) : !stats ? null : (
        <>
          {/* 통계 카드 + 도넛 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 통계 카드 4개 */}
            <div className="grid grid-cols-2 gap-3 content-start">
              <StatCard
                icon={<Users size={18} />}
                label="전체 부원"
                value={stats.stats.total_members}
              />
              <StatCard
                icon={<CheckCircle size={18} />}
                label="출석"
                value={stats.stats.attended}
                highlight
              />
              <StatCard
                icon={<XCircle size={18} />}
                label="미출석"
                value={stats.stats.absent}
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="출석률"
                value={`${stats.stats.attendance_rate}%`}
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
                {format(parseISO(stats.date), "yyyy년 M월 d일")} 기준
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-line text-dark-muted">
                    <th className="text-left px-6 py-3 font-medium">이름</th>
                    <th className="text-left px-6 py-3 font-medium">학번</th>
                    <th className="text-left px-6 py-3 font-medium">출석 상태</th>
                    <th className="text-left px-6 py-3 font-medium">출석 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.records.map((record) => (
                    <tr
                      key={record.user_id}
                      className={[
                        "border-b border-dark-line last:border-0 transition-colors",
                        record.status === "present"
                          ? "bg-green-500/5"
                          : "",
                      ].join(" ")}
                    >
                      <td className="px-6 py-3 text-dark-text font-medium">
                        {record.user_name}
                      </td>
                      <td className="px-6 py-3 text-dark-muted">
                        {record.student_id}
                      </td>
                      <td className="px-6 py-3">
                        {record.status === "present" ? (
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
                        {record.checked_in_at
                          ? format(parseISO(record.checked_in_at), "HH:mm")
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
    </div>
  );
};

export default CheckInAdminPage;
