import { create } from 'zustand';
import { Article, AppSettings, HubEvent, MorningBriefing } from '@/types/schema';
interface AppState {
  articles: Article[];
  events: HubEvent[];
  briefing: MorningBriefing | null;
  feedUrl: string;
  isLoading: boolean;
  isCurating: boolean;
  settings: AppSettings;
  searchQuery: string;
  selectedCategory: string | null;
  viewMode: 'grid' | 'list';
  // Actions
  setArticles: (articles: Article[]) => void;
  addArticles: (articles: Article[]) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  updateArticles: (ids: string[], updates: Partial<Article>) => void;
  clearArticles: () => void;
  setEvents: (events: HubEvent[]) => void;
  setBriefing: (briefing: MorningBriefing | null) => void;
  setCurating: (curating: boolean) => void;
  setFeedUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}
export const useAppStore = create<AppState>((set) => ({
  articles: [],
  events: [],
  briefing: null,
  feedUrl: '',
  isLoading: false,
  isCurating: false,
  searchQuery: '',
  selectedCategory: null,
  viewMode: 'grid',
  settings: {
    wpApiUrl: 'https://demo.wordpress.org/wp-json',
    wpApiKey: '',
    aiPrompt: 'Extract 5 SEO-friendly tags for this blog post. Return as a JSON array of strings.',
    autoSync: false,
  },
  setArticles: (articles) => set({ articles }),
  addArticles: (newArticles) => set((state) => ({
    articles: [...newArticles, ...state.articles.filter(a => !newArticles.find(n => n.url === a.url))]
  })),
  updateArticle: (id, updates) => set((state) => ({
    articles: state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
  })),
  updateArticles: (ids, updates) => set((state) => ({
    articles: state.articles.map((a) => (ids.includes(a.id) ? { ...a, ...updates } : a)),
  })),
  clearArticles: () => set({ articles: [] }),
  setEvents: (events) => set({ events }),
  setBriefing: (briefing) => set({ briefing }),
  setCurating: (isCurating) => set({ isCurating }),
  setFeedUrl: (feedUrl) => set({ feedUrl }),
  setLoading: (isLoading) => set({ isLoading }),
  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings },
  })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setViewMode: (viewMode) => set({ viewMode }),
}));