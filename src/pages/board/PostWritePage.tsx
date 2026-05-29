import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPost, updatePost, getBoards, uploadPostAttachment } from '../../api/board';
import { getNoticeTemplates } from '../../api/admin';
import type { CreatePostPayload, Board } from '../../types/board';
import type { NoticeTemplate } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PostWritePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const initialTitle = searchParams.get('title') || '';
  const initialContent = searchParams.get('content') || '';
  
  // 🌟 URL에서 현재 카테고리(free, project, blog 등) 감지
  const currentCategory = searchParams.get('category') || 'free';

  // 안전장치: location.state가 없어도 터지지 않게 보호
  const locationState = location.state || {};

  const [boards, setBoards] = useState<Board[]>([]);
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [boardId, setBoardId] = useState<number>(locationState.boardId || 0);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // 🌟 깃허브 및 썸네일 입력 상태 추가
  const [githubUrl, setGithubUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const editPost = locationState.post;
  const isEditMode = !!editPost;

  const [showAnnouncementOptions, setShowAnnouncementOptions] = useState(false);
  const [noticeType, setNoticeType] = useState('normal');
  const [targetAudience, setTargetAudience] = useState('all');
  const [targetRanks, setTargetRanks] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const isStaffOrAdmin = user && ['staff', 'admin', 'superadmin'].includes(user.role);
  const availableBoards = isStaffOrAdmin
    ? boards
    : boards.filter((board) => !board.name.includes('공지'));

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getBoards();
        setBoards(data);
        const filteredBoards = isStaffOrAdmin
          ? data
          : data.filter((board) => !board.name.includes('공지'));
        if (filteredBoards.length > 0) {
          if (!boardId || !filteredBoards.some((board) => board.id === boardId)) {
            setBoardId(filteredBoards[0].id);
          }
        }
      } catch (error) {
        toast.error('게시판 목록을 불러오는데 실패했습니다');
      }
    };
    fetchBoards();

    if (isStaffOrAdmin) {
      const fetchTemplates = async () => {
        try {
          const data = await getNoticeTemplates();
          setTemplates(data);
        } catch (error) {
          console.error('Failed to load templates', error);
        }
      };
      fetchTemplates();
    }
  }, [boardId, isStaffOrAdmin]);

  useEffect(() => {
    if (isEditMode && editPost) {
      setBoardId(editPost.board_id);
      setTitle(editPost.title);
      setContent(editPost.content);
      if ((editPost as any).github_url) setGithubUrl((editPost as any).github_url);
      if ((editPost as any).thumbnail_url) setThumbnailUrl((editPost as any).thumbnail_url);

      if (editPost.notice_type) {
        setShowAnnouncementOptions(true);
        setNoticeType(editPost.notice_type);
        setTargetAudience(editPost.target_audience || 'all');
        if (editPost.target_ranks) {
          setTargetRanks(editPost.target_ranks.split(','));
        }
        setScheduledAt(editPost.scheduled_at ? editPost.scheduled_at.substring(0, 16) : '');
        setExpiresAt(editPost.expires_at ? editPost.expires_at.substring(0, 16) : '');
        setIsPinned(editPost.is_pinned || false);
      }
    }
  }, [isEditMode, editPost]);

  const handleTemplateSelect = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      if (content && !window.confirm('현재 내용이 대체됩니다. 계속하시겠습니까?')) {
        return;
      }
      setContent(template.content);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 입력해주세요');
      return;
    }
    if (!boardId) {
      toast.error('게시판을 선택해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      // strict 규칙을 위반하지 않도록 타입 단언(as) 결합
      const payload = {
        title,
        content,
        board_id: boardId,
        github_url: currentCategory === 'project' ? githubUrl : undefined,
        thumbnail_url: currentCategory === 'blog' ? thumbnailUrl : undefined,
        ...(showAnnouncementOptions ? {
          notice_type: noticeType,
          target_audience: targetAudience,
          target_ranks: targetAudience === 'specific_ranks' ? targetRanks : undefined,
          scheduled_at: scheduledAt || undefined,
          expires_at: expiresAt || undefined,
          is_pinned: isPinned
        } : {})
      } as CreatePostPayload & { github_url?: string; thumbnail_url?: string };

      let post;
      if (isEditMode && editPost) {
        post = await updatePost(boardId, editPost.id, payload as any);
      } else {
        post = await createPost(boardId, payload as any);
      }

      if (files.length > 0) {
        try {
          await Promise.all(files.map(file => uploadPostAttachment(boardId, post.id, file)));
        } catch (error) {
          console.error('Failed to upload attachments', error);
          toast.error('게시글은 생성되었지만 일부 첨부파일 업로드에 실패했습니다');
        }
      }

      toast.success(isEditMode ? '게시글이 수정되었습니다' : '게시글이 작성되었습니다');
      navigate(`/board/${boardId}/post/${post.id}`);
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? '게시글 수정에 실패했습니다' : '게시글 작성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-left">{isEditMode ? '글 수정' : '글쓰기'}</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4 text-left">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="board">
            게시판
          </label>
          <select
            id="board"
            value={boardId}
            onChange={(e) => setBoardId(Number(e.target.value))}
            className="shadow border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {availableBoards.map((board) => (
              <option key={board.id} value={board.id}>{board.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4 text-left">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 🌟 카테고리별 조건부 인풋란 배치 구역 */}
        {currentCategory === 'project' && (
          <div className="mb-4 text-left">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              🐙 GitHub 주소
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="https://github.com/username/repository"
            />
          </div>
        )}

        {currentCategory === 'blog' && (
          <div className="mb-4 text-left">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              🖼️ 블로그 썸네일 이미지 주소
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="https://example.com/image.png"
            />
          </div>
        )}

        <div className="mb-6 text-left">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 text-sm font-bold" htmlFor="content">
              내용
            </label>
            {isStaffOrAdmin && templates.length > 0 && (
              <select
                className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700"
                onChange={(e) => handleTemplateSelect(Number(e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>템플릿 불러오기</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-64"
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="mb-6 text-left">
          <label className="block text-gray-700 text-sm font-bold mb-2">첨부파일</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {files.length > 0 && (
            <ul className="mt-2 text-sm text-gray-600">
              {files.map((file, index) => (
                <li key={index}>📎 {file.name} ({Math.round(file.size / 1024)} KB)</li>
              ))}
            </ul>
          )}
        </div>

        {isStaffOrAdmin && (
          <div className="mb-6 border rounded p-4 text-left">
            <button
              type="button"
              onClick={() => setShowAnnouncementOptions(!showAnnouncementOptions)}
              className="flex items-center justify-between w-full text-left font-bold text-gray-700 focus:outline-none"
            >
              <span>공지 옵션</span>
              <span>{showAnnouncementOptions ? '−' : '+'}</span>
            </button>

            {showAnnouncementOptions && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">공지 유형</label>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value)}
                    className="shadow border border-gray-300 rounded w-full py-2 px-3 text-gray-700"
                  >
                    <option value="normal">일반 공지</option>
                    <option value="important">중요 공지</option>
                    <option value="urgent">긴급 공지</option>
                    <option value="recruit">모집 공지</option>
                    <option value="event">행사 공지</option>
                    <option value="contest">코딩테스트 공지</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">대상</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="shadow border border-gray-300 rounded w-full py-2 px-3 text-gray-700"
                  >
                    <option value="all">전체</option>
                    <option value="members">회원만</option>
                    <option value="admins">운영진만</option>
                    <option value="specific_ranks">특정 랭크만</option>
                  </select>
                  {targetAudience === 'specific_ranks' && (
                    <div className="mt-2">
                      <label className="block text-gray-700 text-xs font-bold mb-1">랭크 선택</label>
                      <div className="flex flex-wrap gap-2">
                        {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map(rank => (
                          <label key={rank} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={targetRanks.includes(rank)}
                              onChange={(e) => {
                                if (e.target.checked) setTargetRanks([...targetRanks, rank]);
                                else setTargetRanks(targetRanks.filter(r => r !== rank));
                              }}
                              className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm capitalize">{rank}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">예약 게시</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">예약 게시 시간 (비워두면 즉시 게시)</p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">만료 시간</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">만료 시간 (비워두면 만료 없음)</p>
                </div>

                <div className="md:col-span-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-gray-700 font-bold">상단 고정</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">체크하면 게시판 상단에 고정됩니다</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (isEditMode ? '수정중...' : '등록중...') : (isEditMode ? '수정 완료' : '등록')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostWritePage;