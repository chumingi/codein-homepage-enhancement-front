import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { getTodayCheckInStatus, checkIn } from "../../api/checkin";
import type { TodayCheckInStatus } from "../../types/checkin";

const CheckInPage: React.FC = () => {
  const [status, setStatus] = useState<TodayCheckInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTodayCheckInStatus();
      setStatus(data);
    } catch (error) {
      console.error("출석 상태 조회 실패", error);
      toast.error("출석 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCheckIn = async () => {
    if (isSubmitting || !status || status.checked_in) return;

    setIsSubmitting(true);
    const prev = status;
    setStatus({ ...status, checked_in: true }); // Optimistic Update

    try {
      const result = await checkIn();
      if (result.status === "success") {
        setStatus({
          ...status,
          checked_in: true,
          checked_in_at: result.checked_in_at,
          points_earned: result.points_earned,
          stamp: result.stamp,
        });
        toast.success(`출석 완료! +${result.points_earned}포인트`);
      } else {
        setStatus({
          ...prev,
          checked_in: true,
          checked_in_at: result.checked_in_at,
        });
        toast.error(result.message);
      }
    } catch (error) {
      console.error("출석 체크 실패", error);
      setStatus(prev); // 실패 시 롤백
      toast.error("출석 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-20 text-dark-muted">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-text mb-2">출석 체크</h1>
      <p className="text-dark-muted mb-8">매일 출석하고 포인트를 모아보세요.</p>
      {/* TODO: <TodayCheckInCard /> */}
      {/* TODO: <StampBoard /> */}
    </div>
  );
};

export default CheckInPage;
