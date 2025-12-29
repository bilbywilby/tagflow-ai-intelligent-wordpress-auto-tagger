export type TaggingStatus = 'pending' | 'analyzing' | 'tagged' | 'syncing' | 'synced' | 'error';
export interface Tag {
  id: string;
  name: string;
  confidence: number;
  isCustom?: boolean;
}
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  url: string;
  author?: string;
  publishedDate?: string;
  thumbnail?: string;
  tags: Tag[];
  status: TaggingStatus;
  error?: string;
}
export interface AppSettings {
  wpApiUrl: string;
  wpApiKey: string;
  aiPrompt: string;
  autoSync: boolean;
}