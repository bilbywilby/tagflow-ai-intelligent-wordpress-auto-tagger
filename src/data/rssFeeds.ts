export interface RSSFeed {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
}
export const CATEGORIES = [
  "News-Reg/Local", "Food & Drink", "Arts & Events", "Higher Ed", "Sports",
  "Safety", "Gov-Mun/County", "Ed-K12", "Comm/Jobs", "Weather",
  "Environment", "LV Business", "Health", "Outdoors/Utilities", "Culture/Ag/Edu"
] as const;
export type Category = typeof CATEGORIES[number];
export const RSS_FEEDS: RSSFeed[] = [
  // News-Reg/Local
  { id: "lvn-top", title: "LehighValleyNews.com - Top Stories", url: "https://www.lehighvalleynews.com/index.rss", description: "Primary regional news feed for the Lehigh Valley.", category: "News-Reg/Local" },
  { id: "mcall-local", title: "Morning Call Local News", url: "https://www.mcall.com/arcio/rss/category/news/local/", description: "Allentown, Bethlehem, and Easton daily coverage.", category: "News-Reg/Local" },
  { id: "wfmz-top", title: "WFMZ 69 News Top Stories", url: "https://www.wfmz.com/search/?f=rss&t=article&c=news/lehigh-valley", description: "Broadcasting leader for regional news and traffic.", category: "News-Reg/Local" },
  { id: "lehigh-val-live", title: "Lehigh Valley Live", url: "https://www.lehighvalleylive.com/arc/outboundfeeds/rss/", description: "Real-time updates from across the Lehigh Valley area.", category: "News-Reg/Local" },
  // Food & Drink
  { id: "lvn-food", title: "LVN Food & Drink", url: "https://www.lehighvalleynews.com/food-drink.rss", description: "Restaurant reviews and local culinary culture.", category: "Food & Drink" },
  { id: "eat-lv", title: "Eat Lehigh Valley", url: "https://eatlehighvalley.com/feed/", description: "Exploring the best dining spots in the valley.", category: "Food & Drink" },
  { id: "mcall-food", title: "Morning Call Food", url: "https://www.mcall.com/arcio/rss/category/entertainment/dining/", description: "Local restaurant news and recipe highlights.", category: "Food & Drink" },
  // Arts & Events
  { id: "lvn-arts", title: "LVN Arts & Culture", url: "https://www.lehighvalleynews.com/arts-culture.rss", description: "Exhibits, theater, and creative community events.", category: "Arts & Events" },
  { id: "art-lv", title: "ArtsLehighValley", url: "https://artslehighvalley.org/feed/", description: "Comprehensive guide to cultural events in the region.", category: "Arts & Events" },
  { id: "steelstacks", title: "SteelStacks Events", url: "https://www.steelstacks.org/feed/", description: "Bethlehem's premier arts and music venue updates.", category: "Arts & Events" },
  // Higher Ed
  { id: "lehigh-edu", title: "Lehigh University News", url: "https://www2.lehigh.edu/news/rss.xml", description: "Academic research and campus life from Lehigh.", category: "Higher Ed" },
  { id: "lafayette-edu", title: "Lafayette College News", url: "https://news.lafayette.edu/feed/", description: "Updates from the Easton-based liberal arts college.", category: "Higher Ed" },
  { id: "muhlenberg-edu", title: "Muhlenberg College News", url: "https://www.muhlenberg.edu/news/rss.xml", description: "Research and student achievements from Allentown.", category: "Higher Ed" },
  { id: "cedar-crest", title: "Cedar Crest College", url: "https://www.cedarcrest.edu/feed/", description: "Women's college news and community updates.", category: "Higher Ed" },
  // Sports
  { id: "ironpigs", title: "LV IronPigs Baseball", url: "https://www.milb.com/lehigh-valley/feeds/news/rss.xml", description: "Official scores and news for the Triple-A IronPigs.", category: "Sports" },
  { id: "lv-phantoms", title: "Lehigh Valley Phantoms", url: "https://www.phantomshockey.com/feed/", description: "AHL hockey news and schedule updates from Allentown.", category: "Sports" },
  // LV Business
  { id: "lvb-news", title: "Lehigh Valley Business", url: "https://www.lvb.com/feed/", description: "Economic development and commercial real estate.", category: "LV Business" },
  { id: "lvedc", title: "LVEDC Economic News", url: "https://lehighvalley.org/feed/", description: "Regional economic development corporation updates.", category: "LV Business" },
  // Gov-Mun/County
  { id: "allentown-gov", title: "City of Allentown", url: "https://www.allentownpa.gov/News/Press-Releases/Feed", description: "Official municipal announcements from Allentown.", category: "Gov-Mun/County" },
  { id: "bethlehem-gov", title: "City of Bethlehem", url: "https://www.bethlehem-pa.gov/News/Press-Releases/Feed", description: "Government updates from the Christmas City.", category: "Gov-Mun/County" },
  // Weather & Environment
  { id: "lv-weather", title: "WFMZ Weather Alerts", url: "https://www.wfmz.com/search/?f=rss&t=article&c=weather", description: "Real-time weather tracking and alerts for the valley.", category: "Weather" },
  { id: "nature-lv", title: "LV Environment Watch", url: "https://www.lehighvalleynews.com/environment.rss", description: "Climate news and regional conservation efforts.", category: "Environment" }
];