import { create } from 'zustand';
import { Article, AppSettings, Tag } from '@/types/schema';
interface AppState {
  articles: Article[];
  feedUrl: string;
  isLoading: boolean;
  settings: AppSettings;
  setArticles: (articles: Article[]) => void;
  addArticles: (articles: Article[]) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  setFeedUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}
export const useAppStore = create<AppState>((set) => ({
  articles: [],
  feedUrl: '',
  isLoading: false,
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
  setFeedUrl: (feedUrl) => set({ feedUrl }),
  setLoading: (isLoading) => set({ isLoading }),
  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings },
  })),
}));