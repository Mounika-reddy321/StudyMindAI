import React from 'react';
import {
  Sparkles,
  Bot,
  History,
  BookOpen,
  FileText,
  GraduationCap,
  Newspaper,
  BookMarked,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile } from '../services/storage';

export type ActiveTab =
  | 'assistant'
  | 'history'
  | 'library'
  | 'notes'
  | 'exam'
  | 'news';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  theme,
  onToggleTheme,
  onOpenAuth,
  onLogout,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    {
      id: 'assistant' as ActiveTab,
      label: 'AI Assistant',
      icon: Bot,
      badge: 'Interactive',
    },
    {
      id: 'history' as ActiveTab,
      label: 'Chat History',
      icon: History,
    },
    {
      id: 'library' as ActiveTab,
      label: 'Audio Book Library',
      icon: BookOpen,
      badge: '100 Stories',
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Notes Generator',
      icon: FileText,
      badge: 'PDF AI',
    },
    {
      id: 'exam' as ActiveTab,
      label: 'Exam Simulator',
      icon: GraduationCap,
      badge: 'Quiz',
    },
    {
      id: 'news' as ActiveTab,
      label: 'Daily News',
      icon: Newspaper,
      badge: 'Live RSS',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-[#070f1c] border-r border-sky-100/80 dark:border-sky-950/70 z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-sky-50 dark:border-sky-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-950 via-slate-900 to-sky-500 dark:from-blue-900 dark:via-sky-900 dark:to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Study<span className="text-sky-600 dark:text-sky-400">Mind</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 uppercase">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-0.5">
                Your personal study space
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                YOUR WORKSPACE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-md shadow-blue-950/25 dark:shadow-sky-600/25 translate-x-1'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-white hover:bg-sky-50/80 dark:hover:bg-sky-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-sky-400 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-900 dark:group-hover:text-sky-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-sky-500/20 text-sky-300 dark:bg-white/20 dark:text-white'
                            : 'bg-sky-100/80 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Card as requested */}
        <div className="p-4 border-t border-sky-50 dark:border-sky-950/60 space-y-2.5">
          {/* Quick Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#0a1526] border border-slate-200/70 dark:border-sky-950/80 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-sky-600" />
              )}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#0c1829] text-sky-700 dark:text-sky-300 border border-slate-200/80 dark:border-sky-900/60 uppercase">
              {theme}
            </span>
          </button>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/40 to-white dark:from-[#0c1829] dark:via-[#0a1526] dark:to-[#0c1829] border border-sky-100/80 dark:border-sky-950/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <p className="text-xs font-bold text-blue-950 dark:text-sky-300">
                Learning, made lighter
              </p>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Study smarter with your personal AI learning companion.
            </p>
          </div>

          {/* User Account / Profile Box */}
          <div className="pt-0.5">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0a1526] border border-slate-100 dark:border-sky-950/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/60 text-blue-950 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser.displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onOpenAuth}
                  title="Account Settings"
                  className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  title="Switch / Log out"
                  className="p-1.5 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
