import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle, Calendar, Zap, Gift } from "lucide-react";
import { toast } from "react-hot-toast";
import { getTodayCheckInStatus, checkIn } from "../../api/checkin";
import type { TodayCheckInStatus, StampInfo } from "../../types/checkin";

// --- TodayCheckInCard ---

interface TodayCheckInCardProps {
  status: TodayCheckInStatus;
  isSubmitting: boolean;
  onCheckIn: () => void;
}

const TodayCheckInCard: React.FC<TodayCheckInCardProps> = ({ status, isSubmitting, onCheckIn }) => {
  const isDisabled = isSubmitting || status.checked_in;

  return (
    <div className="bg-dark-card border border-dark-line rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm text-dark-muted">
        <Calendar size={15} />
        <span>{format(parseISO(status.date), "yyyy년 M월 d일")}</span>
      </div>

      {status.checked_in ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            <span className="font-semibold text-dark-text">오늘 출석 완료</span>
          </div>

          {status.checked_in_at && (
            <p className="text-sm text-dark-muted">
              {format(parseISO(status.checked_in_at), "HH:mm")}에 출석했어요.
            </p>
          )}

          {status.points_earned !== null && (
            <div className="flex items-center gap-1.5 text-sm">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                +{status.points_earned} 포인트 획득
              </span>
            </div>
          )}

          <button
            disabled
            className="w-full py-3 rounded-xl bg-dark-cardSoft text-dark-muted text-sm font-medium cursor-not-allowed"
          >
            오늘 출석 완료
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-dark-text">아직 오늘 출석을 하지 않았어요.</p>
          <button
            onClick={onCheckIn}
            disabled={isDisabled}
            className="w-full py-3 rounded-xl bg-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "처리 중..." : "오늘 출석하기"}
          </button>
        </div>
      )}
    </div>
  );
};

// --- StampBoard ---

interface StampBoardProps {
  stamp: StampInfo;
  newlyFilledIndex?: number | null;
  onAnimationEnd?: () => void;
}

const StampBoard: React.FC<StampBoardProps> = ({ stamp, newlyFilledIndex, onAnimationEnd }) => {
  const { board_size, current_cycle, progress } = stamp;
  const remaining = board_size - progress;
  const COLS = 5;
  const remainder = board_size % COLS;
  const paddedSize = remainder === 0 ? board_size : board_size + (COLS - remainder);

  return (
    <div className="bg-dark-card border border-dark-line rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-dark-text">스탬프 보드</h2>
        <span className="text-xs text-dark-muted">
          {current_cycle}사이클 &middot; {progress} / {board_size}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: board_size }, (_, i) => {
          const filled = i < progress;
          const isNewlyFilled = newlyFilledIndex != null && i === newlyFilledIndex;
          return (
            <div
              key={i}
              onAnimationEnd={isNewlyFilled ? onAnimationEnd : undefined}
              className={[
                "aspect-square rounded-xl flex items-center justify-center transition-all duration-200",
                filled
                  ? "bg-brand/20 border-2 border-brand"
                  : "bg-dark-cardSoft border-2 border-dark-line",
                isNewlyFilled
                  ? "animate-[stamp-pop_0.3s_ease-out] motion-reduce:animate-none"
                  : "",
              ].join(" ")}
            >
              {filled && <CheckCircle size={22} className="text-brand" />}
            </div>
          );
        })}
        {paddedSize > board_size &&
          Array.from({ length: paddedSize - board_size }, (_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
      </div>

      {stamp.reward_points !== undefined && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-dark-muted">
          <Gift size={13} />
          <span>완성 보상 {stamp.reward_points}포인트</span>
        </div>
      )}

      <p className="text-xs text-center text-dark-muted">
        {stamp.daily_points !== undefined
          ? `일일 +${stamp.daily_points}pt · ${remaining > 0 ? `${remaining}칸 더 채우면 보상` : "스탬프 완성!"}`
          : remaining > 0
            ? `${remaining}칸 더 채우면 보상을 받아요`
            : "스탬프 보드 완성! 보상이 지급됩니다."}
      </p>
    </div>
  );
};

// --- CheckInPage ---

const CheckInPage: React.FC = () => {
  const [status, setStatus] = useState<TodayCheckInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyFilledIndex, setNewlyFilledIndex] = useState<number | null>(null);

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
          ...prev,
          checked_in: true,
          checked_in_at: result.checked_in_at,
          points_earned: result.points_earned,
          stamp: result.stamp,
        });
        setNewlyFilledIndex(result.stamp.progress - 1);
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

  if (!status) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-20" role="alert">
          <p className="text-dark-muted mb-4">출석 정보를 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={fetchStatus}
            className="text-brand text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">출석 체크</h1>
        <p className="text-dark-muted">매일 출석하고 포인트를 모아보세요.</p>
      </div>
      <TodayCheckInCard
        status={status}
        isSubmitting={isSubmitting}
        onCheckIn={handleCheckIn}
      />
      <StampBoard
        stamp={status.stamp}
        newlyFilledIndex={newlyFilledIndex}
        onAnimationEnd={() => setNewlyFilledIndex(null)}
      />
    </div>
  );
};

export default CheckInPage;
