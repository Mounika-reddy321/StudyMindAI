import React from 'react';
import { Menu, Sparkles, User, Globe, CheckCircle2, Sun, Moon } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { UserProfile } from '../services/storage';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenMobile: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  theme,
  onToggleTheme,
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
    <header className="sticky top-0 z-30 bg-[#f0f6fa]/90 dark:bg-[#070e18]/90 backdrop-blur-md border-b border-sky-100/70 dark:border-sky-950/70 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-white hover:bg-sky-100/60 dark:hover:bg-sky-950/60 rounded-xl transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase">
              YOUR AI LEARNING COMPANION
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Indicator badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini 3.8 Flash Connected</span>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#0c1829] hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-sky-300 border border-sky-100/90 dark:border-sky-950 shadow-2xs hover:shadow-xs transition-all text-xs font-bold cursor-pointer"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Profile indicator */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0c1829] hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-950 dark:hover:text-white border border-sky-100/80 dark:border-sky-950 shadow-2xs transition-all text-xs font-semibold"
        >
          <div className="w-5 h-5 rounded-full bg-blue-950 dark:bg-sky-500 text-white flex items-center justify-center font-bold text-[10px]">
            {currentUser.displayName ? currentUser.displayName[0] : 'U'}
          </div>
          <span className="hidden md:inline">{currentUser.displayName}</span>
        </button>
      </div>
    </header>
  );
};
