export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role?: string;
  isGuest?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ExamAttempt {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  difficulty: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  details?: {
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface SavedNote {
  id: string;
  userId: string;
  title: string;
  topic: string;
  noteType: string;
  content: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'studymind_current_user',
  ALL_USERS: 'studymind_registered_users',
  CONVERSATIONS_PREFIX: 'studymind_chats_',
  EXAMS_PREFIX: 'studymind_exams_',
  NOTES_PREFIX: 'studymind_notes_',
};

export const DEFAULT_USER: UserProfile = {
  id: 'user_mounika_101',
  email: 'mounika@studymind.ai',
  displayName: 'Mounika Reddy',
  role: 'Student / Scholar',
  isGuest: false,
};

export const StorageService = {
  getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    this.setCurrentUser(DEFAULT_USER);
    return DEFAULT_USER;
  },

  setCurrentUser(user: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  },

  logoutUser() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.warn(e);
    }
  },

  getConversations(userId: string): Conversation[] {
    try {
      const key = `${STORAGE_KEYS.CONVERSATIONS_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const list: Conversation[] = JSON.parse(data);
        return list.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    }
    return [];
  },

  saveConversation(userId: string, conversation: Conversation) {
    try {
      const convs = this.getConversations(userId);
      const index = convs.findIndex((c) => c.id === conversation.id);
      if (index >= 0) {
        convs[index] = { ...conversation, updatedAt: new Date().toISOString() };
      } else {
        convs.unshift({ ...conversation, updatedAt: new Date().toISOString() });
      }
      const key = `${STORAGE_KEYS.CONVERSATIONS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(convs));
    } catch (e) {
      console.warn('Failed to save conversation:', e);
    }
  },

  deleteConversation(userId: string, conversationId: string) {
    try {
      const convs = this.getConversations(userId).filter((c) => c.id !== conversationId);
      const key = `${STORAGE_KEYS.CONVERSATIONS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(convs));
    } catch (e) {
      console.warn('Failed to delete conversation:', e);
    }
  },

  renameConversation(userId: string, conversationId: string, newTitle: string) {
    try {
      const convs = this.getConversations(userId);
      const target = convs.find((c) => c.id === conversationId);
      if (target) {
        target.title = newTitle;
        target.updatedAt = new Date().toISOString();
        const key = `${STORAGE_KEYS.CONVERSATIONS_PREFIX}${userId}`;
        localStorage.setItem(key, JSON.stringify(convs));
      }
    } catch (e) {
      console.warn('Failed to rename conversation:', e);
    }
  },

  getExamAttempts(userId: string): ExamAttempt[] {
    try {
      const key = `${STORAGE_KEYS.EXAMS_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const list: ExamAttempt[] = JSON.parse(data);
        return list.sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      }
    } catch (e) {
      console.warn('Failed to read exam attempts:', e);
    }
    return [];
  },

  saveExamAttempt(userId: string, attempt: ExamAttempt) {
    try {
      const attempts = this.getExamAttempts(userId);
      attempts.unshift(attempt);
      const key = `${STORAGE_KEYS.EXAMS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(attempts.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save exam attempt:', e);
    }
  },

  getSavedNotes(userId: string): SavedNote[] {
    try {
      const key = `${STORAGE_KEYS.NOTES_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const list: SavedNote[] = JSON.parse(data);
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    } catch (e) {
      console.warn('Failed to read saved notes:', e);
    }
    return [];
  },

  saveNote(userId: string, note: SavedNote) {
    try {
      const notes = this.getSavedNotes(userId);
      notes.unshift(note);
      const key = `${STORAGE_KEYS.NOTES_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save note:', e);
    }
  },

  deleteNote(userId: string, noteId: string) {
    try {
      const notes = this.getSavedNotes(userId).filter((n) => n.id !== noteId);
      const key = `${STORAGE_KEYS.NOTES_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to delete note:', e);
    }
  },
};
