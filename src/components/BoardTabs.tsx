import React from 'react';

export type TabType = 'free' | 'project' | 'blog';

interface BoardTabsProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BoardTabs: React.FC<BoardTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="bg-dark-card rounded-xl p-5 shadow-sm border border-dark-line">
      {/* 텍스트 타이틀 */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1 h-3.5 bg-brand rounded-full"></div>
        <span className="text-xs font-bold text-dark-muted tracking-wider uppercase">
          COMMUNITY BOARDS
        </span>
      </div>

      {/* 둥근 버튼식 탭 정렬 */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => onTabChange('free')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
            currentTab === 'free'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-dark-card text-dark-text border border-dark-line hover:bg-dark-bg hover:text-brand hover:border-transparent'
          }`}
        >
          자유게시판
        </button>
        
        <button
          type="button"
          onClick={() => onTabChange('project')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
            currentTab === 'project'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-dark-card text-dark-text border border-dark-line hover:bg-dark-bg hover:text-brand hover:border-transparent'
          }`}
        >
          프로젝트 게시판
        </button>

        <button
          type="button"
          onClick={() => onTabChange('blog')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
            currentTab === 'blog'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-dark-card text-dark-text border border-dark-line hover:bg-dark-bg hover:text-brand hover:border-transparent'
          }`}
        >
          블로그
        </button>
      </div>
    </div>
  );
};