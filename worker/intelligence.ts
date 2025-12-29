import OpenAI from "openai";
import Parser from "rss-parser";
import type { Env } from "./core-utils";
import type { HubEvent, HubLocation, HubCategory } from "./types";
import { resolveNeighborhood, extractZipCode } from "./geofences";
import { latLngToH3, resolveZipToCoords } from "./geofences-h3";
const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']]
  }
});
export const LEHIGH_VALLEY_SOURCES = [
  { name: "WFMZ Lehigh Valley", url: "https://www.wfmz.com/search/?f=rss&t=article&c=news/lehigh-valley", locationHint: "Greater LV", categoryPreference: "News" },
  { name: "Lehigh Valley News Top", url: "https://www.lehighvalleynews.com/index.rss", locationHint: "Greater LV", categoryPreference: "General" },
  { name: "Discover Lehigh Valley", url: "https://www.discoverlehighvalley.com/blog/rss/", locationHint: "Greater LV", categoryPreference: "Arts" }
];
export async function normalizeContent(openai: OpenAI, title: string, content: string): Promise<{
  summary: string;
  venue: string;
  location: HubLocation;
  neighborhood?: string;
  category: HubCategory;
  zipCode?: string;
  h3Index?: string;
}> {
  const prompt = `Act as a Lehigh Valley Regional Analyst.
  Extract structured metadata.
  Rules:
  1. Summary MUST be 2 professional sentences.
  2. Location MUST be: Allentown, Bethlehem, Easton, Greater LV.
  3. Category: Family, Nightlife, Arts, News, General.
  Input: ${title} - ${content.slice(0, 500)}
  Return JSON: { "summary": "string", "venue": "string", "location": "string", "neighborhood": "string", "category": "string" }`;
  try {
    const completion = await openai.chat.completions.create({
      model: "google-ai-studio/gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(completion.choices[0].message.content || "{}");
    const zipCode = extractZipCode(`${content} ${title}`);
    // Spatial Resolution
    let h3Index;
    if (zipCode) {
      const coords = resolveZipToCoords(zipCode);
      if (coords) h3Index = latLngToH3(coords[0], coords[1], 9);
    }
    return {
      summary: data.summary || title,
      venue: data.venue || "Lehigh Valley",
      location: (data.location || "Greater LV") as HubLocation,
      neighborhood: data.neighborhood,
      category: (data.category as HubCategory) || "News",
      zipCode,
      h3Index
    };
  } catch (e) {
    return { summary: title, venue: "Lehigh Valley", location: "Greater LV", category: "News" };
  }
}
export async function runProSync(env: Env, controller: any) {
  const openai = new OpenAI({ baseURL: env.CF_AI_BASE_URL, apiKey: env.CF_AI_API_KEY });
  let totalIngested = 0;
  const geofences = await controller.listGeofences();
  for (const source of LEHIGH_VALLEY_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) continue;
      const feed = await parser.parseString(await res.text());
      for (const item of feed.items.slice(0, 5)) {
        const normalized = await normalizeContent(openai, item.title || "", item.contentSnippet || "");
        // Find Neighborhood ID via Spatial or Text Fallback
        let neighborhoodId;
        if (normalized.neighborhood) {
          const matched = geofences.find((f: any) => f.name.toLowerCase() === normalized.neighborhood?.toLowerCase());
          if (matched) neighborhoodId = matched.id;
        }
        const event: HubEvent = {
          id: crypto.randomUUID(),
          title: item.title || "Update",
          venue: normalized.venue,
          location: normalized.location,
          neighborhood: normalized.neighborhood,
          neighborhoodId,
          h3Index: normalized.h3Index,
          category: normalized.category,
          summary: normalized.summary,
          eventDate: item.pubDate || new Date().toISOString(),
          sourceUrl: item.link || "",
          createdAt: new Date().toISOString()
        };
        await controller.upsertEvent(event);
        totalIngested++;
      }
    } catch (err) {}
  }
  return totalIngested;
}