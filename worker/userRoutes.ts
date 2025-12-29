import { Hono } from "hono";
import { Env, getAppController } from "./core-utils";
import OpenAI from "openai";
import Parser from "rss-parser";
const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']]
  }
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  /**
   * Scrape and Curate Lehigh Valley regional events/news
   */
  app.post('/api/hub/scrape', async (c) => {
    try {
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const controller = getAppController(c.env);
      // Regional Sources
      const sources = [
        "https://www.lehighvalleynews.com/index.rss",
        "https://www.wfmz.com/search/?f=rss&t=article&c=news/lehigh-valley"
      ];
      const allItems: any[] = [];
      for (const url of sources) {
        const res = await fetch(url, { headers: { 'User-Agent': 'TagFlow Hub 1.0' } });
        if (res.ok) {
          const feed = await parser.parseString(await res.text());
          allItems.push(...feed.items.slice(0, 5));
        }
      }
      const curatedEvents = [];
      for (const item of allItems) {
        const prompt = `Act as the Lehigh Valley Curator. Analyze this regional item and extract structured event/news data.
        Return ONLY a JSON object: { "title": "string", "venue": "string", "location": "Allentown|Bethlehem|Easton|Greater LV", "category": "Family|Nightlife|Arts|News", "summary": "2-sentence max summary" }
        Item: ${item.title} - ${item.contentSnippet || item.content}`;
        const completion = await openai.chat.completions.create({
          model: "google-ai-studio/gemini-2.0-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        const data = JSON.parse(completion.choices[0].message.content || '{}');
        const hubEvent = {
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
  app.get('/api/hub/events', async (c) => {
    const controller = getAppController(c.env);
    const events = await controller.listEvents();
    return c.json({ success: true, data: events });
  });
  app.get('/api/hub/briefing', async (c) => {
    const controller = getAppController(c.env);
    let briefing = await controller.getMorningBriefing();
    if (!briefing) {
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const events = await controller.listEvents();
      const topEvents = events.slice(0, 10).map(e => `${e.title} at ${e.venue}`).join('\n');
      const prompt = `Generate a "Morning Briefing" for the Lehigh Valley. 
      Summarize the key events and news for today in a professional, engaging tone. 
      Keep it under 150 words.
      Context: ${topEvents}`;
      const completion = await openai.chat.completions.create({
        model: "google-ai-studio/gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }]
      });
      briefing = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        content: completion.choices[0].message.content || "No briefing available for today.",
        highlightCount: events.length
      };
      await controller.saveMorningBriefing(briefing);
    }
    return c.json({ success: true, data: briefing });
  });
  // Keep existing RSS/Analyze routes...
  app.post('/api/rss/fetch', async (c) => { /* existing code */ });
  app.post('/api/analyze', async (c) => { /* existing code */ });
  app.post('/api/sync', async (c) => { /* existing code */ });
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        return c.json({ error: "Use specialized endpoints for TagFlow" }, 404);
    });
}