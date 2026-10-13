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
        <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-6 sm:p-10 border border-sky-100/90 dark:border-sky-950/80 shadow-sm space-y-8 animate-fadeIn transition-colors">
          {/* Reader Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-sky-100 dark:border-sky-950/80">
            <button
              onClick={handleCloseStory}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-[#081220] hover:bg-sky-100 dark:hover:bg-sky-950 text-blue-950 dark:text-sky-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Library Catalog</span>
            </button>

            {/* Audio Controls Bar */}
            <div className="flex items-center gap-2 sm:gap-3 bg-sky-50/80 dark:bg-[#081220] p-1.5 rounded-2xl border border-sky-100 dark:border-sky-950">
              {!isPlayingAudio ? (
                <button
                  onClick={handlePlayAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-blue-900 dark:hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-sky-400 dark:text-white" />
                  <span>{isPausedAudio ? 'Resume' : 'Listen'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseAudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              {(isPlayingAudio || isPausedAudio) && (
                <button
                  onClick={handleStopAudio}
                  title="Stop Audio"
                  className="p-1.5 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-950 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current text-rose-500" />
                </button>
              )}

              {/* Speed selector */}
              <div className="flex items-center text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 gap-1 border-l border-sky-200 dark:border-sky-900/60">
                {[0.9, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleChangeSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-blue-950 dark:bg-sky-600 text-white'
                        : 'hover:text-blue-950 dark:hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Text Size Control */}
              <div className="flex items-center gap-1 border-l border-sky-200 dark:border-sky-900/60 pl-2">
                <button
                  onClick={() => setTextSize('sm')}
                  title="Small text"
                  className={`px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                    textSize === 'sm'
                      ? 'bg-sky-200 dark:bg-sky-700 text-blue-950 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  A-
                </button>
                <button
                  onClick={() => setTextSize('base')}
                  title="Medium text"
                  className={`px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                    textSize === 'base'
                      ? 'bg-sky-200 dark:bg-sky-700 text-blue-950 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setTextSize('lg')}
                  title="Large text"
                  className={`px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                    textSize === 'lg'
                      ? 'bg-sky-200 dark:bg-sky-700 text-blue-950 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Share / Copy button */}
            <button
              onClick={handleShareStory}
              className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors cursor-pointer"
              title="Share Story"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Story Metadata Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 font-bold text-xs border border-sky-200/50 dark:border-sky-900/50">
                Story #{activeStory.id}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                {activeStory.category}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-900/50">
                <Languages className="w-3 h-3" />
                {activeStory.language}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeStory.readingTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {activeStory.title}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-sky-50/50 dark:bg-[#081220]/60 p-3 rounded-xl border border-sky-100 dark:border-sky-950/80">
              "{activeStory.shortDescription}"
            </p>
          </div>

          {/* Story Full Content Body */}
          <div
            className={`text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line space-y-4 ${
              textSize === 'sm' ? 'text-sm' : textSize === 'lg' ? 'text-lg leading-loose' : 'text-base'
            }`}
          >
            {activeStory.content}
          </div>

          {/* Moral or Takeaway Card */}
          {activeStory.moral && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-white dark:from-[#0c1829] dark:via-[#081220] dark:to-[#0c1829] border border-sky-200 dark:border-sky-950/80">
              <div className="flex items-center gap-2 text-blue-950 dark:text-sky-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Life Lesson / Takeaway</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {activeStory.moral}
              </p>
            </div>
          )}

          {/* Bottom Next / Prev Story Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-sky-100 dark:border-sky-950/80">
            <button
              onClick={handlePrevStory}
              disabled={activeStory.id === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStory.id === 1
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-blue-950 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-sky-200 dark:border-sky-900/60'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Story</span>
            </button>

            <button
              onClick={handleNextStory}
              disabled={activeStory.id === STORIES.length}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStory.id === STORIES.length
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white shadow-xs'
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
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-[#0c1829] p-4 rounded-2xl border border-sky-100 dark:border-sky-950/80 shadow-sm transition-colors">
            <div className="flex items-center bg-sky-50/80 dark:bg-[#081220] p-1 rounded-xl border border-sky-100 dark:border-sky-950">
              <button
                onClick={() => setActiveTab('stories')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'stories'
                    ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400 dark:text-white" />
                <span>100 Original Mini-Stories</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  100
                </span>
              </button>

              <button
                onClick={() => setActiveTab('classics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'classics'
                    ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-sky-400 dark:text-white" />
                <span>Public Domain Classics</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  9 Titles
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeTab === 'stories'
                ? `Displaying ${filteredStories.length} of 100 complete original stories`
                : 'Free public domain masterpieces via Project Gutenberg'}
            </div>
          </div>

          {activeTab === 'stories' ? (
            <>
              {/* Category & Search Filter Bar */}
              <div className="bg-white dark:bg-[#0c1829] p-5 rounded-2xl border border-sky-100/90 dark:border-sky-950/80 shadow-sm space-y-4 transition-colors">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by story number (#1–100), title, character, or theme..."
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-[#081220] rounded-xl border border-slate-200/80 dark:border-sky-950 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30 text-slate-800 dark:text-slate-100 font-medium transition-colors"
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

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-xs'
                          : 'bg-sky-50/70 dark:bg-[#081220] hover:bg-sky-100 dark:hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Language Filter */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Language:</span>
                  {(['All', 'English', 'Telugu', 'Telugu + English'] as const).map(
                    (lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          selectedLanguage === lang
                            ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white'
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
                    className="bg-white dark:bg-[#0c1829] rounded-2xl p-5 border border-sky-100/80 dark:border-sky-950/80 hover:border-sky-300 dark:hover:border-sky-800 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-xs font-extrabold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-[#081220] px-2 py-0.5 rounded-md border border-sky-200/40 dark:border-sky-900/40">
                          #{story.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {story.language}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {story.readingTime}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors line-clamp-1 mb-1">
                        {story.title}
                      </h3>

                      <p className="text-[11px] font-semibold text-sky-600/90 dark:text-sky-400 mb-2">
                        {story.category}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 font-normal">
                        {story.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenStory(story)}
                        className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400 hover:text-blue-950 dark:hover:text-sky-300 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Story</span>
                      </button>

                      <button
                        onClick={() => {
                          handleOpenStory(story);
                          setTimeout(() => handlePlayAudio(), 300);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-[#081220] hover:bg-sky-100 dark:hover:bg-sky-950 text-blue-950 dark:text-sky-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <Headphones className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
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
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
                <BookMarked className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p>
                  <strong>Public-Domain Classic Masterpieces:</strong> These world-renowned literary works are legally in the public domain. You can read excerpts here and access the complete original unabridged texts legally via Project Gutenberg.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CLASSIC_BOOKS.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white dark:bg-[#0c1829] rounded-2xl overflow-hidden border border-sky-100 dark:border-sky-950/80 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
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
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                          {book.description}
                        </p>

                        <div className="p-3 bg-slate-50 dark:bg-[#081220] rounded-xl border border-slate-100 dark:border-sky-950 text-[11px] text-slate-600 dark:text-slate-400 italic">
                          "{book.sampleChapterExcerpt}"
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {book.keyThemes.map((theme, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-[#081220] text-blue-950 dark:text-sky-300 border border-sky-200/40 dark:border-sky-900/40"
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Read Full Text (Project Gutenberg)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400 dark:text-white" />
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
