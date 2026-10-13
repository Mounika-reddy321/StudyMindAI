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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('assistant');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    StorageService.getCurrentUser()
  );
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
    <div className="min-h-screen bg-[#f8f6fc] text-slate-800 flex flex-col antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
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
