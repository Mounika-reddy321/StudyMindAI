import React from 'react';
import { Menu, Sparkles, User, Globe, CheckCircle2 } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { UserProfile } from '../services/storage';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: UserProfile;
  onOpenMobile: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onOpenMobile,
  onOpenAuth,
}) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    assistant: {
      title: 'AI Study Assistant',
      subtitle: 'Ask anything. Learn at your own pace.',
    },
    history: {
      title: 'Saved Conversations',
      subtitle: 'Review your personalized chat records and learning sessions.',
    },
    library: {
      title: 'Story & Audio Book Library',
      subtitle: '100 original stories and timeless public domain classics with voice playback.',
    },
    notes: {
      title: 'Smart Notes Generator',
      subtitle: 'Generate structured academic notes from topics, syllabus, or uploaded PDFs.',
    },
    exam: {
      title: 'Interactive Exam Simulator',
      subtitle: 'Test your knowledge with AI-generated multi-choice exams and instant feedback.',
    },
    news: {
      title: 'Daily News & Newspapers',
      subtitle: 'Real-time verified headlines, state updates, and official newspaper directory.',
    },
  };

  const currentInfo = titles[activeTab] || titles.assistant;

  return (
    <header className="sticky top-0 z-30 bg-[#f8f6fc]/85 backdrop-blur-md border-b border-purple-100/60 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-100/60 rounded-xl transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-purple-600 uppercase">
              YOUR AI LEARNING COMPANION
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Indicator badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini 3.8 Flash Connected</span>
        </div>

        {/* Profile indicator */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-purple-100/80 shadow-2xs transition-all text-xs font-semibold"
        >
          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
            {currentUser.displayName ? currentUser.displayName[0] : 'U'}
          </div>
          <span className="hidden md:inline">{currentUser.displayName}</span>
        </button>
      </div>
    </header>
  );
};
