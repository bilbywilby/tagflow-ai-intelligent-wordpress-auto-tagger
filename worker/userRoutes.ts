import { Hono } from "hono";
import OpenAI from "openai";
import Parser from "rss-parser";
import { Env, getAppController } from "./core-utils";
import { ingestGeoJSON, INITIAL_VALLEY_BOUNDARIES } from "./geojson-loader";
import { PRESET_LANDMARKS } from "./gazetteer";
import { Landmark, Article, Tag } from "./types";
import { generateMorningBriefing, runProSync } from "./intelligence";
import * as h3 from "h3-js";
const rssParser = new Parser();
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- RSS & Studio Endpoints ---
  app.post('/api/rss/fetch', async (c) => {
    try {
      const { url } = await c.req.json();
      const feed = await rssParser.parseString(await (await fetch(url)).text());
      const articles: Article[] = feed.items.map((item) => ({
        id: crypto.randomUUID(),
        title: item.title || 'Untitled',
        content: item.content || item.contentSnippet || '',
        excerpt: item.contentSnippet?.slice(0, 160) || '',
        url: item.link || '',
        publishedDate: item.pubDate,
        author: item.creator,
        tags: [],
        status: 'pending'
      }));
      return c.json({ success: true, data: articles });
    } catch (error) {
      return c.json({ success: false, error: "Failed to fetch RSS feed" }, 500);
    }
  });
  app.post('/api/analyze', async (c) => {
    try {
      const { title, content } = await c.req.json();
      const openai = new OpenAI({ baseURL: c.env.CF_AI_BASE_URL, apiKey: c.env.CF_AI_API_KEY });
      const prompt = `Extract 5 SEO-friendly tags for this blog post. Return EXCLUSIVELY a JSON array of strings.
      Title: ${title}
      Content: ${content.slice(0, 1000)}`;
      const completion = await openai.chat.completions.create({
        model: "google-ai-studio/gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const responseText = completion.choices[0].message.content || '{"tags": []}';
      const parsed = JSON.parse(responseText);
      const tagStrings = Array.isArray(parsed) ? parsed : (parsed.tags || []);
      const tags: Tag[] = tagStrings.map((s: string) => ({
        id: crypto.randomUUID(),
        name: s,
        confidence: 0.9 + Math.random() * 0.1
      }));
      return c.json({ success: true, data: tags });
    } catch (error) {
      return c.json({ success: false, error: "Analysis failed" }, 500);
    }
  });
  app.post('/api/sync', async (c) => {
    // Mock successful sync to WordPress
    return c.json({ success: true });
  });
  // --- Hub Endpoints ---
  app.get('/api/hub/geofences', async (c) => {
    const controller = getAppController(c.env);
    const fences = await controller.listGeofences();
    return c.json({ success: true, data: fences });
  });
  app.get('/api/hub/geofences/at', async (c) => {
    const lat = parseFloat(c.req.query('lat') || '0');
    const lng = parseFloat(c.req.query('lng') || '0');
    const controller = getAppController(c.env);
    const fences = await controller.getGeofencesAt(lat, lng);
    return c.json({ success: true, data: fences });
  });
  app.get('/api/hub/landmarks', async (c) => {
    const controller = getAppController(c.env);
    const landmarks = await controller.listLandmarks();
    return c.json({ success: true, data: landmarks });
  });
  app.get('/api/hub/events', async (c) => {
    const controller = getAppController(c.env);
    const category = c.req.query('category') as any;
    const location = c.req.query('location') as any;
    const neighborhoodId = c.req.query('neighborhoodId');
    const landmarkId = c.req.query('landmarkId');
    const searchQuery = c.req.query('q');
    const events = await controller.listEvents({
      category, location, neighborhoodId, landmarkId, searchQuery
    });
    return c.json({ success: true, data: events });
  });
  app.get('/api/hub/briefing', async (c) => {
    const controller = getAppController(c.env);
    let briefing: any = await controller.getMorningBriefing();
    const isStale = briefing && (Date.now() - new Date(briefing.date).getTime() > 12 * 60 * 60 * 1000);
    if (!briefing || isStale) {
      briefing = await generateMorningBriefing(c.env, controller);
    }
    return c.json({ success: true, data: briefing });
  });
  app.post('/api/hub/sync', async (c) => {
    const controller = getAppController(c.env);
    const count = await runProSync(c.env, controller);
    return c.json({ success: true, count });
  });
  app.get('/api/hub/stats', async (c) => {
    const controller = getAppController(c.env);
    const stats = await controller.getSyncStats();
    const briefing = await controller.getMorningBriefing();
    if (stats.landmarks === 0 || stats.geofences === 0) {
      for (const p of PRESET_LANDMARKS) {
        if (!p.id || !p.lat || !p.lng) continue;
        const landmark: Landmark = {
          id: p.id,
          name: p.name!,
          category: p.category as any,
          address: p.address!,
          lat: p.lat,
          lng: p.lng,
          h3Index: h3.latLngToCell(p.lat, p.lng, 9)
        };
        await controller.upsertLandmark(landmark);
      }
      const defaultFences = ingestGeoJSON(INITIAL_VALLEY_BOUNDARIES);
      for (const fence of defaultFences) {
        await controller.upsertGeofence(fence);
      }
      const newStats = await controller.getSyncStats();
      return c.json({
        success: true,
        data: { ...newStats, briefingStatus: briefing?.date || null },
        seeded: true
      });
    }
    return c.json({
      success: true,
      data: { ...stats, briefingStatus: briefing?.date || null }
    });
  });
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
  app.all('/api/chat/:sessionId/*', async (c) => {
    return c.json({ error: "Use specialized endpoints for TagFlow" }, 404);
  });
}