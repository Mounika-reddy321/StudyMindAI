import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Headphones,
  Search,
  Filter,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookMarked,
  Sparkles,
  Share2,
  Check,
  Languages,
  Clock,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { Story, STORIES, CATEGORIES } from '../data/stories';
import { ClassicBook, CLASSIC_BOOKS } from '../data/classicBooks';

export const AudioBookLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stories' | 'classics'>('stories');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Audio Speech Synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copiedLink, setCopiedLink] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cancel speech on unmount or story change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeStory]);

  const handleOpenStory = (story: Story) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setActiveStory(story);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseStory = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setActiveStory(null);
  };

  const handlePlayAudio = () => {
    if (!activeStory || !('speechSynthesis' in window)) return;

    if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPausedAudio(false);
      setIsPlayingAudio(true);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare story text for speech synthesis
    const fullSpeechText = `${activeStory.title}. Category: ${activeStory.category}. ${activeStory.content}. Moral takeaway: ${activeStory.moral || ''}`;

    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Detect language code
    if (activeStory.language === 'Telugu') {
      utterance.lang = 'te-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseAudio = () => {
    if ('speechSynthesis' in window && isPlayingAudio) {
      window.speechSynthesis.pause();
      setIsPausedAudio(true);
      setIsPlayingAudio(false);
    }
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    }
  };

  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlayingAudio && activeStory) {
      handleStopAudio();
      setTimeout(() => handlePlayAudio(), 100);
    }
  };

  const handlePrevStory = () => {
    if (!activeStory) return;
    const currentIndex = STORIES.findIndex((s) => s.id === activeStory.id);
    if (currentIndex > 0) {
      handleOpenStory(STORIES[currentIndex - 1]);
    }
  };

  const handleNextStory = () => {
    if (!activeStory) return;
    const currentIndex = STORIES.findIndex((s) => s.id === activeStory.id);
    if (currentIndex < STORIES.length - 1) {
      handleOpenStory(STORIES[currentIndex + 1]);
    }
  };

  const handleShareStory = () => {
    if (!activeStory) return;
    navigator.clipboard.writeText(
      `Read "${activeStory.title}" on StudyMind AI Audio Book Library!`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filtered stories
  const filteredStories = STORIES.filter((story) => {
    const matchesCategory =
      selectedCategory === 'All' || story.category === selectedCategory;
    const matchesLanguage =
      selectedLanguage === 'All' || story.language === selectedLanguage;
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.id.toString() === searchQuery.trim();

    return matchesCategory && matchesLanguage && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Detail Story Reader View */}
      {activeStory ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100/90 shadow-sm space-y-8 animate-fadeIn">
          {/* Reader Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-purple-100">
            <button
              onClick={handleCloseStory}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Library Catalog</span>
            </button>

            {/* Audio Controls Bar */}
            <div className="flex items-center gap-2 sm:gap-3 bg-purple-50/80 p-1.5 rounded-2xl border border-purple-100">
              {!isPlayingAudio ? (
                <button
                  onClick={handlePlayAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPausedAudio ? 'Resume' : 'Listen'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              {(isPlayingAudio || isPausedAudio) && (
                <button
                  onClick={handleStopAudio}
                  title="Stop Audio"
                  className="p-1.5 rounded-xl hover:bg-purple-100 text-slate-600 transition-colors"
                >
                  <Square className="w-4 h-4 fill-current text-rose-500" />
                </button>
              )}

              {/* Speed selector */}
              <div className="flex items-center text-[11px] font-bold text-slate-600 px-2 gap-1 border-l border-purple-200">
                {[0.9, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleChangeSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded-md ${
                      playbackSpeed === spd
                        ? 'bg-purple-600 text-white'
                        : 'hover:text-purple-700'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Text Size Control */}
              <div className="flex items-center gap-1 border-l border-purple-200 pl-2">
                <button
                  onClick={() => setTextSize('sm')}
                  title="Small text"
                  className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    textSize === 'sm' ? 'bg-purple-200 text-purple-900' : 'text-slate-500'
                  }`}
                >
                  A-
                </button>
                <button
                  onClick={() => setTextSize('base')}
                  title="Medium text"
                  className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    textSize === 'base' ? 'bg-purple-200 text-purple-900' : 'text-slate-500'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setTextSize('lg')}
                  title="Large text"
                  className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    textSize === 'lg' ? 'bg-purple-200 text-purple-900' : 'text-slate-500'
                  }`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Share / Copy button */}
            <button
              onClick={handleShareStory}
              className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              title="Share Story"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Story Metadata Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                Story #{activeStory.id}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                {activeStory.category}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center gap-1">
                <Languages className="w-3 h-3" />
                {activeStory.language}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeStory.readingTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {activeStory.title}
            </h2>

            <p className="text-sm text-slate-600 italic bg-purple-50/50 p-3 rounded-xl border border-purple-100">
              "{activeStory.shortDescription}"
            </p>
          </div>

          {/* Story Full Content Body */}
          <div
            className={`text-slate-800 leading-relaxed font-normal whitespace-pre-line space-y-4 ${
              textSize === 'sm' ? 'text-sm' : textSize === 'lg' ? 'text-lg leading-loose' : 'text-base'
            }`}
          >
            {activeStory.content}
          </div>

          {/* Moral or Takeaway Card */}
          {activeStory.moral && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Life Lesson / Takeaway</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {activeStory.moral}
              </p>
            </div>
          )}

          {/* Bottom Next / Prev Story Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-purple-100">
            <button
              onClick={handlePrevStory}
              disabled={activeStory.id === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStory.id === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-purple-700 hover:bg-purple-50 border border-purple-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Story</span>
            </button>

            <button
              onClick={handleNextStory}
              disabled={activeStory.id === STORIES.length}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStory.id === STORIES.length
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
              }`}
            >
              <span>Next Story</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Catalog Catalog Grid View */
        <>
          {/* Section Switcher Tabs: 100 Stories vs Classic Books */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
            <div className="flex items-center bg-purple-50/80 p-1 rounded-xl border border-purple-100">
              <button
                onClick={() => setActiveTab('stories')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  activeTab === 'stories'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>100 Original Mini-Stories</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  100
                </span>
              </button>

              <button
                onClick={() => setActiveTab('classics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  activeTab === 'classics'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Public Domain Classics</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  9 Titles
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {activeTab === 'stories'
                ? `Displaying ${filteredStories.length} of 100 complete original stories`
                : 'Free public domain masterpieces via Project Gutenberg'}
            </div>
          </div>

          {activeTab === 'stories' ? (
            <>
              {/* Category & Search Filter Bar */}
              <div className="bg-white p-5 rounded-2xl border border-purple-100/90 shadow-sm space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by story number (#1–100), title, character, or theme..."
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-400/30 text-slate-800 font-medium"
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

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-purple-50/70 hover:bg-purple-100 text-slate-600 hover:text-purple-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Language Filter */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">Language:</span>
                  {(['All', 'English', 'Telugu', 'Telugu + English'] as const).map(
                    (lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                          selectedLanguage === lang
                            ? 'bg-purple-100 text-purple-800'
                            : 'text-slate-500 hover:text-purple-600'
                        }`}
                      >
                        {lang}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Story Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredStories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-white rounded-2xl p-5 border border-purple-100/80 hover:border-purple-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                          #{story.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {story.language}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {story.readingTime}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 mb-1">
                        {story.title}
                      </h3>

                      <p className="text-[11px] font-semibold text-purple-600/80 mb-2">
                        {story.category}
                      </p>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 font-normal">
                        {story.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenStory(story)}
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Story</span>
                      </button>

                      <button
                        onClick={() => {
                          handleOpenStory(story);
                          setTimeout(() => handlePlayAudio(), 300);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all shadow-2xs"
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Classic Books View */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                <BookMarked className="w-5 h-5 text-amber-600 shrink-0" />
                <p>
                  <strong>Public-Domain Classic Masterpieces:</strong> These world-renowned literary works are legally in the public domain. You can read excerpts here and access the complete original unabridged texts legally via Project Gutenberg.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CLASSIC_BOOKS.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Book Header Spine */}
                      <div className={`p-4 bg-gradient-to-r ${book.coverColor} text-white`}>
                        <div className="flex items-center justify-between text-[11px] opacity-90 mb-1">
                          <span>{book.year}</span>
                          <span className="font-semibold">{book.readingLevel}</span>
                        </div>
                        <h3 className="text-lg font-extrabold tracking-tight">
                          {book.title}
                        </h3>
                        <p className="text-xs font-medium opacity-90 mt-0.5">
                          by {book.author}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {book.description}
                        </p>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic">
                          "{book.sampleChapterExcerpt}"
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {book.keyThemes.map((theme, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <a
                        href={book.gutenbergUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Read Full Text (Project Gutenberg)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
