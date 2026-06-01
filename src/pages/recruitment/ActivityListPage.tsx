import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Plus, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getActivities } from '../../api/recruitment';
import type { ActivityListItem, RecruitmentType, RecruitmentStatus } from '../../types/recruitment';

const TYPE_LABELS: Record<RecruitmentType, string> = {
  STUDY: '스터디',
  PROJECT: '프로젝트',
  CONTEST: '공모전',
  MENTORING: '멘토링',
};

const TYPE_COLOR: Record<RecruitmentType, string> = {
  STUDY: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PROJECT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  CONTEST: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  MENTORING: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const STATUS_LABELS: Record<RecruitmentStatus, { label: string; className: string }> = {
  RECRUITING: { label: '모집 중', className: 'bg-dark-cardSoft text-dark-text border border-dark-line' },
  CLOSED: { label: '모집 마감', className: 'bg-dark-pill text-dark-muted border border-dark-line' },
  COMPLETED: { label: '완료', className: 'bg-brand/10 text-brand-light border border-brand/30' },
};

const ActivityCard: React.FC<{ item: ActivityListItem }> = ({ item }) => {
  const isFull = item.current_participants >= item.max_participants;
  const isRecruiting = item.recruitment_status === 'RECRUITING';

  return (
    <Link
      to={`/recruitment/${item.id}`}
      className="block p-5 bg-dark-card border border-dark-line rounded-2xl hover:border-brand transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TYPE_COLOR[item.recruitment_type]}`}>
            {TYPE_LABELS[item.recruitment_type]}
          </span>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${STATUS_LABELS[item.recruitment_status].className}`}>
            {STATUS_LABELS[item.recruitment_status].label}
          </span>
        </div>
        {isRecruiting && isFull && (
          <span className="text-xs text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/30 whitespace-nowrap">
            마감 임박
          </span>
        )}
      </div>

      <h3 className="text-base font-bold text-dark-text group-hover:text-brand-light transition-colors mb-3 line-clamp-2">
        {item.title}
      </h3>

      {item.tech_stacks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.tech_stacks.slice(0, 4).map((stack) => (
            <span key={stack} className="text-xs px-2 py-0.5 rounded bg-dark-cardSoft border border-dark-line text-dark-muted">
              {stack}
            </span>
          ))}
          {item.tech_stacks.length > 4 && (
            <span className="text-xs text-dark-muted">+{item.tech_stacks.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-dark-muted">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span className={isFull ? 'text-rose-400' : ''}>
            {item.current_participants} / {item.max_participants}명
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>마감 {format(parseISO(item.deadline), 'MM/dd')}</span>
        </div>
      </div>
    </Link>
  );
};

const ActivityListPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ActivityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<RecruitmentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<RecruitmentStatus | ''>('RECRUITING');
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getActivities({
        recruitment_type: typeFilter || undefined,
        recruitment_status: statusFilter || undefined,
        search_keyword: keyword || undefined,
        size: 20,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch {
      toast.error('모집 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, keyword]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputKeyword);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">활동 모집</h1>
          <p className="text-dark-muted mt-1">스터디, 프로젝트, 공모전, 멘토링 팀원을 찾아보세요</p>
        </div>
        {user && (
          <Link
            to="/recruitment/write"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            모집 글 작성
          </Link>
        )}
      </div>

      {/* 검색 + 필터 */}
      <div className="space-y-3 mb-6">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            placeholder="제목으로 검색..."
            className="w-full rounded-lg border border-dark-line bg-dark-cardSoft px-4 py-3 pl-10 text-sm text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-brand"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand text-white rounded-lg text-xs font-medium hover:bg-brand-light transition-colors">
            검색
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {/* 유형 필터 */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setTypeFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === '' ? 'bg-white text-dark-bg' : 'text-dark-muted hover:text-white hover:bg-dark-cardSoft border border-dark-line'
              }`}
            >
              전체 유형
            </button>
            {(Object.keys(TYPE_LABELS) as RecruitmentType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === t ? 'bg-white text-dark-bg' : 'text-dark-muted hover:text-white hover:bg-dark-cardSoft border border-dark-line'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* 상태 필터 */}
          <div className="flex gap-1.5 ml-auto">
            {(['RECRUITING', '', 'CLOSED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s as RecruitmentStatus | '')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-white text-dark-bg' : 'text-dark-muted hover:text-white hover:bg-dark-cardSoft border border-dark-line'
                }`}
              >
                {s === 'RECRUITING' ? '모집 중' : s === '' ? '전체' : '마감'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 카운트 */}
      <p className="text-sm text-dark-muted mb-4">총 {total}건</p>

      {/* 목록 */}
      {loading ? (
        <div className="text-center py-20 text-dark-muted">로딩 중...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-dark-cardSoft/50 rounded-2xl border border-dark-line">
          <p className="text-dark-muted">모집 글이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityListPage;
