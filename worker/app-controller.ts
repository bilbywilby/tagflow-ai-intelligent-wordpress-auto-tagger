import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, HubEvent, MorningBriefing, HubLocation, Geofence, EventFilters, H3Index, Landmark } from './types';
import type { Env } from './core-utils';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private events = new Map<string, HubEvent>();
  private geofences = new Map<string, Geofence>();
  private landmarks = new Map<string, Landmark>();
  private invertedH3Index = new Map<H3Index, Set<string>>();
  private landmarkH3Index = new Map<H3Index, Set<string>>();
  private h3Instance?: typeof import('h3-js');
  private briefing: MorningBriefing | null = null;
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const storedSessions = await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {};
      const storedEvents = await this.ctx.storage.get<Record<string, HubEvent>>('hub_events') || {};
      const storedGeofences = await this.ctx.storage.get<Record<string, Geofence>>('geofences') || {};
      const storedLandmarks = await this.ctx.storage.get<Record<string, Landmark>>('landmarks') || {};
      const storedBriefing = await this.ctx.storage.get<MorningBriefing>('morning_briefing') || null;
      this.sessions = new Map(Object.entries(storedSessions));
      this.events = new Map(Object.entries(storedEvents));
      this.geofences = new Map(Object.entries(storedGeofences));
      this.landmarks = new Map(Object.entries(storedLandmarks));
      this.briefing = storedBriefing;
      this.rebuildSpatialIndices();
      this.loaded = true;
    }
  }
  private rebuildSpatialIndices() {
    this.invertedH3Index.clear();
    for (const fence of this.geofences.values()) {
      if (fence.h3Indexes) {
        for (const cell of fence.h3Indexes) {
          if (!this.invertedH3Index.has(cell)) this.invertedH3Index.set(cell, new Set());
          this.invertedH3Index.get(cell)!.add(fence.id);
        }
      }
    }
    this.landmarkH3Index.clear();
    for (const landmark of this.landmarks.values()) {
      if (landmark.h3Index) {
        if (!this.landmarkH3Index.has(landmark.h3Index)) this.landmarkH3Index.set(landmark.h3Index, new Set());
        this.landmarkH3Index.get(landmark.h3Index)!.add(landmark.id);
      }
    }
  }
  async upsertGeofence(fence: Geofence): Promise<void> {
    await this.ensureLoaded();
    this.geofences.set(fence.id, fence);
    this.rebuildSpatialIndices();
    await this.ctx.storage.put('geofences', Object.fromEntries(this.geofences));
  }
  async listGeofences(): Promise<Geofence[]> {
    await this.ensureLoaded();
    return Array.from(this.geofences.values());
  }
  async upsertLandmark(landmark: Landmark): Promise<void> {
    await this.ensureLoaded();
    this.landmarks.set(landmark.id, landmark);
    this.rebuildSpatialIndices();
    await this.ctx.storage.put('landmarks', Object.fromEntries(this.landmarks));
  }
  async listLandmarks(): Promise<Landmark[]> {
    await this.ensureLoaded();
    return Array.from(this.landmarks.values());
  }
  async upsertEvent(event: HubEvent): Promise<void> {
    await this.ensureLoaded();
    this.events.set(event.id, event);
    // Prune events older than 7 days to keep DO state lean
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    for (const [id, e] of this.events.entries()) {
      if (new Date(e.createdAt).getTime() < cutoff) {
        this.events.delete(id);
      }
    }
    await this.ctx.storage.put('hub_events', Object.fromEntries(this.events));
  }
  async listEvents(filters?: EventFilters): Promise<HubEvent[]> {
    await this.ensureLoaded();
    let results = Array.from(this.events.values());
    if (filters) {
      if (filters.category) results = results.filter(e => e.category === filters.category);
      if (filters.location) results = results.filter(e => e.location === filters.location);
      if (filters.neighborhoodId) results = results.filter(e => e.neighborhoodId === filters.neighborhoodId);
      if (filters.landmarkId) results = results.filter(e => e.landmarkId === filters.landmarkId);
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        results = results.filter(e => 
          e.title.toLowerCase().includes(q) || 
          e.venue.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q)
        );
      }
    }
    return results.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, { id: sessionId, title: title || `Chat ${new Date(now).toLocaleDateString()}`, createdAt: now, lastActive: now });
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
    }
  }
  async getSyncStats() {
    await this.ensureLoaded();
    const neighborhoodCounts: Record<string, number> = {};
    this.events.forEach(e => {
      if (e.neighborhood) neighborhoodCounts[e.neighborhood] = (neighborhoodCounts[e.neighborhood] || 0) + 1;
    });
    return {
      total: this.events.size,
      geofences: this.geofences.size,
      landmarks: this.landmarks.size,
      neighborhoods: neighborhoodCounts,
      lastSync: new Date().toISOString()
    };
  }
  async saveMorningBriefing(briefing: MorningBriefing): Promise<void> {
    await this.ensureLoaded();
    // Only save if newer or first one
    if (!this.briefing || new Date(briefing.date).getTime() > new Date(this.briefing.date).getTime()) {
      this.briefing = briefing;
      await this.ctx.storage.put('morning_briefing', briefing);
    }
  }
  async getMorningBriefing(): Promise<MorningBriefing | null> {
    await this.ensureLoaded();
    return this.briefing;
  }
  async getGeofencesAt(lat: number, lng: number): Promise<Geofence[]> {
    await this.ensureLoaded();
    if (!this.h3Instance) {
      (globalThis as any).__dirname ??= '/';
      this.h3Instance = await import('h3-js');
    }
    const cell = this.h3Instance!.latLngToCell(lat, lng, 9);
    const ids = this.invertedH3Index.get(cell);
    if (!ids) return [];
    return Array.from(ids).map(id => this.geofences.get(id)!).filter(Boolean);
  }
}