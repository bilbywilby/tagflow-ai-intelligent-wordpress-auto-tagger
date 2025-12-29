export type H3Index = string;
export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}
export interface MCPResult {
  content: string;
}
export interface ErrorResult {
  error: string;
}
export type HubCategory = 'Family' | 'Nightlife' | 'Arts' | 'News' | 'General';
export type HubLocation = 'Allentown' | 'Bethlehem' | 'Easton' | 'Greater LV' | 'Other';
export interface Landmark {
  id: string;
  name: string;
  category: 'Sports' | 'Entertainment' | 'Education' | 'Culture' | 'Public' | 'Arts' | 'Government' | 'Retail';
  address: string;
  lat: number;
  lng: number;
  h3Index: H3Index;
  associatedGeofenceId?: string;
}
export interface Geofence {
  id: string;
  name: string;
  canonicalPlace: HubLocation;
  aliases: string[];
  zipCodes: string[];
  h3Indexes?: H3Index[];
  centroid?: { lat: number; lng: number };
  bbox?: [number, number, number, number];
}
export interface HubEvent {
  id: string;
  title: string;
  venue: string;
  location: HubLocation;
  neighborhood?: string;
  neighborhoodId?: string;
  landmarkId?: string;
  h3Index?: H3Index;
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
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}
export interface Tag {
  id: string;
  name: string;
  confidence: number;
}

export interface Article {
  id: string;
  title: string | null;
  content: string;
  excerpt: string;
  url: string;
  publishedDate?: string;
  author?: string;
  tags: Tag[];
  status: string;
}

export interface EventFilters {
  category?: HubCategory;
  location?: HubLocation;
  neighborhood?: string;
  neighborhoodId?: string;
  landmarkId?: string;
  searchQuery?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}