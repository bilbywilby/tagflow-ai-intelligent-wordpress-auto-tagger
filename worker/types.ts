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
export interface Geofence {
  id: string;
  name: string;
  canonicalPlace: HubLocation;
  aliases: string[];
  zipCodes: string[];
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
export interface EventFilters {
  category?: HubCategory;
  location?: HubLocation;
  neighborhood?: string;
  searchQuery?: string;
}