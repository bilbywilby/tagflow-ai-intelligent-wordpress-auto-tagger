import OpenAI from "openai";
import Parser from "rss-parser";
import type { Env } from "./core-utils";
import type { HubEvent, HubLocation, HubCategory } from "./types";
const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']]
  }
});
export const LEHIGH_VALLEY_SOURCES = [
  { 
    name: "WFMZ Lehigh Valley", 
    url: "https://www.wfmz.com/search/?f=rss&t=article&c=news/lehigh-valley",
    locationHint: "Greater LV" as HubLocation,
    categoryPreference: "News" as HubCategory
  },
  { 
    name: "Lehigh Valley News Top", 
    url: "https://www.lehighvalleynews.com/index.rss",
    locationHint: "Greater LV" as HubLocation,
    categoryPreference: "General" as HubCategory
  },
  {
    name: "Discover Lehigh Valley",
    url: "https://www.discoverlehighvalley.com/blog/rss/",
    locationHint: "Greater LV" as HubLocation,
    categoryPreference: "Arts" as HubCategory
  }
];
export async function normalizeContent(openai: OpenAI, title: string, content: string): Promise<{ 
  summary: string; 
  venue: string; 
  location: HubLocation; 
  category: HubCategory;
}> {
  const prompt = `Act as a Lehigh Valley Regional Analyst. 
  Extract structured metadata from this news snippet. 
  Rules:
  1. Summary MUST be exactly 2 professional sentences.
  2. Location MUST be one of: Allentown, Bethlehem, Easton, Greater LV.
  3. Category MUST be one of: Family, Nightlife, Arts, News, General.
  4. Venue should be the specific place (e.g., "PPL Center", "SteelStacks") or "Various Locations".
  Input Title: ${title}
  Input Content: ${content.slice(0, 800)}
  Return ONLY JSON: { "summary": "string", "venue": "string", "location": "string", "category": "string" }`;
  try {
    const completion = await openai.chat.completions.create({
      model: "google-ai-studio/gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      summary: data.summary || "Regional update from the Lehigh Valley area.",
      venue: data.venue || "Lehigh Valley",
      location: (data.location as HubLocation) || "Greater LV",
      category: (data.category as HubCategory) || "News"
    };
  } catch (e) {
    console.error("AI Normalization failed:", e);
    return {
      summary: title,
      venue: "Lehigh Valley",
      location: "Greater LV",
      category: "News"
    };
  }
}
export async function runProSync(env: Env, controller: any) {
  const openai = new OpenAI({ baseURL: env.CF_AI_BASE_URL, apiKey: env.CF_AI_API_KEY });
  let totalIngested = 0;
  for (const source of LEHIGH_VALLEY_SOURCES) {
    try {
      const res = await fetch(source.url, { headers: { 'User-Agent': 'TagFlow Pro 2.0' } });
      if (!res.ok) continue;
      const feed = await parser.parseString(await res.text());
      const items = feed.items.slice(0, 5);
      for (const item of items) {
        const normalized = await normalizeContent(openai, item.title || "", item.contentSnippet || item.content || "");
        const event: HubEvent = {
          id: crypto.randomUUID(),
          title: item.title || "Untitled Update",
          venue: normalized.venue,
          location: normalized.location,
          category: normalized.category,
          summary: normalized.summary,
          eventDate: item.pubDate || new Date().toISOString(),
          sourceUrl: item.link || "",
          createdAt: new Date().toISOString()
        };
        await controller.upsertEvent(event);
        totalIngested++;
      }
    } catch (err) {
      console.error(`Failed to sync source ${source.name}:`, err);
    }
  }
  return totalIngested;
}