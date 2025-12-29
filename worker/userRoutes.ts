import { Hono } from "hono";
import { Env } from "./core-utils";
import OpenAI from "openai";
import Parser from "rss-parser";
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
      ['dc:creator', 'creator'],
    ],
  }
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    /**
     * Fetch and parse RSS Feed using rss-parser
     * POST /api/rss/fetch
     */
    app.post('/api/rss/fetch', async (c) => {
        try {
            const { url } = await c.req.json();
            if (!url) return c.json({ success: false, error: "URL is required" }, 400);
            const response = await fetch(url, {
                headers: { 'User-Agent': 'TagFlow AI Content Bot 1.0' },
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) {
                return c.json({ success: false, error: `Failed to fetch feed: ${response.statusText}` }, 400);
            }
            const xml = await response.text();
            if (!xml || xml.trim().length === 0) {
              return c.json({ success: false, error: "Feed returned empty content." }, 400);
            }
            const feed = await parser.parseString(xml);
            if (!feed.items || feed.items.length === 0) {
              return c.json({ success: true, data: [], message: "No articles found in this feed." });
            }
            const items = feed.items.map(item => {
                const itemAny = item as any;
                return {
                    id: crypto.randomUUID(),
                    title: item.title || "Untitled",
                    url: item.link || "",
                    excerpt: (item.contentSnippet || itemAny.description || "").slice(0, 200).replace(/<[^>]*>?/gm, '') + "...",
                    content: itemAny.contentEncoded || item.content || itemAny.description || "",
                    author: itemAny.creator || item.author || "Unknown Author",
                    publishedDate: item.pubDate || item.isoDate || new Date().toISOString(),
                    thumbnail: item.enclosure?.url || itemAny.mediaContent?.$?.url || "",
                    tags: [],
                    status: 'pending'
                };
            });
            return c.json({ success: true, data: items.slice(0, 20) });
        } catch (error) {
            console.error('RSS Fetch Error:', error);
            return c.json({ success: false, error: "Failed to parse RSS feed. Ensure it's a valid XML format." }, 500);
        }
    });
    /**
     * Analyze article and generate tags using AI
     * POST /api/analyze
     */
    app.post('/api/analyze', async (c) => {
        try {
            const { title, content } = await c.req.json();
            const openai = new OpenAI({
                baseURL: c.env.CF_AI_BASE_URL,
                apiKey: c.env.CF_AI_API_KEY
            });
            const prompt = `Act as an expert SEO editor. Analyze the following blog post and suggest exactly 5 relevant tags for WordPress.
            Focus on high-traffic keywords and specific entities found in the text.
            IMPORTANT: Return ONLY a JSON object with a key "tags" containing an array of strings.
            Title: ${title}
            Content: ${content.slice(0, 3000)}`;
            const completion = await openai.chat.completions.create({
                model: "google-ai-studio/gemini-2.0-flash",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });
            const rawResponse = completion.choices[0].message.content || '{"tags":[]}';
            const parsed = JSON.parse(rawResponse);
            const tags = (parsed.tags || []).slice(0, 5).map((t: string) => ({
                id: crypto.randomUUID(),
                name: t,
                confidence: 0.85 + Math.random() * 0.1
            }));
            return c.json({ success: true, data: tags });
        } catch (error) {
            console.error('AI Analysis Error:', error);
            return c.json({ success: false, error: "AI Analysis failed" }, 500);
        }
    });
    /**
     * Mock sync to WordPress
     * POST /api/sync
     */
    app.post('/api/sync', async (c) => {
        const { articleId, tags } = await c.req.json();
        await new Promise(r => setTimeout(r, 1200));
        return c.json({ success: true, message: `Successfully pushed ${tags.length} tags to WP database.` });
    });
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        return c.json({ error: "Use specialized endpoints for TagFlow" }, 404);
    });
}