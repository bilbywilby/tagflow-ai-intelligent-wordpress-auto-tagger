export type TaggingStatus = 'pending' | 'analyzing' | 'tagged' | 'syncing' | 'synced' | 'error';
export type HubCategory = 'Family' | 'Nightlife' | 'Arts' | 'News' | 'General';
export type HubLocation = 'Allentown' | 'Bethlehem' | 'Easton' | 'Greater LV' | 'Other';
export interface Geofence {
  id: string;
  name: string;
  canonicalPlace: HubLocation;
  aliases: string[];
  zipCodes: string[];
}
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
export interface HubEvent {
  id: string;
  title: string;
  venue: string;
  location: HubLocation;
  neighborhood?: string;
  zipCode?: string;
  eventDate: string;
  category: HubCategory;
  summary: string;
  sourceUrl: string;
  createdAt: string;
}
export interface MorningBriefing {
  id: string;
  date: string;
  content: string;
  highlightCount: number;
}
export interface AppSettings {
  wpApiUrl: string;
  wpApiKey: string;
  aiPrompt: string;
  autoSync: boolean;
}