import OpenAI from "openai";
import Parser from "rss-parser";
import type { Env } from "./core-utils";
import type { HubEvent, HubLocation, HubCategory, Landmark } from "./types";
import { resolveNeighborhood, extractZipCode } from "./geofences";
import { resolveVenueToLandmark, landmarkToNeighborhood } from "./gazetteer";
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
export async function normalizeContent(openai: OpenAI, title: string, content: string, landmarks: Landmark[]): Promise<{
  summary: string;
  venue: string;
  location: HubLocation;
  neighborhood?: string;
  category: HubCategory;
  zipCode?: string;
  h3Index?: string;
  landmarkId?: string;
}> {
  const prompt = `Extract regional metadata from this Lehigh Valley article.
  Return JSON: { "summary": "2 professional sentences", "venue": "specific landmark or venue name", "location": "Allentown/Bethlehem/Easton/Greater LV", "neighborhood": "specific district", "category": "Family/Nightlife/Arts/News/General" }
  Input: ${title} - ${content.slice(0, 800)}`;
  try {
    const completion = await openai.chat.completions.create({
      model: "google-ai-studio/gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(completion.choices[0].message.content || "{}");
    const zipCode = extractZipCode(`${content} ${title}`);
    const landmark = resolveVenueToLandmark(data.venue || title, landmarks);
    return {
      summary: data.summary || title,
      venue: landmark?.name || data.venue || "Lehigh Valley",
      location: (data.location || "Greater LV") as HubLocation,
      neighborhood: data.neighborhood,
      category: (data.category as HubCategory) || "News",
      zipCode,
      h3Index: landmark?.h3Index,
      landmarkId: landmark?.id
    };
  } catch (e) {
    return { summary: title, venue: "Lehigh Valley", location: "Greater LV", category: "News" };
  }
}
export async function runProSync(env: Env, controller: any) {
  const openai = new OpenAI({ baseURL: env.CF_AI_BASE_URL, apiKey: env.CF_AI_API_KEY });
  let totalIngested = 0;
  const geofences = await controller.listGeofences();
  const landmarks = await controller.listLandmarks();
  for (const source of LEHIGH_VALLEY_SOURCES) {
    try {
      const res = await fetch(source.url);
      if (!res.ok) continue;
      const feed = await parser.parseString(await res.text());
      for (const item of feed.items.slice(0, 10)) {
        const normalized = await normalizeContent(openai, item.title || "", item.contentSnippet || "", landmarks);
        let neighborhood = normalized.neighborhood;
        let neighborhoodId;
        // Enrichment: Landmark -> Neighborhood
        const landmark = landmarks.find((l: any) => l.id === normalized.landmarkId);
        if (landmark && !neighborhood) {
          const enrichedFence = landmarkToNeighborhood(landmark, geofences);
          if (enrichedFence) {
            neighborhood = enrichedFence.name;
            neighborhoodId = enrichedFence.id;
          }
        } else if (neighborhood) {
          const matched = geofences.find((f: any) => f.name.toLowerCase() === neighborhood?.toLowerCase());
          if (matched) neighborhoodId = matched.id;
        }
        const event: HubEvent = {
          id: crypto.randomUUID(),
          title: item.title || "Regional Update",
          venue: normalized.venue,
          location: normalized.location,
          neighborhood,
          neighborhoodId,
          landmarkId: normalized.landmarkId,
          h3Index: normalized.h3Index,
          category: normalized.category,
          summary: normalized.summary,
          eventDate: item.pubDate || new Date().toISOString(),
          sourceUrl: item.link || "",
          createdAt: new Date().toISOString()
        };
        await controller.upsertEvent(event);
        totalIngested++;
        // Rate limiting cooldown
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error("Pro Sync failed for source:", source.name, err);
    }
  }
  return totalIngested;
}