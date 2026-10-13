import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  History,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Languages,
  BookOpen,
  Code,
  Brain,
  Lightbulb,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ChatMessage,
  Conversation,
  StorageService,
  UserProfile,
} from '../services/storage';

interface AIAssistantProps {
  currentUser: UserProfile;
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  onNavigateHistory: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  currentUser,
  currentConversationId,
  setCurrentConversationId,
  onNavigateHistory,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [languageMode, setLanguageMode] = useState<'Simple English' | 'Telugu' | 'Telugu + English'>('Simple English');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Load conversation when currentConversationId changes
  useEffect(() => {
    if (currentConversationId) {
      const convs = StorageService.getConversations(currentUser.id);
      const active = convs.find((c) => c.id === currentConversationId);
      if (active) {
        setMessages(active.messages);
      }
    } else {
      // Create new fresh conversation ID
      const newId = 'conv_' + Date.now();
      setCurrentConversationId(newId);
      setMessages([]);
    }
  }, [currentConversationId, currentUser.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech Synthesis cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStartNewChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    const newId = 'conv_' + Date.now();
    setCurrentConversationId(newId);
    setMessages([]);
    setInputPrompt('');
    setErrorMessage(null);
  };

  const formatCleanError = (rawError: any): string => {
    if (!rawError) return 'An unexpected error occurred. Please try again.';
    let errStr = typeof rawError === 'string' ? rawError : rawError.message || String(rawError);
    try {
      if (errStr.trim().startsWith('{')) {
        const parsed = JSON.parse(errStr.trim());
        if (parsed?.error?.message) return parsed.error.message;
        if (parsed?.error && typeof parsed.error === 'string') return parsed.error;
        if (parsed?.message) return parsed.message;
      }
    } catch {
      // not JSON
    }

    if (
      errStr.includes('503') ||
      errStr.includes('high demand') ||
      errStr.includes('UNAVAILABLE') ||
      errStr.includes('Spikes in demand') ||
      errStr.includes('spikes in demand')
    ) {
      return 'Google Gemini AI servers are currently experiencing temporary high traffic. StudyMind AI automatically tried backup connections. Please click "Retry Question" below in a moment.';
    }

    return errStr;
  };

  const sendChatRequest = async (messagesToSend: ChatMessage[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    setMicError(null);

    const convId = currentConversationId || 'conv_' + Date.now();
    if (!currentConversationId) {
      setCurrentConversationId(convId);
    }

    const title = messagesToSend[0]?.content.slice(0, 42);
    saveCurrentConversation(convId, messagesToSend, title);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend.map((m) => ({ role: m.role, content: m.content })),
          languageMode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate study answer.');
      }

      const assistantMessage: ChatMessage = {
        id: 'msg_a_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'I could not generate an answer at this time. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...messagesToSend, assistantMessage];
      setMessages(finalMessages);
      saveCurrentConversation(convId, finalMessages, title);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(formatCleanError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    sendChatRequest(newMessages);
  };

  const saveCurrentConversation = (id: string, updatedMessages: ChatMessage[], newTitle?: string) => {
    const existing = StorageService.getConversations(currentUser.id).find((c) => c.id === id);
    const title = newTitle || existing?.title || updatedMessages[0]?.content.slice(0, 40) || 'New Study Session';

    const conv: Conversation = {
      id,
      userId: currentUser.id,
      title,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    };

    StorageService.saveConversation(currentUser.id, conv);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    if (messages.length === 0 || isLoading) return;
    // Find the last user message index
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;
    const targetMessages = messages.slice(0, lastUserIndex + 1);
    setMessages(targetMessages);
    sendChatRequest(targetMessages);
  };

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) {
      setErrorMessage('Speech synthesis is not supported on this browser.');
      return;
    }

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(id);

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*#_~`>]/g, '')
      .slice(0, 1500);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Detect language
    if (languageMode === 'Telugu') {
      utterance.lang = 'te-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setMicError(null);
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = languageMode === 'Telugu' ? 'te-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError('Microphone permission was denied. Please allow microphone access in your browser settings to dictate notes.');
        } else {
          setMicError(`Voice error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setMicError('Could not initialize microphone: ' + e.message);
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const samplePrompts = [
    {
      icon: Lightbulb,
      category: 'Science',
      prompt: 'Explain Photosynthesis and Cellular Respiration with clear step-by-step analogies.',
    },
    {
      icon: Code,
      category: 'Programming',
      prompt: 'Write a Python implementation of Binary Search with time complexity explanation.',
    },
    {
      icon: Brain,
      category: 'Mathematics',
      prompt: 'Help me understand the Pythagorean theorem and where it is applied in navigation.',
    },
    {
      icon: Languages,
      category: 'Telugu Study',
      prompt: 'భారత రాజ్యాంగం ప్రాథమిక హక్కులను సరళమైన తెలుగులో వివరించండి.',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-5xl mx-auto px-3 sm:px-6 py-4">
      {/* Assistant Header Card with Organized Controls */}
      <div className="bg-white dark:bg-[#0c1829] rounded-2xl p-4 sm:p-5 border border-sky-100 dark:border-sky-950/80 shadow-xs mb-4 flex flex-col gap-3.5 transition-colors">
        {/* Row 1: Title and Primary Chat Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100/80 dark:border-sky-950/60">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 dark:bg-sky-600 text-white flex items-center justify-center shadow-md shadow-blue-950/20 dark:shadow-sky-600/20 shrink-0">
              <Sparkles className="w-5 h-5 text-sky-400 dark:text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-blue-950 dark:text-white tracking-tight">
                AI Study Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Ask anything. Learn at your own pace.
              </p>
            </div>
          </div>

          {/* Primary Action Buttons: Neatly Organized History & New Chat */}
          <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
            <button
              onClick={onNavigateHistory}
              title="View all saved conversations"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0a1526] hover:bg-sky-50 dark:hover:bg-sky-950/50 text-blue-950 dark:text-sky-300 hover:text-sky-600 dark:hover:text-sky-200 border border-sky-200 dark:border-sky-900/60 text-xs font-bold shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Chat history</span>
            </button>

            <button
              onClick={handleStartNewChat}
              title="Start a fresh chat conversation"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 active:scale-95 text-white text-xs font-bold shadow-sm shadow-blue-950/20 dark:shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ New chat</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status Indicator and Language Mode Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* AI Connection Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50/80 dark:bg-[#0a1526] border border-sky-100 dark:border-sky-950/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <span className="font-bold text-blue-950 dark:text-sky-400">Gemini 3.8 Flash Connected</span>
          </div>

          {/* Segmented Language Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1">
              <Languages className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Language:</span>
            </div>
            <div className="inline-flex items-center bg-slate-50 dark:bg-[#081220] p-1 rounded-xl border border-sky-100/90 dark:border-sky-950/80 text-xs">
              {(
                [
                  { id: 'Simple English', label: 'Simple English' },
                  { id: 'Telugu', label: 'తెలుగు' },
                  { id: 'Telugu + English', label: 'Telugu + English' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLanguageMode(item.id)}
                  title={`Switch response language mode to ${item.id}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    languageMode === item.id
                      ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white hover:bg-sky-100/60 dark:hover:bg-sky-950/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mic error notice */}
      {micError && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{micError}</span>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 font-bold px-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
        {messages.length === 0 ? (
          /* Empty State with Prompt Starters */
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-100 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-sky-200 dark:border-slate-700 flex items-center justify-center text-blue-950 dark:text-sky-400 shadow-xs mb-4">
              <Brain className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              What would you like to master today?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-8">
              StudyMind AI provides personalized explanations, code examples, homework assistance, and conceptual deep-dives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
              {samplePrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0c1829] hover:bg-sky-50/60 dark:hover:bg-sky-950/40 border border-sky-100 dark:border-sky-950/80 hover:border-sky-300 dark:hover:border-sky-800 text-slate-700 dark:text-slate-200 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-sky-100 dark:bg-sky-950 text-blue-950 dark:text-sky-300 flex items-center justify-center text-xs">
                        <Icon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-950 dark:group-hover:text-sky-300 leading-relaxed">
                      "{item.prompt}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-950 dark:bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-sky-400 dark:text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs text-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-950 to-sky-700 dark:from-sky-600 dark:to-blue-900 text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#0c1829] text-slate-800 dark:text-slate-100 border border-sky-100/90 dark:border-sky-950/80 rounded-tl-none prose-chat'
                  }`}
                >
                  {/* Bubble Content */}
                  <div className="whitespace-pre-wrap leading-relaxed font-normal">
                    {message.content}
                  </div>

                  {/* Bubble Meta & Actions */}
                  <div
                    className={`flex items-center justify-between gap-3 mt-2.5 pt-2 border-t ${
                      isUser
                        ? 'border-sky-400/40 text-sky-100 text-[11px]'
                        : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[11px]'
                    }`}
                  >
                    <span>{message.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          title="Copy Answer"
                          className="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {/* Read aloud button */}
                        <button
                          onClick={() => handleSpeak(message.content, message.id)}
                          title="Read Aloud"
                          className={`hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors cursor-pointer ${
                            speakingMessageId === message.id ? 'text-sky-600 dark:text-sky-400 font-bold' : ''
                          }`}
                        >
                          {speakingMessageId === message.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 animate-pulse text-sky-600 dark:text-sky-400" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/60 text-blue-950 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-950 dark:bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-sky-400 dark:text-white animate-spin" />
            </div>
            <div className="bg-white dark:bg-[#0c1829] rounded-2xl p-4 border border-sky-100 dark:border-sky-950/80 shadow-xs flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-950 dark:bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-sky-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                StudyMind AI is synthesizing your study answer...
              </span>
            </div>
          </div>
        )}

        {/* Error notification with friendly explanation and retry */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <p className="font-bold text-amber-900 dark:text-amber-300">Connection Notice</p>
                <p className="text-slate-700 dark:text-slate-300">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold cursor-pointer text-xs transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleRegenerate}
                className="px-3.5 py-1.5 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Question</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-[#0c1829] rounded-2xl p-3 border border-sky-100/90 dark:border-sky-950/80 shadow-sm transition-colors">
        <div className="relative flex items-end gap-2">
          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Speak your question'}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Regenerate shortcut if messages exist */}
          {messages.length > 0 && !isLoading && (
            <button
              onClick={handleRegenerate}
              title="Regenerate last response"
              className="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : languageMode === 'Telugu'
                ? 'మీ సందేహాన్ని ఇక్కడ టైప్ చేయండి... (Enter to send)'
                : 'Ask a question, paste code, or request an explanation... (Enter to send, Shift+Enter for new line)'
            }
            className="flex-1 max-h-32 min-h-[2.5rem] py-2 px-3 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden resize-none font-medium"
          />

          {/* Send Button */}
          <button
            disabled={!inputPrompt.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className={`p-2.5 rounded-xl transition-all shadow-xs cursor-pointer ${
              inputPrompt.trim() && !isLoading
                ? 'bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white shadow-blue-950/20 dark:shadow-sky-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span>Mode:</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">{languageMode}</span>
          </div>
          <span>Shift + Enter for new line • Enter to send</span>
        </div>
      </div>
    </div>
  );
};
