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
      setGenerationError(err.message || 'An error occurred while generating questions.');
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Interactive Exam Simulator
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Generate real multiple-choice exam sessions powered by Gemini with custom difficulty and instant performance analytics.
              </p>
            </div>

            {/* Config Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Computer Science, Indian Polity, Physics..."
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Specific Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Binary Search Trees, Preamble & Articles, Thermodynamics..."
                  className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30"
                >
                  <option value="Easy">Easy (Conceptual & Fundamentals)</option>
                  <option value="Medium">Medium (Application & Standard Exam)</option>
                  <option value="Hard">Hard (Deep Reasoning & Advanced)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30"
                >
                  <option value={5}>5 Questions (Quick Test)</option>
                  <option value={10}>10 Questions (Standard Quiz)</option>
                  <option value={15}>15 Questions (Mastery Drill)</option>
                </select>
              </div>
            </div>

            {/* Error notice */}
            {generationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={handleStartExam}
                disabled={isGenerating || !subject.trim() || !topic.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                  isGenerating || !subject.trim() || !topic.trim()
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Exam with Gemini...' : 'Start Exam Simulator'}</span>
              </button>
            </div>
          </div>

          {/* Past Exam History */}
          {attempts.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Your Test History ({attempts.length})</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {attempts.slice(0, 5).map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <span>{att.subject}:</span>
                        <span className="text-purple-700 font-semibold">{att.topic}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                          {att.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(att.completedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-purple-700">
                        {att.score} / {att.total} ({att.percentage}%)
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          {/* Test Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase">
                <span>{subject}</span>
                <span>•</span>
                <span>{difficulty} Difficulty</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {topic}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-mono text-xs font-bold border border-purple-100">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(secondsElapsed)}</span>
              </div>

              <div className="text-xs font-bold text-slate-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>

          {!examFinished ? (
            /* Active Interactive Question View */
            <div className="space-y-6">
              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <p className="text-base font-bold text-slate-900 leading-relaxed">
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
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-600/20'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
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
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentQuestionIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-purple-700 hover:bg-purple-50 border border-purple-200'
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
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExam}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-sm"
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
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-purple-600/20">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-2xl">
                        <Award className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold">
                          Exam Completed!
                        </h3>
                        <p className="text-xs text-purple-100 mt-0.5">
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
                <h3 className="text-sm font-extrabold text-slate-900">
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
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      } space-y-3`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900">
                          {idx + 1}. {q.question}
                        </p>
                        {isCorrect ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            Correct
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-700 shrink-0">
                            <XCircle className="w-4 h-4" />
                            Incorrect
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isOptionCorrect = optIdx === q.correctIndex;
                          const wasChosen = chosen === optIdx;

                          let bg = 'bg-white text-slate-700 border-slate-200';
                          if (isOptionCorrect) {
                            bg = 'bg-emerald-100 text-emerald-900 font-bold border-emerald-300';
                          } else if (wasChosen && !isOptionCorrect) {
                            bg = 'bg-rose-100 text-rose-900 font-bold border-rose-300 line-through';
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
                                <span className="text-[10px] font-bold text-emerald-800 uppercase">
                                  Correct Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs text-slate-600 leading-relaxed">
                        <strong className="text-purple-700">Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleExitExam}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  Configure New Topic
                </button>
                <button
                  onClick={handleRetakeExam}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
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
