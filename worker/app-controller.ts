import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, HubEvent, MorningBriefing, HubLocation, HubCategory, Geofence, EventFilters, H3Index } from './types';
import type { Env } from './core-utils';
import * as h3 from 'h3-js';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private events = new Map<string, HubEvent>();
  private geofences = new Map<string, Geofence>();
  private invertedH3Index = new Map<H3Index, Set<string>>(); // H3 -> Set of Geofence IDs
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
      const storedBriefing = await this.ctx.storage.get<MorningBriefing>('morning_briefing') || null;
      this.sessions = new Map(Object.entries(storedSessions));
      this.events = new Map(Object.entries(storedEvents));
      this.geofences = new Map(Object.entries(storedGeofences));
      this.briefing = storedBriefing;
      // Rebuild Spatial Index
      this.invertedH3Index.clear();
      for (const fence of this.geofences.values()) {
        if (fence.h3Indexes) {
          for (const cellId of fence.h3Indexes) {
            if (!this.invertedH3Index.has(cellId)) this.invertedH3Index.set(cellId, new Set());
            this.invertedH3Index.get(cellId)!.add(fence.id);
          }
        }
      }
      this.loaded = true;
    }
  }
  async upsertGeofence(fence: Geofence): Promise<void> {
    await this.ensureLoaded();
    this.geofences.set(fence.id, fence);
    // Update spatial index
    if (fence.h3Indexes) {
      for (const cellId of fence.h3Indexes) {
        if (!this.invertedH3Index.has(cellId)) this.invertedH3Index.set(cellId, new Set());
        this.invertedH3Index.get(cellId)!.add(fence.id);
      }
    }
    await this.ctx.storage.put('geofences', Object.fromEntries(this.geofences));
  }
  async listGeofences(): Promise<Geofence[]> {
    await this.ensureLoaded();
    return Array.from(this.geofences.values());
  }
  async getGeofencesAt(lat: number, lng: number): Promise<Geofence[]> {
    await this.ensureLoaded();
    const cellId = h3.latLngToCell(lat, lng, 9);
    const ids = this.invertedH3Index.get(cellId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.geofences.get(id)!).filter(Boolean);
  }
  async upsertEvent(event: HubEvent): Promise<void> {
    await this.ensureLoaded();
    const normalizedTitle = event.title.toLowerCase().trim().replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    const dateStr = new Date(event.eventDate).toISOString().split('T')[0];
    const dedupKey = `${normalizedTitle}_${dateStr}`;
    this.events.set(dedupKey, { ...event, id: event.id || crypto.randomUUID() });
    await this.ctx.storage.put('hub_events', Object.fromEntries(this.events));
  }
  async listEvents(filters?: EventFilters): Promise<HubEvent[]> {
    await this.ensureLoaded();
    let results = Array.from(this.events.values());
    if (filters) {
      if (filters.category) results = results.filter(e => e.category === filters.category);
      if (filters.location) results = results.filter(e => e.location === filters.location);
      if (filters.neighborhoodId) results = results.filter(e => e.neighborhoodId === filters.neighborhoodId);
      if (filters.neighborhood) results = results.filter(e => e.neighborhood === filters.neighborhood);
      // Proximity search
      if (filters.lat !== undefined && filters.lng !== undefined) {
        const centerCell = h3.latLngToCell(filters.lat, filters.lng, 9);
        const nearbyCells = new Set(h3.gridDisk(centerCell, 2)); // 2 cell radius
        results = results.filter(e => e.h3Index && nearbyCells.has(e.h3Index));
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        results = results.filter(e =>
          e.title.toLowerCase().includes(query) ||
          e.summary.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query)
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
    return {
      total: this.events.size,
      geofences: this.geofences.size,
      lastSync: new Date().toISOString()
    };
  }
  async saveMorningBriefing(briefing: MorningBriefing): Promise<void> {
    this.briefing = briefing;
    await this.ctx.storage.put('morning_briefing', briefing);
  }
  async getMorningBriefing(): Promise<MorningBriefing | null> {
    await this.ensureLoaded();
    return this.briefing;
  }
}