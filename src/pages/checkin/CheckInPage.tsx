import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle, Calendar, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { getTodayCheckInStatus, checkIn } from "../../api/checkin";
import type { AttendanceStatus } from "../../types/checkin";

// TodayCheckInCard

interface TodayCheckInCardProps {
  hasAttendedToday: boolean;
  checkedInAt: string | null;
  pointsEarned: number | null;
  isSubmitting: boolean;
  onCheckIn: () => void;
}

const TodayCheckInCard: React.FC<TodayCheckInCardProps> = ({
  hasAttendedToday,
  checkedInAt,
  pointsEarned,
  isSubmitting,
  onCheckIn,
}) => {
  const isDisabled = isSubmitting || hasAttendedToday;

  return (
    <div className="bg-dark-card border border-dark-line rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-sm text-dark-muted">
        <Calendar size={15} />
        <span>{format(new Date(), "yyyy년 M월 d일")}</span>
      </div>

      {hasAttendedToday ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            <span className="font-semibold text-dark-text">오늘 출석 완료</span>
          </div>

          {checkedInAt && (
            <p className="text-sm text-dark-muted">
              {format(parseISO(checkedInAt), "HH:mm")}에 출석했어요.
            </p>
          )}

          {pointsEarned !== null && (
            <div className="flex items-center gap-1.5 text-sm">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                +{pointsEarned} 포인트 획득
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

// StampBoard

interface StampBoardProps {
  boardSize: number;
  currentCycle: number;
  progress: number;
  newlyFilledIndex?: number | null;
  onAnimationEnd?: () => void;
}

const StampBoard: React.FC<StampBoardProps> = ({
  boardSize,
  currentCycle,
  progress,
  newlyFilledIndex,
  onAnimationEnd,
}) => {
  const remaining = boardSize - progress;
  const COLS = 5;
  const remainder = boardSize % COLS;
  const paddedSize = remainder === 0 ? boardSize : boardSize + (COLS - remainder);

  return (
    <div className="bg-dark-card border border-dark-line rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-dark-text">스탬프 보드</h2>
        <span className="text-xs text-dark-muted">
          {currentCycle}사이클 &middot; {progress} / {boardSize}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: boardSize }, (_, i) => {
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
        {paddedSize > boardSize &&
          Array.from({ length: paddedSize - boardSize }, (_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
      </div>

      <p className="text-xs text-center text-dark-muted">
        {remaining > 0
          ? `${remaining}칸 더 채우면 보상을 받아요`
          : "스탬프 보드 완성! 보상이 지급됩니다."}
      </p>
    </div>
  );
};

// CheckInPage

const CheckInPage: React.FC = () => {
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyFilledIndex, setNewlyFilledIndex] = useState<number | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardPoints, setRewardPoints] = useState<number | null>(null);

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
    if (isSubmitting || !status || status.has_attended_today) return;

    setIsSubmitting(true);
    const prev = status;
    setStatus({ ...status, has_attended_today: true }); // Optimistic Update

    try {
      const result = await checkIn();
      setStatus({
        ...prev,
        has_attended_today: true,
        current_stamp_count: result.current_stamp_count,
      });
      setCheckedInAt(result.attended_at);
      setPointsEarned(result.earned_points);
      setNewlyFilledIndex(result.current_stamp_count - 1);
      toast.success(`출석 완료! +${result.earned_points}포인트`);
      if (result.is_board_completed) {
        setRewardPoints(result.earned_points);
        setShowRewardModal(true);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("오늘은 이미 출석하셨습니다.");
        // 400은 실제로 이미 출석된 상태 — 낙관적 업데이트 유지 (롤백하지 않음)
      } else {
        console.error("출석 체크 실패", error);
        setStatus(prev);
        toast.error("출석 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2 animate-pulse">
          <div className="h-8 bg-dark-cardSoft rounded-lg w-32" />
          <div className="h-4 bg-dark-cardSoft rounded w-48" />
        </div>
        <div className="bg-dark-card border border-dark-line rounded-2xl p-6 animate-pulse space-y-4">
          <div className="h-4 bg-dark-cardSoft rounded w-28" />
          <div className="h-4 bg-dark-cardSoft rounded w-48" />
          <div className="h-12 bg-dark-cardSoft rounded-xl" />
        </div>
        <div className="bg-dark-card border border-dark-line rounded-2xl p-6 animate-pulse space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-dark-cardSoft rounded w-24" />
            <div className="h-4 bg-dark-cardSoft rounded w-20" />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-dark-cardSoft" />
            ))}
          </div>
          <div className="h-3 bg-dark-cardSoft rounded w-36 mx-auto" />
        </div>
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
    <>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">출석 체크</h1>
          <p className="text-dark-muted">매일 출석하고 포인트를 모아보세요.</p>
        </div>
        <TodayCheckInCard
          hasAttendedToday={status.has_attended_today}
          checkedInAt={checkedInAt}
          pointsEarned={pointsEarned}
          isSubmitting={isSubmitting}
          onCheckIn={handleCheckIn}
        />
        <StampBoard
          boardSize={status.max_stamp_pieces}
          currentCycle={status.current_stamp_cycle}
          progress={status.current_stamp_count}
          newlyFilledIndex={newlyFilledIndex}
          onAnimationEnd={() => setNewlyFilledIndex(null)}
        />
      </div>

      {showRewardModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowRewardModal(false)}
        >
          <div
            className="bg-dark-card rounded-2xl shadow-xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in-95 duration-200 border border-dark-line"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="text-xl font-bold text-dark-text mb-2">스탬프 완성!</h2>
            <p className="text-dark-muted text-sm mb-1">출석판을 모두 채웠습니다.</p>
            <p className="text-brand font-semibold text-sm mb-6">
              {rewardPoints !== null
                ? `보상 ${rewardPoints}포인트 지급`
                : "보상 포인트가 지급됐습니다."}
            </p>
            <button
              onClick={() => setShowRewardModal(false)}
              className="px-6 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckInPage;
