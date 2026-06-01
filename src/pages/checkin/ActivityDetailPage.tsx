import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  getActivity,
  applyActivity,
  cancelApplication,
  getApplications,
  updateApplicationStatus,
} from '../../api/recruitment';
import type { ActivityDetail, ApplicationItem } from '../../types/recruitment';

const TYPE_LABELS = { STUDY: '스터디', PROJECT: '프로젝트', CONTEST: '공모전', MENTORING: '멘토링' };
const TYPE_COLOR: Record<string, string> = {
  STUDY: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PROJECT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  CONTEST: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  MENTORING: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};
const APP_STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: { label: '검토 중', className: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  APPROVED: { label: '승인', className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  REJECTED: { label: '거절', className: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
};

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  const isAdmin = user && ['staff', 'admin', 'superadmin'].includes(user.role);

  const fetchActivity = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getActivity(Number(id));
      setActivity(data);
    } catch {
      toast.error('모집 글을 불러오지 못했습니다.');
      navigate('/recruitment');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const fetchApplications = useCallback(async () => {
    if (!id || !activity?.is_owner) return;
    try {
      const data = await getApplications(Number(id));
      setApplications(data);
    } catch {
      // 403이면 조용히 실패
    }
  }, [id, activity?.is_owner]);

  useEffect(() => {
    if (showApplications) fetchApplications();
  }, [showApplications, fetchApplications]);

  const handleApply = async () => {
    if (!id) return;
    setApplyLoading(true);
    try {
      await applyActivity(Number(id), { message: applyMessage });
      toast.success('신청이 완료되었습니다!');
      setShowApplyModal(false);
      setApplyMessage('');
      await fetchActivity();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response;
      if (status?.status === 400) {
        toast.error(status.data?.detail ?? '신청할 수 없습니다. 이미 참여 중인 활동이 있을 수 있습니다.');
      } else {
        toast.error('신청에 실패했습니다.');
      }
    } finally {
      setApplyLoading(false);
    }
  };

  const handleCancelApply = async () => {
    if (!id) return;
    setApplyLoading(true);
    try {
      await cancelApplication(Number(id));
      toast.success('신청이 취소되었습니다.');
      await fetchActivity();
    } catch {
      toast.error('신청 취소에 실패했습니다.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleUpdateStatus = async (applicantId: number, status: 'APPROVED' | 'REJECTED') => {
    if (!id) return;
    try {
      await updateApplicationStatus(Number(id), applicantId, status);
      toast.success('상태가 변경되었습니다.');
      await fetchApplications();
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20 text-dark-muted">로딩 중...</div>;
  if (!activity) return null;

  const isFull = activity.current_participants >= activity.max_participants;
  const isRecruiting = activity.recruitment_status === 'RECRUITING';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* 뒤로가기 */}
      <button
        type="button"
        onClick={() => navigate('/recruitment')}
        className="flex items-center gap-2 text-sm text-dark-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        목록으로
      </button>

      {/* 메인 카드 */}
      <div className="rounded-2xl border border-dark-line bg-dark-card p-6 space-y-5">

        {/* 뱃지 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TYPE_COLOR[activity.recruitment_type]}`}>
            {TYPE_LABELS[activity.recruitment_type]}
          </span>
          {!isRecruiting && (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${activity.recruitment_status === 'CLOSED' ? 'bg-dark-pill text-dark-muted border-dark-line' : 'bg-brand/10 text-brand-light border-brand/30'}`}>
              {activity.recruitment_status === 'CLOSED' ? '모집 마감' : '완료'}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-dark-text">{activity.title}</h1>

        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-4 text-sm text-dark-muted">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span className={isFull ? 'text-rose-400' : ''}>
              {activity.current_participants} / {activity.max_participants}명
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>마감: {format(parseISO(activity.deadline), 'yyyy.MM.dd')}</span>
          </div>
          {activity.activity_period && (
            <span>활동 기간: {activity.activity_period}</span>
          )}
        </div>

        {/* 기술 스택 */}
        {activity.tech_stacks.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activity.tech_stacks.map((stack) => (
              <span key={stack} className="text-xs px-2.5 py-1 rounded bg-dark-cardSoft border border-dark-line text-dark-muted">
                {stack}
              </span>
            ))}
          </div>
        )}

        {/* 구분선 */}
        <hr className="border-dark-line" />

        {/* 본문 */}
        <div className="text-sm text-dark-text leading-relaxed whitespace-pre-wrap">
          {activity.content}
        </div>

        {/* 신청 버튼 (본인 글 제외, 모집 중일 때만) */}
        {user && !activity.is_owner && isRecruiting && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              disabled={applyLoading || isFull}
              className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-light transition-colors disabled:opacity-50"
            >
              {isFull ? '모집 인원 마감' : '신청하기'}
            </button>
          </div>
        )}
      </div>

      {/* 신청자 목록 (is_owner 또는 관리자만) */}
      {(activity.is_owner || isAdmin) && (
        <div className="rounded-2xl border border-dark-line bg-dark-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowApplications((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-cardSoft/50 transition-colors"
          >
            <span className="text-sm font-semibold text-dark-text">신청자 목록</span>
            {showApplications ? <ChevronUp className="w-4 h-4 text-dark-muted" /> : <ChevronDown className="w-4 h-4 text-dark-muted" />}
          </button>

          {showApplications && (
            <div className="border-t border-dark-line divide-y divide-dark-line">
              {applications.length === 0 ? (
                <p className="px-5 py-6 text-sm text-dark-muted text-center">신청자가 없습니다.</p>
              ) : (
                applications.map((app) => (
                  <div key={app.applicant_id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dark-text">{app.applicant_name}</p>
                      {app.message && (
                        <p className="text-xs text-dark-muted mt-0.5 truncate">{app.message}</p>
                      )}
                      <p className="text-xs text-dark-muted mt-0.5">
                        {format(parseISO(app.applied_at), 'yyyy.MM.dd HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${APP_STATUS_LABEL[app.status].className}`}>
                        {APP_STATUS_LABEL[app.status].label}
                      </span>
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.applicant_id, 'APPROVED')}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app.applicant_id, 'REJECTED')}
                            className="text-xs px-2.5 py-1 rounded-lg bg-rose-400/10 text-rose-400 border border-rose-400/30 hover:bg-rose-400/20 transition-colors"
                          >
                            거절
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 신청 모달 */}
      {showApplyModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-3 sm:p-4"
          onClick={() => setShowApplyModal(false)}
        >
          <div
            className="bg-dark-card rounded-2xl shadow-xl max-w-md w-full p-6 border border-dark-line text-dark-text"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-1">신청하기</h2>
            <p className="text-sm text-dark-muted mb-4">{activity.title}</p>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="신청 메시지를 입력하세요 (선택)"
              rows={4}
              className="w-full rounded-lg border border-dark-line bg-dark-cardSoft px-3 py-2 text-sm text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-brand mb-4"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-dark-line text-dark-muted hover:text-white hover:bg-dark-cardSoft transition-colors text-sm font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applyLoading}
                className="flex-1 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-light transition-colors text-sm disabled:opacity-50"
              >
                {applyLoading ? '처리 중...' : '신청 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
