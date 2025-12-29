import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, HubEvent, MorningBriefing, HubLocation, HubCategory } from './types';
import type { Env } from './core-utils';
export interface EventFilters {
  category?: HubCategory;
  location?: HubLocation;
  searchQuery?: string;
}
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private events = new Map<string, HubEvent>();
  private briefing: MorningBriefing | null = null;
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const storedSessions = await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {};
      const storedEvents = await this.ctx.storage.get<Record<string, HubEvent>>('hub_events') || {};
      const storedBriefing = await this.ctx.storage.get<MorningBriefing>('morning_briefing') || null;
      this.sessions = new Map(Object.entries(storedSessions));
      this.events = new Map(Object.entries(storedEvents));
      this.briefing = storedBriefing;
      this.loaded = true;
    }
  }
  private async persistSessions(): Promise<void> {
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
  }
  private async persistEvents(): Promise<void> {
    await this.ctx.storage.put('hub_events', Object.fromEntries(this.events));
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persistSessions();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persistSessions();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persistSessions();
    }
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async upsertEvent(event: HubEvent): Promise<void> {
    await this.ensureLoaded();
    // Improved deduplication: Normalize title and use date as composite key
    const normalizedTitle = event.title.toLowerCase().trim().replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    const dateStr = new Date(event.eventDate).toISOString().split('T')[0];
    const dedupKey = `${normalizedTitle}_${dateStr}`;
    this.events.set(dedupKey, { ...event, id: event.id || crypto.randomUUID() });
    await this.persistEvents();
  }
  async listEvents(filters?: EventFilters): Promise<HubEvent[]> {
    await this.ensureLoaded();
    let results = Array.from(this.events.values());
    if (filters) {
      if (filters.category) {
        results = results.filter(e => e.category === filters.category);
      }
      if (filters.location) {
        results = results.filter(e => e.location === filters.location);
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
    return results.sort((a, b) => 
      new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );
  }
  async getSyncStats() {
    await this.ensureLoaded();
    const events = Array.from(this.events.values());
    const locationCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    events.forEach(e => {
      locationCounts[e.location] = (locationCounts[e.location] || 0) + 1;
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });
    return {
      total: events.length,
      locations: locationCounts,
      categories: categoryCounts,
      lastSync: new Date().toISOString()
    };
  }
  async saveMorningBriefing(briefing: MorningBriefing): Promise<void> {
    await this.ensureLoaded();
    this.briefing = briefing;
    await this.ctx.storage.put('morning_briefing', briefing);
  }
  async getMorningBriefing(): Promise<MorningBriefing | null> {
    await this.ensureLoaded();
    return this.briefing;
  }
  async pruneOldEvents(): Promise<number> {
    await this.ensureLoaded();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    for (const [key, event] of this.events.entries()) {
      if (new Date(event.eventDate).getTime() < thirtyDaysAgo) {
        this.events.delete(key);
        deletedCount++;
      }
    }
    if (deletedCount > 0) await this.persistEvents();
    return deletedCount;
  }
}