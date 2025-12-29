import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { RSS_FEEDS } from '@/data/rssFeeds';
import { FeedCard } from '@/components/FeedCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Download,
  LayoutGrid,
  List,
  Newspaper,
  FilterX,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { exportFeedsToOPML } from '@/lib/opml';
export function Dashboard() {
  const searchQuery = useAppStore(s => s.searchQuery);
  const selectedCategory = useAppStore(s => s.selectedCategory);
  const setSearchQuery = useAppStore(s => s.setSearchQuery);
  const setSelectedCategory = useAppStore(s => s.setSelectedCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const filteredFeeds = useMemo(() => {
    return RSS_FEEDS.filter(feed => {
      const matchesSearch =
        feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || feed.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);
  const featuredFeeds = useMemo(() => RSS_FEEDS.slice(0, 3), []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
                Feed <span className="text-indigo-600">Explorer</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                The ultimate directory of Lehigh Valley news and media sources.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-secondary/50 rounded-lg p-1 flex items-center border">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => exportFeedsToOPML(RSS_FEEDS)}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold transition-all shadow-md gap-2"
              >
                <Download className="h-4 w-4" />
                Export OPML
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search by title, category, or URL..."
                className="pl-12 h-14 bg-secondary/30 border-input text-lg focus-visible:ring-indigo-500/30 rounded-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                   <TrendingUp className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Live Status</p>
                   <p className="text-sm font-bold">{RSS_FEEDS.length} Regional Sources</p>
                 </div>
               </div>
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          {selectedCategory && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-sm font-medium text-muted-foreground">Filtering by:</span>
              <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="hover:text-indigo-900 dark:hover:text-indigo-200">
                  <FilterX className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </header>
        <main className="space-y-16">
          {!searchQuery && !selectedCategory && (
            <section className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-indigo-500" />
                Featured Regional Sources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredFeeds.map(feed => (
                  <FeedCard key={`feat-${feed.id}`} feed={feed} variant="grid" />
                ))}
              </div>
            </section>
          )}
          <section className="space-y-6">
            <h2 className="text-xl font-bold">
              {searchQuery || selectedCategory ? 'Search Results' : 'Full Directory'}
            </h2>
            {filteredFeeds.length > 0 ? (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-4"
              }>
                <AnimatePresence mode="popLayout">
                  {filteredFeeds.map((feed) => (
                    <FeedCard
                      key={feed.id}
                      feed={feed}
                      variant={viewMode}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-4xl bg-muted/10 border-muted-foreground/10">
                <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6">
                  <Newspaper className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No matching feeds</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  We couldn't find any regional sources matching your current search criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {setSearchQuery(''); setSelectedCategory(null);}}
                  className="gap-2"
                >
                  Reset All Filters
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}