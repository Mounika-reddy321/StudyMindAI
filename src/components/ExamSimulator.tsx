import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  BookOpen,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  StorageService,
  ExamAttempt,
  UserProfile,
} from '../services/storage';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ExamSimulatorProps {
  currentUser: UserProfile;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({ currentUser }) => {
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Exam session states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [examActive, setExamActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [examFinished, setExamFinished] = useState(false);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  // Past Attempts
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() =>
    StorageService.getExamAttempts(currentUser.id)
  );

  useEffect(() => {
    if (examActive && !examFinished) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [examActive, examFinished]);

  const handleStartExam = async () => {
    if (!subject.trim() || !topic.trim()) {
      setGenerationError('Please provide both subject and topic.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setQuestions([]);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setExamFinished(false);
    setSecondsElapsed(0);

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          topic: topic.trim(),
          difficulty,
          questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate exam questions.');
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('Received empty question set from server.');
      }

      setQuestions(data.questions);
      setExamActive(true);
    } catch (err: any) {
      console.error('Exam error:', err);
      let cleanMsg = err.message || 'An error occurred while generating questions.';
      try {
        if (cleanMsg.trim().startsWith('{')) {
          const parsed = JSON.parse(cleanMsg.trim());
          if (parsed?.error?.message) cleanMsg = parsed.error.message;
          else if (parsed?.error) cleanMsg = parsed.error;
        }
      } catch {}
      if (cleanMsg.includes('503') || cleanMsg.includes('high demand') || cleanMsg.includes('UNAVAILABLE')) {
        cleanMsg = 'Google Gemini servers are temporarily experiencing high traffic. Please wait a moment and try clicking "Start Exam Simulator" again.';
      }
      setGenerationError(cleanMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (examFinished) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitExam = () => {
    setExamFinished(true);
    clearInterval(timerRef.current);

    // Calculate score
    let correctCount = 0;
    const details = questions.map((q, idx) => {
      const chosen = userAnswers[idx];
      const isCorrect = chosen === q.correctIndex;
      if (isCorrect) correctCount++;

      return {
        question: q.question,
        selectedAnswer: chosen !== undefined ? q.options[chosen] : 'Unanswered',
        correctAnswer: q.options[q.correctIndex],
        isCorrect,
      };
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    const attempt: ExamAttempt = {
      id: 'attempt_' + Date.now(),
      userId: currentUser.id,
      subject,
      topic,
      difficulty,
      score: correctCount,
      total: questions.length,
      percentage,
      completedAt: new Date().toISOString(),
      details,
    };

    StorageService.saveExamAttempt(currentUser.id, attempt);
    setAttempts(StorageService.getExamAttempts(currentUser.id));
  };

  const handleRetakeExam = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setExamFinished(false);
    setSecondsElapsed(0);
  };

  const handleExitExam = () => {
    setExamActive(false);
    setExamFinished(false);
    setQuestions([]);
    setUserAnswers({});
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {!examActive ? (
        /* Configuration View */
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-6 sm:p-8 border border-sky-100 dark:border-sky-950/80 shadow-sm space-y-6 transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-950 dark:bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-4 h-4 text-sky-400 dark:text-white" />
                </div>
                <h2 className="text-xl font-extrabold text-blue-950 dark:text-white tracking-tight">
                  Interactive Exam Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate real multiple-choice exam sessions powered by Gemini with custom difficulty and instant performance analytics.
              </p>
            </div>

            {/* Config Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Computer Science, Indian Polity, Physics..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#081220] rounded-xl border border-slate-200 dark:border-sky-950 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Specific Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Binary Search Trees, Preamble & Articles, Thermodynamics..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#081220] rounded-xl border border-slate-200 dark:border-sky-950 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#081220] rounded-xl border border-slate-200 dark:border-sky-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30"
                >
                  <option value="Easy">Easy (Conceptual & Fundamentals)</option>
                  <option value="Medium">Medium (Application & Standard Exam)</option>
                  <option value="Hard">Hard (Deep Reasoning & Advanced)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#081220] rounded-xl border border-slate-200 dark:border-sky-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30"
                >
                  <option value={5}>5 Questions (Quick Test)</option>
                  <option value={10}>10 Questions (Standard Quiz)</option>
                  <option value={15}>15 Questions (Mastery Drill)</option>
                </select>
              </div>
            </div>

            {/* Error notice */}
            {generationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={handleStartExam}
                disabled={isGenerating || !subject.trim() || !topic.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer ${
                  isGenerating || !subject.trim() || !topic.trim()
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white shadow-blue-950/20 dark:shadow-sky-600/20'
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-400 dark:text-white" />
                <span>{isGenerating ? 'Generating Exam with Gemini...' : 'Start Exam Simulator'}</span>
              </button>
            </div>
          </div>

          {/* Past Exam History */}
          {attempts.length > 0 && (
            <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-6 border border-sky-100 dark:border-sky-950/80 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-blue-950 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Your Test History ({attempts.length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {attempts.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-100 dark:border-sky-950 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                        <span>{att.subject}:</span>
                        <span className="text-sky-700 dark:text-sky-400 font-semibold">{att.topic}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {att.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(att.completedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-blue-950 dark:text-sky-300">
                        {att.score} / {att.total} ({att.percentage}%)
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {att.percentage >= 80 ? 'Mastered' : att.percentage >= 50 ? 'Passed' : 'Needs Review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Active Test or Review View */
        <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-6 sm:p-8 border border-sky-100 dark:border-sky-950/80 shadow-sm space-y-6 transition-colors">
          {/* Test Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sky-100 dark:border-sky-950/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-400 uppercase">
                <span>{subject}</span>
                <span>•</span>
                <span>{difficulty} Difficulty</span>
              </div>
              <h2 className="text-lg font-extrabold text-blue-950 dark:text-white tracking-tight">
                {topic}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-[#081220] text-sky-800 dark:text-sky-300 font-mono text-xs font-bold border border-sky-100 dark:border-sky-950">
                <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>{formatTime(secondsElapsed)}</span>
              </div>

              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>

          {!examFinished ? (
            /* Active Interactive Question View */
            <div className="space-y-6">
              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-[#081220] border border-sky-100 dark:border-sky-950">
                <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ?.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ?.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950 dark:bg-sky-600 text-white border-blue-950 dark:border-sky-500 shadow-sm shadow-blue-950/20 dark:shadow-sky-600/20'
                          : 'bg-white dark:bg-[#0c1829] hover:bg-sky-50/50 dark:hover:bg-sky-950/30 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-sky-950'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-sky-500 dark:bg-white dark:text-sky-900 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-semibold">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentQuestionIndex === 0
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      : 'text-blue-950 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-sky-200 dark:border-sky-900/60'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExam}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Exam</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Exam Results & Review View */
            <div className="space-y-6">
              {/* Score Banner */}
              {(() => {
                const total = questions.length;
                let score = 0;
                questions.forEach((q, i) => {
                  if (userAnswers[i] === q.correctIndex) score++;
                });
                const pct = Math.round((score / total) * 100);

                return (
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-sky-700 dark:from-slate-900 dark:via-sky-950 dark:to-blue-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-blue-950/20">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 text-sky-300 flex items-center justify-center font-extrabold text-2xl">
                        <Award className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          Exam Completed!
                        </h3>
                        <p className="text-xs text-sky-100 mt-0.5">
                          Completed in {formatTime(secondsElapsed)} with {score} of {total} correct answers.
                        </p>
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className="text-3xl font-extrabold">{pct}%</div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider inline-block mt-1">
                        {pct >= 80 ? 'Mastered' : pct >= 60 ? 'Good Effort' : 'Needs Practice'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Review Question by Question */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-blue-950 dark:text-white">
                  Comprehensive Question Analysis
                </h3>

                {questions.map((q, idx) => {
                  const chosen = userAnswers[idx];
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border ${
                        isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      } space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {idx + 1}. {q.question}
                        </p>
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            Correct
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 shrink-0">
                            <XCircle className="w-4 h-4" />
                            Incorrect
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isOptionCorrect = optIdx === q.correctIndex;
                          const wasChosen = chosen === optIdx;

                          let bg = 'bg-white dark:bg-[#0c1829] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-sky-950';
                          if (isOptionCorrect) {
                            bg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold border-emerald-300 dark:border-emerald-800';
                          } else if (wasChosen && !isOptionCorrect) {
                            bg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 font-bold border-rose-300 dark:border-rose-800 line-through';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${bg}`}
                            >
                              <span>
                                {String.fromCharCode(65 + optIdx)}. {opt}
                              </span>
                              {isOptionCorrect && (
                                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                                  Correct Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="p-3 bg-white dark:bg-[#0c1829] rounded-xl border border-sky-100 dark:border-sky-950/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong className="text-blue-950 dark:text-sky-300">Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleExitExam}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Configure New Topic
                </button>
                <button
                  onClick={handleRetakeExam}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake This Exam</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
