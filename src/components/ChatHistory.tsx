import React, { useState, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  Conversation,
  StorageService,
  UserProfile,
} from '../services/storage';

interface ChatHistoryProps {
  currentUser: UserProfile;
  onSelectConversation: (id: string) => void;
  onStartNewChat: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  currentUser,
  onSelectConversation,
  onStartNewChat,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [currentUser.id]);

  const loadConversations = () => {
    const list = StorageService.getConversations(currentUser.id);
    setConversations(list);
  };

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitleInput(conv.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitleInput.trim()) {
      StorageService.renameConversation(currentUser.id, id, editTitleInput.trim());
      setEditingId(null);
      loadConversations();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      StorageService.deleteConversation(currentUser.id, deleteConfirmId);
      setDeleteConfirmId(null);
      loadConversations();
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchTitle = c.title.toLowerCase().includes(q);
    const matchContent = c.messages.some((m) => m.content.toLowerCase().includes(q));
    return matchTitle || matchContent;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0c1829] p-5 rounded-2xl border border-sky-100/90 dark:border-sky-950/80 shadow-sm transition-colors">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>Saved Conversations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {conversations.length} total learning {conversations.length === 1 ? 'session' : 'sessions'} saved for {currentUser.displayName}
          </p>
        </div>

        <button
          onClick={onStartNewChat}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-blue-950/20 dark:shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-sky-400 dark:text-white" />
          <span>Start New Chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by topic, question, or keyword in chat history..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0c1829] rounded-xl border border-sky-100 dark:border-sky-950/80 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30 text-slate-800 dark:text-slate-100 shadow-2xs font-medium transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="bg-white dark:bg-[#0c1829] rounded-2xl p-10 text-center border border-sky-100 dark:border-sky-950/80 shadow-sm transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-[#081220] text-blue-950 dark:text-sky-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {searchQuery ? 'No matching conversations found' : 'No chat history yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? 'Try searching with different keywords or clear your query.'
              : 'Start a session with your AI Study Assistant. All your questions and answers will be saved right here.'}
          </p>
          <button
            onClick={onStartNewChat}
            className="px-4 py-2 rounded-xl bg-blue-950 dark:bg-sky-600 text-white text-xs font-bold shadow-xs hover:bg-sky-600 dark:hover:bg-sky-500 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 dark:text-white" />
            <span>Ask Your First Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => {
            const firstSnippet = conv.messages[0]?.content || 'Empty conversation';
            const messageCount = conv.messages.length;
            const updatedDate = new Date(conv.updatedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const updatedTime = new Date(conv.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className="group bg-white dark:bg-[#0c1829] hover:bg-sky-50/40 dark:hover:bg-sky-950/30 rounded-2xl p-4 sm:p-5 border border-sky-100/90 dark:border-sky-950/80 hover:border-sky-300 dark:hover:border-sky-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <form
                      onSubmit={(e) => handleSaveRename(conv.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-400"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-blue-950 dark:bg-sky-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-950 dark:group-hover:text-sky-300 truncate">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-normal">
                        {firstSnippet}
                      </p>
                    </>
                  )}

                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {updatedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {updatedTime}
                    </span>
                    <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full font-semibold">
                      {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={(e) => handleStartRename(conv, e)}
                    title="Rename Conversation"
                    className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-sky-200 dark:hover:border-sky-800 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    title="Delete Conversation"
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-[#081220] text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:bg-blue-950 group-hover:text-white dark:group-hover:bg-sky-600 dark:group-hover:text-white transition-all ml-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#0c1829] rounded-2xl max-w-sm w-full p-6 shadow-xl border border-sky-100 dark:border-sky-950/80">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Delete this conversation?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              This action cannot be undone. All messages and notes in this chat session will be permanently erased.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
