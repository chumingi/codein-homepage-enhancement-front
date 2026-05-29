import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getBoards, getBoardPosts } from '../../api/board';
import type { Board, Post } from '../../types/board';
import { useAuth } from '../../context/AuthContext'; 
import { Megaphone, MessageSquare, ChevronRight, Home, PencilLine, Eye } from 'lucide-react';
import { BoardTabs } from '../../components/BoardTabs';
import type { TabType } from '../../components/BoardTabs';

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
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('free');

  const selectedBoard = boards.find((board) => board.id === selectedBoardId);
  const isNoticeBoard = selectedBoard?.board_type === 'notice';

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getBoards();
        const visibleBoards = data.filter((board) => 
          board.board_type === 'general' || board.board_type === 'notice' || board.board_type === 'qna'
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
  }, [location.search, location.state]);

  useEffect(() => {
    let targetId = selectedBoardId;
    if (currentTab === 'free') {
      const generalBoard = boards.find(b => b.board_type === 'general');
      if (generalBoard) targetId = generalBoard.id;
    } else if (currentTab === 'project') {
      targetId = 2; 
    } else if (currentTab === 'blog') {
      targetId = 3; 
    }

    if (targetId && targetId !== selectedBoardId) {
      setSelectedBoardId(targetId);
    }
  }, [currentTab, boards]);

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
    const date = new Date(value);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const sortedPosts = [...posts].sort((a, c) => {
    const pinDiff = Number(c.is_pinned) - Number(a.is_pinned);
    if (pinDiff !== 0) return pinDiff;
    return new Date(c.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const [localLikes, setLocalLikes] = useState<Record<number, { count: number; liked: boolean }>>(() => {
    const saved = localStorage.getItem('codein_board_likes');
    return saved ? JSON.parse(saved) : {};
  });

  const handleLikeClick = (e: React.MouseEvent, postId: number, currentLikes: number) => {
    e.preventDefault(); // 링크 이동 막기
    e.stopPropagation(); // 부모 클릭 이벤트 전파 막기

    setLocalLikes((prev) => {
      const currentData = prev[postId] || { count: currentLikes, liked: false };
      const nextLiked = !currentData.liked;
      const nextCount = nextLiked ? currentData.count + 1 : Math.max(0, currentData.count - 1);

      const updated = {
        ...prev,
        [postId]: { count: nextCount, liked: nextLiked },
      };
      
      // 나갔다 와도 유지되도록 브라우저 창고에 저장!
      localStorage.setItem('codein_board_likes', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-400 mb-6 space-x-2">
        <Home className="w-4 h-4" />
        <Link to="/" className="hover:text-blue-500">홈</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-400">게시판</span>
        {selectedBoard && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-blue-500">{selectedBoard.name}</span>
          </>
        )}
      </nav>

      {/* 상단 타이틀 구역 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
            {isNoticeBoard ? <Megaphone className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {currentTab === 'free' ? '자유게시판' : currentTab === 'project' ? '프로젝트 게시판' : '기술 블로그'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {currentTab === 'blog' ? '개발 지식과 포스트를 공유하는 공간입니다.' : '자유로운 소통과 정보를 공유하는 공간입니다.'}
            </p>
          </div>
        </div>
        {user && selectedBoardId !== 2 && (
          <Link
            to={`/board/write?category=${currentTab}`}
            state={{ boardId: selectedBoardId }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
          >
            <PencilLine className="w-4 h-4" />
            글쓰기
          </Link>
        )}
      </div>

      {/* 🗂 "COMMUNITY BOARDS" 하위 탭 배치 */}
      {!isNoticeBoard && (
        <div className="mb-6">
          <BoardTabs currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>
      )}

      {/* 리스트 구역 */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">로딩중...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">게시글이 없습니다.</div>
      ) : currentTab === 'blog' ? (
        
        /* 🎨 블로그 전용 카드 레이아웃 */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedPosts.map((post) => {
            const likeInfo = localLikes[post.id] || { count: post.view_count || 0, liked: false };
            return (
              <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                <Link to={`/board/${selectedBoardId}/post/${post.id}`} state={{ boardId: selectedBoardId }} className="block">
                  <div className="w-full h-44 overflow-hidden bg-gray-50">
                    <img 
                      src={(post as any).thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400'} 
                      alt="썸네일" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>{getNoticeBadge(post.notice_type, post.is_blinded)}</div>
                      {/* 카드 하단 하트 버튼 */}
                      <button
                        onClick={(e) => handleLikeClick(e, post.id, post.view_count || 0)}
                        className={`flex items-center gap-1 text-xs font-semibold transition-colors ${likeInfo.liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                      >
                        ❤️ {likeInfo.count}
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-gray-800 line-clamp-1 mb-3">{post.title}</h3>
                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-2.5">
                      <span className="font-semibold text-gray-600">by {post.author?.name || '알 수 없음'}</span>
                      <span>{formatPostDate(post.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

      ) : (

        /* 📊 자유 및 프로젝트 탭일 때 뜨는 기존 리스트 */
        <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {sortedPosts.map((post) => {
              const likeInfo = localLikes[post.id] || { count: post.view_count || 0, liked: false };
              return (
                <li key={post.id} className="transition-all hover:bg-gray-50">
                  <Link to={`/board/${selectedBoardId}/post/${post.id}`} state={{ boardId: selectedBoardId }} className="block p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          {getNoticeBadge(post.notice_type, post.is_blinded)}
                          <p className={`text-sm font-semibold truncate ${post.is_blinded ? 'text-gray-400 line-through' : 'text-blue-600'} flex items-center gap-2`}>
                            {post.title}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 mt-1.5">
                          <span className="font-medium text-gray-600 mr-3">{post.author?.name || '알 수 없음'}</span>
                          <span>{formatPostDate(post.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-4">
                        {/* 리스트 우측 하트 버튼 */}
                        <button
                          onClick={(e) => handleLikeClick(e, post.id, post.view_count || 0)}
                          className={`flex items-center gap-1 text-xs font-semibold p-1.5 rounded-lg transition-colors ${
                            likeInfo.liked ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:bg-gray-50 hover:text-red-400'
                          }`}
                        >
                           <span className="font-bold">{likeInfo.count}</span>
                        </button>
                        <div className="flex items-center text-sm text-gray-400">
                          <Eye className="w-4 h-4 mr-1 text-gray-300" />
                          {post.view_count}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BoardListPage;