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
  onOpenAuth: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
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
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-purple-100/80 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Study<span className="text-purple-600">Mind</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-normal mt-0.5">
                Your personal study space
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                YOUR WORKSPACE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
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
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 translate-x-1'
                        : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-purple-100/70 text-purple-700'
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
        <div className="p-4 border-t border-purple-50 space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white border border-purple-100/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <p className="text-xs font-bold text-purple-900">
                Learning, made lighter
              </p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Study smarter with your personal AI learning companion.
            </p>
          </div>

          {/* User Account / Profile Box */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {currentUser.displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onOpenAuth}
                  title="Account Settings"
                  className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-white rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  title="Switch / Log out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
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
