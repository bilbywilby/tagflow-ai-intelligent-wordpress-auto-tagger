import { Hono } from "hono";
import { Env, getAppController } from "./core-utils";
import OpenAI from "openai";
import Parser from "rss-parser";
import { HubEvent, MorningBriefing } from "./types";
import { runProSync } from "./intelligence";
const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']]
  }
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Pro Sync Endpoint
  app.post('/api/hub/sync', async (c) => {
    try {
      const controller = getAppController(c.env);
      const count = await runProSync(c.env, controller);
      return c.json({ success: true, count });
    } catch (error) {
      console.error('Pro Sync Error:', error);
      return c.json({ success: false, error: "Sync pipeline failed" }, 500);
    }
  });
  // Hub Stats Endpoint
  app.get('/api/hub/stats', async (c) => {
    const controller = getAppController(c.env);
    const stats = await controller.getSyncStats();
    return c.json({ success: true, data: stats });
  });
  app.get('/api/hub/events', async (c) => {
    const controller = getAppController(c.env);
    const category = c.req.query('category') as any;
    const location = c.req.query('location') as any;
    const searchQuery = c.req.query('q');
    const events = await controller.listEvents({ category, location, searchQuery });
    return c.json({ success: true, data: events });
  });
  app.get('/api/hub/briefing', async (c) => {
    const controller = getAppController(c.env);
    const existingBriefing = await controller.getMorningBriefing();
    if (existingBriefing) {
      return c.json({ success: true, data: existingBriefing });
    }
    try {
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const events = await controller.listEvents();
      const topEvents = events.slice(0, 10).map(e => `${e.title} at ${e.venue} in ${e.location}`).join('\n');
      const prompt = `Generate a high-quality "Morning Briefing" for the Lehigh Valley region.
      Highlight current events in Allentown, Bethlehem, and Easton.
      Tone: Professional, optimistic, community-focused.
      Limit to 3 concise paragraphs.
      Context: ${topEvents}`;
      const completion = await openai.chat.completions.create({
        model: "google-ai-studio/gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }]
      });
      const regionalBriefing = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        content: completion.choices[0].message.content || "No regional updates available at this hour.",
        highlightCount: events.length
      } as MorningBriefing;
      await controller.saveMorningBriefing(regionalBriefing);
      return c.json({ success: true, data: regionalBriefing });
    } catch (err) {
      return c.json({ success: false, error: "Briefing generation failed" }, 500);
    }
  });
  app.post('/api/rss/fetch', async (c) => {
    try {
      const { url } = await c.req.json();
      const res = await fetch(url);
      const feed = await parser.parseString(await res.text());
      const data = feed.items.map(item => ({
        id: crypto.randomUUID(),
        title: item.title,
        content: item.contentEncoded || item.content || "",
        excerpt: item.contentSnippet || "",
        url: item.link,
        publishedDate: item.pubDate,
        tags: [],
        status: 'pending'
      }));
      return c.json({ success: true, data });
    } catch (e) {
      return c.json({ success: false, error: "Feed parse failed" }, 500);
    }
  });
  app.post('/api/analyze', async (c) => {
    try {
      const { title, content } = await c.req.json();
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const prompt = `Analyze this blog post and return a JSON array of 5 SEO tags.
      Title: ${title}
      Content: ${content.slice(0, 1000)}
      Return JSON: { "tags": ["tag1", "tag2", ...] }`;
      const completion = await openai.chat.completions.create({
        model: "google-ai-studio/gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(completion.choices[0].message.content || '{"tags": []}');
      const tagNames = Array.isArray(result.tags) ? result.tags : [];
      const tags = tagNames.map((name: string) => ({
        id: crypto.randomUUID(),
        name,
        confidence: 0.95
      }));
      return c.json({ success: true, data: tags });
    } catch (e) {
      return c.json({ success: false, error: "AI Analysis failed" }, 500);
    }
  });
  app.post('/api/sync', async (c) => {
    return c.json({ success: true });
  });
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
  app.all('/api/chat/:sessionId/*', async (c) => {
    return c.json({ error: "Use specialized endpoints for TagFlow" }, 404);
  });
}