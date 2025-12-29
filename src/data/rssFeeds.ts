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
export const RSS_FEEDS: RSSFeed[] = [
  {
    id: "lvn-general",
    title: "LehighValleyNews.com - Top Stories",
    url: "https://www.lehighvalleynews.com/index.rss",
    description: "Latest news, community updates, and breaking stories from across the Lehigh Valley.",
    category: "News-Reg/Local"
  },
  {
    id: "mcall-news",
    title: "The Morning Call - Local News",
    url: "https://www.mcall.com/arcio/rss/category/news/local/",
    description: "Daily local news coverage from the Allentown, Bethlehem, and Easton regions.",
    category: "News-Reg/Local"
  },
  {
    id: "lvn-food",
    title: "Lehigh Valley Food & Drink",
    url: "https://www.lehighvalleynews.com/food-drink.rss",
    description: "New restaurant openings, reviews, and culinary events in the region.",
    category: "Food & Drink"
  },
  {
    id: "lv-arts",
    title: "Arts & Culture LV",
    url: "https://www.lehighvalleynews.com/arts-culture.rss",
    description: "Exhibitions, theater performances, and creative community highlights.",
    category: "Arts & Events"
  },
  {
    id: "lehigh-univ",
    title: "Lehigh University News",
    url: "https://www2.lehigh.edu/news/rss.xml",
    description: "Research breakthroughs and campus life updates from Lehigh University.",
    category: "Higher Ed"
  },
  {
    id: "lafayette-news",
    title: "Lafayette College News",
    url: "https://news.lafayette.edu/feed/",
    description: "Academics and student achievements from Lafayette College in Easton.",
    category: "Higher Ed"
  },
  {
    id: "ironpigs-news",
    title: "LV IronPigs Baseball",
    url: "https://www.milb.com/lehigh-valley/feeds/news/rss.xml",
    description: "Scores, schedules, and player news for the Lehigh Valley IronPigs.",
    category: "Sports"
  },
  {
    id: "pa-safety",
    title: "PA State Police News",
    url: "https://www.psp.pa.gov/_layouts/15/listfeed.aspx?List={E0C79A7A-6A5E-4B7B-A1A6-1A5A1A5A1A5A}",
    description: "Public safety advisories and news releases for the Eastern PA region.",
    category: "Safety"
  },
  {
    id: "allentown-gov",
    title: "City of Allentown Press Releases",
    url: "https://www.allentownpa.gov/News/Press-Releases/Feed",
    description: "Official municipal updates and announcements from Allentown city government.",
    category: "Gov-Mun/County"
  },
  {
    id: "lv-business",
    title: "Lehigh Valley Business Journal",
    url: "https://www.lvb.com/feed/",
    description: "Economic development, commercial real estate, and corporate news in the valley.",
    category: "LV Business"
  },
  {
    id: "lv-health",
    title: "LVHN Health News",
    url: "https://news.lvhn.org/rss.xml",
    description: "Medical advancements and health wellness tips from Lehigh Valley Health Network.",
    category: "Health"
  }
];