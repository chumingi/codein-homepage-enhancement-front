import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getBoards, getBoardPosts } from '../../api/board';
import type { Board, Post } from '../../types/board';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, MessageSquare, ChevronRight, Home, PencilLine, Eye } from 'lucide-react';
import { BoardTabs } from '../../components/BoardTabs';
import type { TabType } from '../../components/BoardTabs';
import { format, parseISO } from 'date-fns';

const getPreferredBoardId = (availableBoards: Board[], search: string) => {
  if (availableBoards.length === 0) return null;

  const params = new URLSearchParams(search);
  const boardParam = params.get('board');

  if (!boardParam) return availableBoards[0].id;

  const numericId = Number(boardParam);
  if (!Number.isNaN(numericId)) {
    const numericMatch = availableBoards.find((board) => board.id === numericId);
    if (numericMatch) return numericMatch.id;
  }

  const normalized = boardParam.toLowerCase();
  const noticeBoard = availableBoards.find((board) => board.board_type === 'notice');
  const generalBoard = availableBoards.find((board) => board.board_type === 'general');
  const qnaBoard = availableBoards.find((board) => board.board_type === 'qna');

  if (normalized === 'notice') return noticeBoard?.id ?? availableBoards[0].id;
  if (normalized === 'board' || normalized === 'general') {
    return generalBoard?.id ?? qnaBoard?.id ?? availableBoards[0].id;
  }
  if (normalized === 'qna') return qnaBoard?.id ?? availableBoards[0].id;

  return availableBoards[0].id;
};

const BoardListPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('free');

  const selectedBoard = boards.find((board) => board.id === selectedBoardId);
  const isNoticeBoard = selectedBoard?.board_type === 'notice';
  const noticeBoards = boards.filter((board) => board.board_type === 'notice');
  const unreadNoticeCount = user && isNoticeBoard
    ? posts.filter((post) => post.notice_type && !post.is_read).length
    : 0;

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getBoards();
        const visibleBoards = data.filter(
          (board) =>
            board.board_type === 'general' ||
            board.board_type === 'notice' ||
            board.board_type === 'qna' ||
            board.board_type === 'project' ||
            board.board_type === 'blog'
        );
        setBoards(visibleBoards);

        const stateBoardId = location.state && typeof location.state === 'object'
          ? (location.state as { boardId?: number }).boardId
          : undefined;
        const matchedBoardId = stateBoardId
          ? data.find((board) => board.id === stateBoardId)?.id
          : undefined;

        setSelectedBoardId(matchedBoardId ?? getPreferredBoardId(data, location.search));
      } catch (error) {
        console.error('Failed to fetch boards', error);
      }
    };
    fetchBoards();
  }, [location.search, location.state, user]);

  useEffect(() => {
    // 공지 게시판을 보고 있을 때는 탭 전환이 선택을 덮어쓰지 않도록 한다.
    const currentBoard = boards.find((b) => b.id === selectedBoardId);
    if (currentBoard?.board_type === 'notice') return;

    let targetId = selectedBoardId;
    if (currentTab === 'free') {
      const generalBoard = boards.find(b => b.board_type === 'general');
      if (generalBoard) targetId = generalBoard.id;
    } else if (currentTab === 'project') {
      const projectBoard = boards.find(b => b.board_type === 'project');
      if (projectBoard) targetId = projectBoard.id;
    } else if (currentTab === 'blog') {
      const blogBoard = boards.find(b => b.board_type === 'blog');
      if (blogBoard) targetId = blogBoard.id;
    }

    if (targetId && targetId !== selectedBoardId) {
      setSelectedBoardId(targetId);
    }
  }, [currentTab, boards, selectedBoardId]);

  useEffect(() => {
    if (selectedBoardId) {
      const fetchPosts = async () => {
        setLoading(true);
        try {
          const data = await getBoardPosts(selectedBoardId, {
            notice_only: isNoticeBoard,
          });
          setPosts(data);
        } catch (error) {
          console.error('Failed to fetch posts', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [selectedBoardId, isNoticeBoard]);

  const getNoticeBadge = (type?: string | null, isBlinded?: boolean) => {
    const badges = [];
    if (isBlinded && user?.role === 'superadmin') {
      badges.push(
        <span key="blinded" className="bg-gray-500 text-white text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
          블라인드
        </span>
      );
    }
    switch (type) {
      case 'urgent':
        badges.push(<span key="urgent" className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">긴급</span>);
        break;
      case 'important':
        badges.push(<span key="important" className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">중요</span>);
        break;
      case 'normal':
        badges.push(<span key="normal" className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">공지</span>);
        break;
      default:
        break;
    }
    return badges.length > 0 ? <>{badges}</> : null;
  };

  const formatPostDate = (value: string) => {
    return format(parseISO(value), 'yyyy.MM.dd');
  };

  const sortedPosts = [...posts].sort((a, c) => {
    const pinDiff = Number(c.is_pinned) - Number(a.is_pinned);
    if (pinDiff !== 0) return pinDiff;
    return new Date(c.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const pageTitle = isNoticeBoard
    ? (selectedBoard?.name ?? '공지사항')
    : currentTab === 'free'
    ? '자유게시판'
    : currentTab === 'project'
    ? '프로젝트 게시판'
    : '기술 블로그';

  const pageDescription = isNoticeBoard
    ? 'CodeIn의 최신 소식과 중요 안내를 가장 먼저 확인하세요.'
    : currentTab === 'blog'
    ? '개발 지식과 경험을 공유하는 공간입니다.'
    : '자유로운 소통과 정보를 공유하는 공간입니다.';

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-dark-muted mb-6 space-x-2">
        <Home className="w-4 h-4" />
        <Link to="/" className="hover:text-brand">홈</Link>
        <ChevronRight className="w-4 h-4" />
        <span>게시판</span>
        {selectedBoard && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-brand">{selectedBoard.name}</span>
          </>
        )}
      </nav>

      {/* 상단 타이틀 구역 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand text-white rounded-xl shadow-md">
            {isNoticeBoard ? <Megaphone className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-text">{pageTitle}</h1>
            <p className="text-sm text-dark-muted mt-1">{pageDescription}</p>
          </div>
        </div>

        {user && (
          <Link
            to={`/board/write?category=${currentTab}`}
            state={{ boardId: selectedBoardId }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
          >
            <PencilLine className="w-4 h-4" />
            글쓰기
          </Link>
        )}
      </div>

      {/* 공지게시판 배너 */}
      {isNoticeBoard && (
        <div className="mb-6 bg-brand rounded-xl p-6 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">공지사항 안내</h3>
            <p className="text-white/70 text-sm">CodeIn의 최신 소식과 중요 안내를 가장 먼저 확인하세요.</p>
          </div>
          <Megaphone className="absolute -bottom-6 -right-6 w-32 h-32 text-white/20 transform -rotate-12" />
        </div>
      )}

      {/* 게시판 탭 영역 */}
      {!isNoticeBoard && (
        <>
          {/* SYSTEM NOTICES */}
          {noticeBoards.length > 0 && (
            <div className="mb-4 p-4 bg-dark-cardSoft rounded-xl border border-dark-line">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-brand rounded-full" />
                <h2 className="text-xs font-bold text-dark-muted uppercase tracking-widest">SYSTEM NOTICES</h2>
                {unreadNoticeCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {unreadNoticeCount}
                  </span>
                )}
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {noticeBoards.map((board) => (
                  <button
                    type="button"
                    key={board.id}
                    onClick={() => {
                      setSelectedBoardId(board.id);
                      navigate(`/board?board=${board.id}`, { replace: true });
                    }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                      selectedBoardId === board.id
                        ? 'bg-brand text-white'
                        : 'bg-dark-card text-dark-text border border-dark-line hover:bg-dark-bg hover:text-brand'
                    }`}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* COMMUNITY BOARDS 탭 */}
          <div className="mb-6">
            <BoardTabs currentTab={currentTab} onTabChange={setCurrentTab} />
          </div>
        </>
      )}

      {/* 리스트 구역 */}
      {loading ? (
        <div className="bg-dark-card rounded-xl p-8 text-center text-dark-muted">로딩 중...</div>
      ) : posts.length === 0 ? (
        <div className="bg-dark-card rounded-xl p-8 text-center text-dark-muted">게시글이 없습니다.</div>
      ) : currentTab === 'blog' && !isNoticeBoard ? (

        /* 블로그 전용 카드 레이아웃 */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <div key={post.id} className="bg-dark-card rounded-xl border border-dark-line overflow-hidden hover:-translate-y-1 hover:border-brand/40 transition-all duration-200">
              <Link to={`/board/${selectedBoardId}/post/${post.id}`} state={{ boardId: selectedBoardId }} className="block">
                <div className="w-full h-44 overflow-hidden bg-dark-cardSoft flex items-center justify-center">
                  {post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt="썸네일"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-dark-muted">이미지 없음</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-1.5">
                    {getNoticeBadge(post.notice_type, post.is_blinded)}
                  </div>
                  <h3 className="text-base font-bold text-dark-text line-clamp-1 mb-3">{post.title}</h3>
                  <div className="flex justify-between items-center text-xs text-dark-muted border-t border-dark-line pt-2.5">
                    <span className="font-semibold">by {post.author?.name ?? '알 수 없음'}</span>
                    <span>{formatPostDate(post.created_at)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

      ) : (

        /* 자유 / 프로젝트 / 공지 탭 리스트 레이아웃 */
        <div className="bg-dark-card shadow-sm overflow-hidden rounded-xl border border-dark-line">
          <ul className="divide-y divide-dark-line">
            {sortedPosts.map((post) => (
              <li key={post.id} className="transition-all hover:bg-dark-cardSoft">
                <Link to={`/board/${selectedBoardId}/post/${post.id}`} state={{ boardId: selectedBoardId }} className="block p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1 flex-wrap gap-1">
                        {getNoticeBadge(post.notice_type, post.is_blinded)}
                        {post.is_pinned && (
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2 py-0.5 rounded">고정</span>
                        )}
                        {post.scheduled_at && new Date(post.scheduled_at).getTime() > Date.now() && (
                          <span className="bg-cyan-100 text-cyan-800 text-xs font-medium mr-2 px-2 py-0.5 rounded">예약</span>
                        )}
                        {post.expires_at && new Date(post.expires_at).getTime() < Date.now() && (
                          <span className="bg-gray-200 text-gray-600 text-xs font-medium mr-2 px-2 py-0.5 rounded">만료</span>
                        )}
                        <p className={`text-sm font-semibold truncate ${post.is_blinded ? 'text-dark-muted line-through' : 'text-brand'}`}>
                          {post.title}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-dark-muted mt-1.5">
                        <span className="font-medium mr-3">{post.author?.name ?? '알 수 없음'}</span>
                        <span>{formatPostDate(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex items-center text-sm text-dark-muted">
                        <Eye className="w-4 h-4 mr-1 opacity-60" />
                        {post.view_count}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BoardListPage;
