import { Hono } from "hono";
import { Env } from "./core-utils";
import OpenAI from "openai";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    /**
     * Fetch and parse RSS Feed
     * POST /api/rss/fetch
     */
    app.post('/api/rss/fetch', async (c) => {
        try {
            const { url } = await c.req.json();
            if (!url) return c.json({ success: false, error: "URL is required" }, 400);
            const response = await fetch(url);
            const xml = await response.text();
            // Simple XML to JSON parser for RSS (Mocking complex logic since rss-parser might be external)
            // In production, we'd use a robust library.
            const items: any[] = [];
            const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
            for (const match of itemMatches) {
                const content = match[1];
                const title = content.match(/<title>(.*?)<\/title>/)?.[1] || "Untitled";
                const link = content.match(/<link>(.*?)<\/link>/)?.[1] || "";
                const description = content.match(/<description>(.*?)<\/description>/)?.[1] || "";
                const pubDate = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
                items.push({
                    id: crypto.randomUUID(),
                    title: title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1'),
                    url: link,
                    excerpt: description.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').slice(0, 160) + "...",
                    content: description,
                    publishedDate: pubDate,
                    tags: [],
                    status: 'pending'
                });
            }
            return c.json({ success: true, data: items.slice(0, 15) });
        } catch (error) {
            return c.json({ success: false, error: "Failed to fetch RSS feed" }, 500);
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
            const prompt = `Analyze the following blog post and suggest 5 relevant SEO tags. 
            Return ONLY a JSON array of strings. 
            Title: ${title}
            Content: ${content.slice(0, 2000)}`;
            const completion = await openai.chat.completions.create({
                model: "google-ai-studio/gemini-2.5-flash",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });
            const rawResponse = completion.choices[0].message.content || "[]";
            let tags: string[] = [];
            try {
                const parsed = JSON.parse(rawResponse);
                tags = Array.isArray(parsed) ? parsed : (parsed.tags || []);
            } catch (e) {
                // Fallback for non-standard JSON
                const matches = rawResponse.match(/"([^"]+)"/g);
                tags = matches ? matches.map(m => m.replace(/"/g, '')) : [];
            }
            const formattedTags = tags.map(t => ({
                id: crypto.randomUUID(),
                name: t,
                confidence: 0.9
            }));
            return c.json({ success: true, data: formattedTags });
        } catch (error) {
            return c.json({ success: false, error: "AI Analysis failed" }, 500);
        }
    });
    /**
     * Mock sync to WordPress
     * POST /api/sync
     */
    app.post('/api/sync', async (c) => {
        const { articleId, tags } = await c.req.json();
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1000));
        return c.json({ success: true, message: `Synced ${tags.length} tags to WP for article ${articleId}` });
    });
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        // Core chat functionality preserved
        return c.json({ error: "Use specialized endpoints for TagFlow" }, 404);
    });
}