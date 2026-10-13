/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { AIAssistant } from './components/AIAssistant';
import { ChatHistory } from './components/ChatHistory';
import { AudioBookLibrary } from './components/AudioBookLibrary';
import { NotesGenerator } from './components/NotesGenerator';
import { ExamSimulator } from './components/ExamSimulator';
import { DailyNews } from './components/DailyNews';
import { AuthModal } from './components/AuthModal';
import { StorageService, UserProfile, DEFAULT_USER } from './services/storage';

export type ThemeMode = 'light' | 'dark';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('assistant');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('studymind_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    StorageService.getCurrentUser()
  );
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Keep dark class on html root and persist preference
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studymind_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Keep Storage current user in sync
  useEffect(() => {
    StorageService.setCurrentUser(currentUser);
  }, [currentUser]);

  const handleSelectHistoryConversation = (id: string) => {
    setCurrentConversationId(id);
    setActiveTab('assistant');
  };

  const handleStartNewChat = () => {
    setCurrentConversationId('conv_' + Date.now());
    setActiveTab('assistant');
  };

  const handleLogout = () => {
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f0f6fa] dark:bg-[#060d17] text-slate-800 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobile={() => setIsOpenMobile(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Dynamic Workspace Content */}
        <main className="flex-1 pb-12">
          {activeTab === 'assistant' && (
            <AIAssistant
              currentUser={currentUser}
              currentConversationId={currentConversationId}
              setCurrentConversationId={setCurrentConversationId}
              onNavigateHistory={() => setActiveTab('history')}
            />
          )}

          {activeTab === 'history' && (
            <ChatHistory
              currentUser={currentUser}
              onSelectConversation={handleSelectHistoryConversation}
              onStartNewChat={handleStartNewChat}
            />
          )}

          {activeTab === 'library' && <AudioBookLibrary />}

          {activeTab === 'notes' && <NotesGenerator currentUser={currentUser} />}

          {activeTab === 'exam' && <ExamSimulator currentUser={currentUser} />}

          {activeTab === 'news' && <DailyNews />}
        </main>
      </div>

      {/* Auth & Profile Settings Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
      />
    </div>
  );
}
