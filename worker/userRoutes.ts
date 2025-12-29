import { Hono } from "hono";
import { Env, getAppController } from "./core-utils";
import OpenAI from "openai";
import Parser from "rss-parser";
import { HubEvent } from "./types";
const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']]
  }
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/hub/scrape', async (c) => {
    try {
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const controller = getAppController(c.env);
      const sources = [
        "https://www.lehighvalleynews.com/index.rss",
        "https://www.wfmz.com/search/?f=rss&t=article&c=news/lehigh-valley"
      ];
      const allItems: any[] = [];
      for (const url of sources) {
        try {
          const res = await fetch(url, { headers: { 'User-Agent': 'TagFlow Hub 1.0' } });
          if (res.ok) {
            const feed = await parser.parseString(await res.text());
            allItems.push(...feed.items.slice(0, 5));
          }
        } catch (e) {
          console.error(`Feed fetch error for ${url}:`, e);
        }
      }
      const curatedEvents: HubEvent[] = [];
      for (const item of allItems) {
        const prompt = `Act as the Lehigh Valley Regional Curator. Extract structured event/news data from this item.
        Locations MUST be one of: Allentown, Bethlehem, Easton, Greater LV.
        Categories MUST be one of: Family, Nightlife, Arts, News, General.
        Return ONLY a JSON object: { "title": "string", "venue": "string", "location": "string", "category": "string", "summary": "string" }
        Item: ${item.title} - ${item.contentSnippet || item.content}`;
        const completion = await openai.chat.completions.create({
          model: "google-ai-studio/gemini-2.0-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        const data = JSON.parse(completion.choices[0].message.content || '{}');
        const hubEvent: HubEvent = {
          id: crypto.randomUUID(),
          title: data.title || item.title,
          venue: data.venue || "Various Locations",
          location: data.location || "Greater LV",
          category: data.category || "News",
          summary: data.summary || item.contentSnippet?.slice(0, 150),
          eventDate: item.pubDate || new Date().toISOString(),
          sourceUrl: item.link || "",
          createdAt: new Date().toISOString()
        };
        await controller.upsertEvent(hubEvent);
        curatedEvents.push(hubEvent);
      }
      return c.json({ success: true, count: curatedEvents.length });
    } catch (error) {
      console.error('Hub Scrape Error:', error);
      return c.json({ success: false, error: "Curation failed" }, 500);
    }
  });
  app.post('/api/hub/parse-rss', async (c) => {
    try {
      const { feedUrl } = await c.req.json();
      if (!feedUrl) return c.json({ success: false, error: "Feed URL required" }, 400);
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const controller = getAppController(c.env);
      const res = await fetch(feedUrl, { headers: { 'User-Agent': 'TagFlow Hub 1.0' } });
      const feed = await parser.parseString(await res.text());
      const items = feed.items.slice(0, 3);
      for (const item of items) {
        const prompt = `Convert this blog/news item into a structured regional 'HubEvent'. 
        Return JSON: { "title": "string", "venue": "string", "location": "Allentown|Bethlehem|Easton|Greater LV", "category": "Family|Nightlife|Arts|News|General", "summary": "short summary" }
        Input: ${item.title} - ${item.contentSnippet || item.content}`;
        const completion = await openai.chat.completions.create({
          model: "google-ai-studio/gemini-2.0-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        const data = JSON.parse(completion.choices[0].message.content || '{}');
        await controller.upsertEvent({
          id: crypto.randomUUID(),
          title: data.title || item.title,
          venue: data.venue || "Online / Remote",
          location: data.location || "Greater LV",
          category: data.category || "General",
          summary: data.summary || item.contentSnippet || "",
          eventDate: item.pubDate || new Date().toISOString(),
          sourceUrl: item.link || "",
          createdAt: new Date().toISOString()
        });
      }
      return c.json({ success: true, count: items.length });
    } catch (error) {
      return c.json({ success: false, error: String(error) }, 500);
    }
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
    let briefing = await controller.getMorningBriefing();
    if (!briefing) {
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const events = await controller.listEvents();
      const topEvents = events.slice(0, 10).map(e => `${e.title} at ${e.venue} in ${e.location}`).join('\n');
      const prompt = `Generate a high-quality "Morning Briefing" for the Lehigh Valley region.
      Highlight current events in Allentown, Bethlehem, and Easton. 
      Tone: Professional, optimistic, community-focused.
      Context: ${topEvents}`;
      const completion = await openai.chat.completions.create({
        model: "google-ai-studio/gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }]
      });
      briefing = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        content: completion.choices[0].message.content || "No regional updates available at this hour.",
        highlightCount: events.length
      };
      await controller.saveMorningBriefing(briefing);
    }
    return c.json({ success: true, data: briefing });
  });
  app.post('/api/rss/fetch', async (c) => {
    try {
      const { url } = await c.req.json();
      const feed = await parser.parseString(await (await fetch(url)).text());
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
      Content: ${content.slice(0, 1000)}`;
      const completion = await openai.chat.completions.create({
        model: "google-ai-studio/gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(completion.choices[0].message.content || '{"tags": []}');
      const tags = (result.tags || result).map((name: string) => ({
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