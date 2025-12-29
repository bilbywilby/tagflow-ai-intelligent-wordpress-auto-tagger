import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, HubEvent, MorningBriefing } from './types';
import type { Env } from './core-utils';
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
  // --- Hub Event Persistence (D1 Simulation) ---
  async upsertEvent(event: HubEvent): Promise<void> {
    await this.ensureLoaded();
    // Deduplication by normalized title and date
    const dedupKey = `${event.title.toLowerCase().trim()}_${event.eventDate}`;
    this.events.set(dedupKey, { ...event, id: event.id || crypto.randomUUID() });
    await this.persistEvents();
  }
  async listEvents(): Promise<HubEvent[]> {
    await this.ensureLoaded();
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );
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
}