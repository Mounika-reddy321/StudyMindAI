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

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setMicError(null);

    const userMessage: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    // Save user message immediately to storage
    const convId = currentConversationId || 'conv_' + Date.now();
    if (!currentConversationId) {
      setCurrentConversationId(convId);
    }

    const title = messages.length === 0 ? text.slice(0, 42) : undefined;
    saveCurrentConversation(convId, newMessages, title);

    try {
      // Send conversation history to server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          languageMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate study answer.');
      }

      const assistantMessage: ChatMessage = {
        id: 'msg_a_' + Date.now(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveCurrentConversation(convId, finalMessages, title);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;
    const lastUserPrompt = messages[actualIndex].content;
    const truncated = messages.slice(0, actualIndex + 1);
    setMessages(truncated);
    handleSendMessage(lastUserPrompt);
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
      {/* Assistant Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100/90 shadow-xs mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Brand and Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AI Study Assistant
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Gemini 3.8 Flash Connected</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ask anything. Learn at your own pace.
            </p>
          </div>
        </div>

        {/* Right Side: Clean Organized Control Bar */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5">
          {/* Segmented Language Selector */}
          <div className="inline-flex items-center bg-purple-50/70 p-1 rounded-xl border border-purple-100 text-xs">
            <Languages className="w-3.5 h-3.5 text-purple-600 mx-1.5 shrink-0" />
            <div className="flex items-center gap-0.5">
              {(
                [
                  { id: 'Simple English', label: 'English' },
                  { id: 'Telugu', label: 'తెలుగు' },
                  { id: 'Telugu + English', label: 'Telugu + Eng' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLanguageMode(item.id)}
                  title={`Switch language mode to ${item.id}`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    languageMode === item.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-purple-100/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Chat History & New Chat */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHistory}
              title="View all saved conversations"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-purple-200/80 text-xs font-bold shadow-2xs transition-all active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>History</span>
            </button>

            <button
              onClick={handleStartNewChat}
              title="Start a fresh chat conversation"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-purple-600/20 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mic error notice */}
      {micError && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{micError}</span>
          </div>
          <button
            onClick={() => setMicError(null)}
            className="text-amber-700 hover:text-amber-900 font-bold px-2"
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              What would you like to master today?
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 mb-8">
              StudyMind AI provides personalized explanations, code examples, homework assistance, and conceptual deep-dives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
              {samplePrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-2xl bg-white hover:bg-purple-50/60 border border-purple-100 hover:border-purple-300 text-slate-700 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 group-hover:text-purple-900 leading-relaxed">
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
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs text-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-purple-100/90 rounded-tl-none prose-chat'
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
                        ? 'border-purple-400/40 text-purple-100 text-[11px]'
                        : 'border-slate-100 text-slate-400 text-[11px]'
                    }`}
                  >
                    <span>{message.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-2">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          title="Copy Answer"
                          className="hover:text-purple-600 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Copied</span>
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
                          className={`hover:text-purple-600 flex items-center gap-1 transition-colors ${
                            speakingMessageId === message.id ? 'text-purple-600 font-bold' : ''
                          }`}
                        >
                          {speakingMessageId === message.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 animate-pulse text-purple-600" />
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
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
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
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                StudyMind AI is synthesizing your study answer...
              </span>
            </div>
          </div>
        )}

        {/* Error notification with retry */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleRegenerate()}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl p-3 border border-purple-100/90 shadow-sm">
        <div className="relative flex items-end gap-2">
          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Speak your question'}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Regenerate shortcut if messages exist */}
          {messages.length > 0 && !isLoading && (
            <button
              onClick={handleRegenerate}
              title="Regenerate last response"
              className="p-2.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
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
            className="flex-1 max-h-32 min-h-[2.5rem] py-2 px-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden resize-none font-medium"
          />

          {/* Send Button */}
          <button
            disabled={!inputPrompt.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className={`p-2.5 rounded-xl transition-all shadow-xs ${
              inputPrompt.trim() && !isLoading
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span>Mode:</span>
            <span className="font-semibold text-purple-600">{languageMode}</span>
          </div>
          <span>Shift + Enter for new line • Enter to send</span>
        </div>
      </div>
    </div>
  );
};
