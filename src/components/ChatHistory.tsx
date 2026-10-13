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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-purple-100/90 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>Saved Conversations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {conversations.length} total learning {conversations.length === 1 ? 'session' : 'sessions'} saved for {currentUser.displayName}
          </p>
        </div>

        <button
          onClick={onStartNewChat}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by topic, question, or keyword in chat history..."
          className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-purple-100 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30 text-slate-800 shadow-2xs font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-purple-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'No matching conversations found' : 'No chat history yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {searchQuery
              ? 'Try searching with different keywords or clear your query.'
              : 'Start a session with your AI Study Assistant. All your questions and answers will be saved right here.'}
          </p>
          <button
            onClick={onStartNewChat}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
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
                className="group bg-white hover:bg-purple-50/40 rounded-2xl p-4 sm:p-5 border border-purple-100/90 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                        className="flex-1 px-3 py-1.5 rounded-lg border border-purple-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-900 truncate">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                        {firstSnippet}
                      </p>
                    </>
                  )}

                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {updatedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {updatedTime}
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                      {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={(e) => handleStartRename(conv, e)}
                    title="Rename Conversation"
                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-white rounded-xl border border-transparent hover:border-purple-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    title="Delete Conversation"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl border border-transparent hover:border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all ml-1">
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-purple-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Delete this conversation?
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              This action cannot be undone. All messages and notes in this chat session will be permanently erased.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition-all"
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
