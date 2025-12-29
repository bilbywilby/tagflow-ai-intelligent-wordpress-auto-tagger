import { Article, Tag, HubEvent, MorningBriefing, HubLocation, HubCategory, Geofence, Landmark } from '@/types/schema';
export async function fetchFeed(url: string): Promise<Article[]> {
  const res = await fetch('/api/rss/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch feed');
  return json.data;
}
export async function analyzeArticle(article: Partial<Article>): Promise<Tag[]> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: article.title, content: article.content }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Analysis failed');
  return json.data;
}
export async function syncToWP(articleId: string, tags: Tag[]): Promise<void> {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleId, tags }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Sync failed');
}
// --- Hub API ---
export async function fetchEvents(filters: {
  location?: HubLocation | null;
  category?: HubCategory | null;
  q?: string;
  neighborhood?: string;
  neighborhoodId?: string;
  landmarkId?: string;
  lat?: number;
  lng?: number;
} = {}): Promise<HubEvent[]> {
  const params = new URLSearchParams();
  if (filters.location) params.append('location', filters.location);
  if (filters.category) params.append('category', filters.category);
  if (filters.q) params.append('q', filters.q);
  if (filters.neighborhood) params.append('neighborhood', filters.neighborhood);
  if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId);
  if (filters.landmarkId) params.append('landmarkId', filters.landmarkId);
  if (filters.lat) params.append('lat', filters.lat.toString());
  if (filters.lng) params.append('lng', filters.lng.toString());
  const res = await fetch(`/api/hub/events?${params.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch hub events');
  return json.data;
}
export async function fetchGeofences(): Promise<Geofence[]> {
  const res = await fetch('/api/hub/geofences');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch geofences');
  return json.data;
}
export async function fetchLandmarks(): Promise<Landmark[]> {
  const res = await fetch('/api/hub/landmarks');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch landmarks');
  return json.data;
}
export async function fetchNeighborhoodAt(lat: number, lng: number): Promise<Geofence[]> {
  const res = await fetch(`/api/hub/geofences/at?lat=${lat}&lng=${lng}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to resolve location');
  return json.data;
}
export async function ingestGeofences(geojson: any): Promise<{ count: number }> {
  const res = await fetch('/api/hub/geofences/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geojson),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Ingestion failed');
  return json;
}
export async function fetchBriefing(): Promise<MorningBriefing> {
  const res = await fetch('/api/hub/briefing');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch morning briefing');
  return json.data;
}
export async function syncHubPro(): Promise<{ count: number }> {
  const res = await fetch('/api/hub/sync', { method: 'POST' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Professional sync failed');
  return json;
}
export async function fetchHubStats(): Promise<any> {
  const res = await fetch('/api/hub/stats');
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch hub stats');
  return json.data;
}