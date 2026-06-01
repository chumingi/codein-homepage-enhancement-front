import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Trophy } from 'lucide-react';
import { getRankings } from '../../api/ranking';
import type { RankingEntry } from '../../types/ranking';

const RANK_FILTERS = ['all', 'diamond', 'platinum', 'gold', 'silver', 'bronze', 'unranked'] as const;

const RANK_STYLES: Record<string, string> = {
	diamond: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
	platinum: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
	gold: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
	silver: 'bg-slate-500/10 text-slate-200 border-slate-500/30',
	bronze: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
	unranked: 'bg-dark-cardSoft text-dark-muted border-dark-line',
};

const RankingPage: React.FC = () => {
	const [items, setItems] = useState<RankingEntry[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [submittedSearch, setSubmittedSearch] = useState('');
	const [rankFilter, setRankFilter] = useState<string>('all');

	const fetchRankings = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getRankings({
				search: submittedSearch || undefined,
				rank: rankFilter === 'all' ? undefined : rankFilter,
				page,
				page_size: 10,
			});
			setItems(data.items);
			setTotal(data.total);
			setTotalPages(data.total_pages);
		} finally {
			setLoading(false);
		}
	}, [page, rankFilter, submittedSearch]);

	useEffect(() => {
		fetchRankings();
	}, [fetchRankings]);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		setPage(1);
		setSubmittedSearch(search.trim());
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="text-3xl font-bold text-dark-text flex items-center gap-2">
						<Trophy className="w-8 h-8 text-brand-light" />
						랭킹
					</h1>
					<p className="text-dark-muted mt-1">코딩테스트 활동 기준 상위 랭킹을 확인하세요.</p>
				</div>

				<form onSubmit={handleSubmit} className="relative w-full md:max-w-sm">
					<input
						type="text"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="이름, 학번, 전공 검색"
						className="w-full rounded-xl border border-dark-line bg-dark-cardSoft px-4 py-3 pl-10 text-sm text-dark-text placeholder:text-dark-muted focus:outline-none focus:border-brand"
					/>
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
				</form>
			</div>

			<div className="flex flex-wrap gap-2">
				{RANK_FILTERS.map((rank) => (
					<button
						key={rank}
						type="button"
						onClick={() => {
							setRankFilter(rank);
							setPage(1);
						}}
						className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
							rankFilter === rank ? 'bg-white text-dark-bg border-white' : 'border-dark-line text-dark-muted hover:text-white hover:bg-dark-cardSoft'
						}`}
					>
						{rank === 'all' ? '전체' : rank}
					</button>
				))}
			</div>

			<div className="rounded-2xl border border-dark-line bg-dark-card overflow-hidden">
				<div className="px-5 py-4 border-b border-dark-line flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-dark-text">상위 랭킹</h2>
						<p className="text-xs text-dark-muted mt-0.5">총 {total}명</p>
					</div>
				</div>

				{loading ? (
					<div className="p-10 text-center text-dark-muted">로딩 중...</div>
				) : items.length === 0 ? (
					<div className="p-10 text-center text-dark-muted">표시할 랭킹이 없습니다.</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-dark-cardSoft/50 text-dark-muted">
								<tr>
									<th className="px-5 py-3 text-left font-medium">순위</th>
									<th className="px-5 py-3 text-left font-medium">이름</th>
									<th className="px-5 py-3 text-left font-medium">학번</th>
									<th className="px-5 py-3 text-left font-medium">전공</th>
									<th className="px-5 py-3 text-left font-medium">기수</th>
									<th className="px-5 py-3 text-left font-medium">랭크</th>
									<th className="px-5 py-3 text-left font-medium">포인트</th>
									<th className="px-5 py-3 text-left font-medium">해결</th>
									<th className="px-5 py-3 text-left font-medium">정답률</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-dark-line">
								{items.map((item) => (
									<tr key={item.user_id} className="hover:bg-dark-cardSoft/40 transition-colors">
										<td className="px-5 py-4 font-semibold text-dark-text">{item.rank}</td>
										<td className="px-5 py-4 text-dark-text">{item.user_name}</td>
										<td className="px-5 py-4 text-dark-muted">{item.student_id}</td>
										<td className="px-5 py-4 text-dark-muted">{item.major}</td>
										<td className="px-5 py-4 text-dark-muted">{item.generation}</td>
										<td className="px-5 py-4">
											<span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${RANK_STYLES[item.rank_name] ?? RANK_STYLES.unranked}`}>
												{item.rank_name}
											</span>
										</td>
										<td className="px-5 py-4 text-dark-text font-semibold">{item.points.toLocaleString()}</td>
										<td className="px-5 py-4 text-dark-muted">{item.solved_count}문제</td>
										<td className="px-5 py-4 text-dark-muted">{item.accepted_rate}%</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-dark-line px-5 py-4">
						<button
							type="button"
							onClick={() => setPage((current) => Math.max(1, current - 1))}
							disabled={page === 1}
							className="inline-flex items-center gap-1 rounded-lg border border-dark-line px-3 py-2 text-sm text-dark-muted disabled:opacity-50"
						>
							<ChevronLeft className="w-4 h-4" /> 이전
						</button>
						<span className="text-sm text-dark-muted">{page} / {totalPages}</span>
						<button
							type="button"
							onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
							disabled={page === totalPages}
							className="inline-flex items-center gap-1 rounded-lg border border-dark-line px-3 py-2 text-sm text-dark-muted disabled:opacity-50"
						>
							다음 <ChevronRight className="w-4 h-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default RankingPage;
