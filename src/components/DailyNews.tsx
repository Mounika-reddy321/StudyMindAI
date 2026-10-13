import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  RefreshCw,
  Search,
  ExternalLink,
  Globe,
  Clock,
  AlertCircle,
  Building2,
  Cpu,
  GraduationCap,
  Atom,
  MapPin,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { NEWSPAPERS, Newspaper as NewspaperItem } from '../data/newspapers';

interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
  category: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Headlines', icon: Globe },
  { id: 'india', label: 'India News', icon: Building2 },
  { id: 'ap-ts', label: 'AP & Telangana', icon: MapPin },
  { id: 'world', label: 'World News', icon: Globe },
  { id: 'technology', label: 'Technology & AI', icon: Cpu },
  { id: 'education', label: 'Education & Exams', icon: GraduationCap },
  { id: 'science', label: 'Science & Discovery', icon: Atom },
];

export const DailyNews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'directory'>('live');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const fetchNews = async (cat: string, forceRefresh = false) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const url = `/api/news?category=${cat}${forceRefresh ? '&refresh=true' : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news feed from RSS providers.');
      }

      setArticles(data.articles || []);
      setLastUpdated(data.lastUpdated);
    } catch (err: any) {
      console.error('News error:', err);
      setErrorMessage(
        err.message || 'Unable to connect to live RSS news servers at this time. Please check your internet connection.'
      );
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 60) {
        return `${Math.max(1, diffMins)}m ago`;
      }
      if (diffHrs < 24) {
        return `${diffHrs}h ago`;
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const filteredArticles = articles.filter((art) => {
    const q = searchQuery.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.snippet.toLowerCase().includes(q) ||
      art.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner Switcher */}
      <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-5 sm:p-6 border border-sky-100 dark:border-sky-950/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-950 dark:bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Newspaper className="w-4 h-4 text-sky-400 dark:text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-blue-950 dark:text-white tracking-tight">
              Daily News & Newspapers
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time verified RSS updates from leading news organizations and official digital newspaper portals.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-sky-50 dark:bg-[#081220] p-1 rounded-2xl border border-sky-100 dark:border-sky-950 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white'
            }`}
          >
            Live Headlines Feed
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white'
            }`}
          >
            Newspaper Directory (8)
          </button>
        </div>
      </div>

      {activeTab === 'live' ? (
        <div className="space-y-6">
          {/* Controls Bar: Category pills, Search, Refresh */}
          <div className="bg-white dark:bg-[#0c1829] p-5 rounded-2xl border border-sky-100 dark:border-sky-950/80 shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter headlines by keyword, state, topic..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#081220] rounded-xl border border-slate-200 dark:border-sky-950 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30 font-medium"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchNews(selectedCategory, true)}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 dark:bg-[#081220] hover:bg-sky-100 dark:hover:bg-sky-950 text-blue-950 dark:text-sky-300 text-xs font-bold transition-all border border-sky-200 dark:border-sky-900/60 shadow-2xs shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Feed</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950 dark:bg-sky-600 text-white shadow-xs'
                        : 'bg-sky-50/70 dark:bg-[#081220] hover:bg-sky-100 dark:hover:bg-sky-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-950 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {lastUpdated && (
              <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>
                  Last synced: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
                <span>Real RSS Verified Streams</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-12 text-center border border-sky-100 dark:border-sky-950/80 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-full border-3 border-sky-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Fetching live RSS dispatches...
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Querying verified news servers for {selectedCategory} headlines.
              </p>
            </div>
          ) : errorMessage ? (
            /* Error State without fake fallback headlines */
            <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-8 border border-rose-100 dark:border-rose-950/80 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Feed Temporarily Unavailable
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => fetchNews(selectedCategory, true)}
                className="px-5 py-2.5 rounded-xl bg-blue-950 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-[#0c1829] rounded-3xl p-10 text-center border border-sky-100 dark:border-sky-950/80 shadow-sm">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No headlines match your search filter.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Try a different keyword or clear your search input.
              </p>
            </div>
          ) : (
            /* Articles Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredArticles.map((art, idx) => (
                <div
                  key={art.id || idx}
                  className="bg-white dark:bg-[#0c1829] rounded-2xl p-5 border border-sky-100 dark:border-sky-950/80 hover:border-sky-300 dark:hover:border-sky-800 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Source and Time */}
                    <div className="flex items-center justify-between gap-2 text-[11px] mb-2.5">
                      <span className="font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-[#081220] px-2 py-0.5 rounded-md truncate max-w-[65%] border border-sky-200/40 dark:border-sky-900/40">
                        {art.source}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(art.pubDate)}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug mb-2">
                      {art.title}
                    </h3>

                    {/* Snippet */}
                    {art.snippet && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-normal">
                        {art.snippet}
                      </p>
                    )}
                  </div>

                  {/* Read Article Link */}
                  <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <a
                      href={art.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors"
                    >
                      <span>Read Original Story</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Newspaper Directory View */
        <div className="space-y-6">
          <div className="bg-sky-50/60 dark:bg-[#081220] p-4 rounded-2xl border border-sky-100 dark:border-sky-950 text-xs text-blue-950 dark:text-sky-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <p>
              Direct, verified links to official e-paper and digital journalism websites of leading regional and national news organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {NEWSPAPERS.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-[#0c1829] rounded-2xl p-5 border border-sky-100 dark:border-sky-950/80 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${paper.tagColor}`}>
                      {paper.language}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                      {paper.region}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {paper.name}
                    </h3>
                    {paper.nativeName && (
                      <span className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                        ({paper.nativeName})
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2">
                    {paper.badge}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-4">
                    {paper.description}
                  </p>
                </div>

                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-50 dark:bg-[#081220] hover:bg-blue-950 dark:hover:bg-sky-600 text-blue-950 dark:text-sky-300 hover:text-white dark:hover:text-white text-xs font-bold transition-all border border-sky-200 dark:border-sky-900/60 hover:border-transparent shadow-2xs"
                >
                  <span>Visit {paper.name} Official Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
