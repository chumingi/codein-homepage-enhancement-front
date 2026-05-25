import React, { useEffect, useState } from 'react';
import { getCodetestRankings, getCodetestUserStats, CodetestRankingItem, CodetestUserStats } from '../api/codetestRanking';
import { useAuth } from '../context/AuthContext';
import DonutChart from '../components/charts/DonutChart';

const PERIODS = [
  { key: 'all', label: '전체' },
  { key: 'semester', label: '이번 학기' },
  { key: 'month', label: '이번 달' },
];

const badgeColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

const CodetestRankingPage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'all' | 'semester' | 'month'>('all');
  const [rankings, setRankings] = useState<CodetestRankingItem[]>([]);
  const [myStats, setMyStats] = useState<CodetestUserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCodetestRankings(period).then(data => {
      setRankings(data.rankings);
      setLoading(false);
    });
    if (user) {
      getCodetestUserStats(user.id, period).then(setMyStats);
    }
  }, [period, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">코딩테스트 랭킹/통계</h1>
      <div className="flex gap-2 mb-4">
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`px-4 py-2 rounded ${period === p.key ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setPeriod(p.key as any)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {user && myStats && (
        <div className="mb-6 p-4 bg-blue-50 rounded shadow flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <div className="font-bold mb-2">내 통계</div>
            <div>순위: {myStats.rank > 0 ? myStats.rank : '-'}</div>
            <div>정답률: {myStats.correct_rate.toFixed(1)}%</div>
            <div>제출 수: {myStats.total_submissions}</div>
          </div>
          <div>
            <DonutChart data={myStats.difficulty_breakdown} />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">순위</th>
              <th className="px-4 py-2">닉네임</th>
              <th className="px-4 py-2">총 제출 수</th>
              <th className="px-4 py-2">정답률(%)</th>
              <th className="px-4 py-2">최근 활동일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">로딩 중...</td></tr>
            ) : rankings.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">데이터 없음</td></tr>
            ) : (
              rankings.map((item, idx) => (
                <tr
                  key={item.user_id}
                  className={user && user.id === item.user_id ? 'bg-blue-100 font-bold' : ''}
                >
                  <td className="px-4 py-2">
                    {idx < 3 ? (
                      <span style={{ color: badgeColors[idx], fontWeight: 'bold' }}>●</span>
                    ) : null} {item.rank}
                  </td>
                  <td className="px-4 py-2">{item.nickname}</td>
                  <td className="px-4 py-2">{item.total_submissions}</td>
                  <td className="px-4 py-2">{item.correct_rate.toFixed(1)}</td>
                  <td className="px-4 py-2">{item.last_active_at ? new Date(item.last_active_at).toLocaleString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodetestRankingPage;
