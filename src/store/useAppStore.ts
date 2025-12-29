import { create } from 'zustand';
import { Article, AppSettings, HubEvent, MorningBriefing, HubLocation, Geofence } from '@/types/schema';
interface AppState {
  articles: Article[];
  events: HubEvent[];
  briefing: MorningBriefing | null;
  feedUrl: string;
  isLoading: boolean;
  isCurating: boolean; // UI loading for hub refresh
  isSyncing: boolean;   // Specific tracking for Pro Sync
  hubStats: any;
  settings: AppSettings;
  searchQuery: string;
  selectedCategory: string | null;
  viewMode: 'grid' | 'list';
  // Hub Filters
  hubSearchQuery: string;
  hubSelectedLocation: HubLocation | null;
  hubSelectedNeighborhood: string | null;
  geofences: Geofence[];
  // Actions
  setArticles: (articles: Article[]) => void;
  addArticles: (articles: Article[]) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  updateArticles: (ids: string[], updates: Partial<Article>) => void;
  clearArticles: () => void;
  setEvents: (events: HubEvent[]) => void;
  setBriefing: (briefing: MorningBriefing | null) => void;
  setCurating: (curating: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setHubStats: (stats: any) => void;
  setFeedUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setHubSearchQuery: (query: string) => void;
  setHubSelectedLocation: (location: HubLocation | null) => void;
  setHubSelectedNeighborhood: (neighborhood: string | null) => void;
  setGeofences: (geofences: Geofence[]) => void;
}
export const useAppStore = create<AppState>((set) => ({
  articles: [],
  events: [],
  briefing: null,
  feedUrl: '',
  isLoading: false,
  isCurating: false,
  isSyncing: false,
  hubStats: null,
  searchQuery: '',
  selectedCategory: null,
  viewMode: 'grid',
  hubSearchQuery: '',
  hubSelectedLocation: null,
  hubSelectedNeighborhood: null,
  geofences: [],
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
  setSyncing: (isSyncing) => set({ isSyncing }),
  setHubStats: (hubStats) => set({ hubStats }),
  setFeedUrl: (feedUrl) => set({ feedUrl }),
  setLoading: (isLoading) => set({ isLoading }),
  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings },
  })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setViewMode: (viewMode) => set({ viewMode }),
  setHubSearchQuery: (hubSearchQuery) => set({ hubSearchQuery }),
  setHubSelectedLocation: (hubSelectedLocation) => set({ hubSelectedLocation }),
  setHubSelectedNeighborhood: (hubSelectedNeighborhood) => set({ hubSelectedNeighborhood }),
  setGeofences: (geofences) => set({ geofences }),
}));