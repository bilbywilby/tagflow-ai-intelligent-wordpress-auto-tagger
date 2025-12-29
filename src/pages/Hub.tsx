import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { fetchEvents, fetchBriefing, triggerCuration } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, MapPin, Calendar, ExternalLink, RefreshCw, Newspaper, Info } from 'lucide-react';
import { toast } from 'sonner';
export function Hub() {
  const events = useAppStore(s => s.events);
  const briefing = useAppStore(s => s.briefing);
  const isCurating = useAppStore(s => s.isCurating);
  const setEvents = useAppStore(s => s.setEvents);
  const setBriefing = useAppStore(s => s.setBriefing);
  const setCurating = useAppStore(s => s.setCurating);
  useEffect(() => {
    loadHubData();
  }, []);
  const loadHubData = async () => {
    try {
      const [eventsData, briefingData] = await Promise.all([
        fetchEvents(),
        fetchBriefing()
      ]);
      setEvents(eventsData);
      setBriefing(briefingData);
    } catch (e) {
      toast.error("Failed to load Lehigh Valley intelligence");
    }
  };
  const handleCurate = async () => {
    setCurating(true);
    toast.promise(triggerCuration(), {
      loading: 'Scraping regional sources...',
      success: (data) => {
        loadHubData();
        return `Successfully curated ${data.count} items`;
      },
      error: 'Curation failed',
      finally: () => setCurating(false)
    });
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Lehigh Valley <span className="text-indigo-600">Hub</span>
            </h1>
            <p className="text-muted-foreground text-lg">Your AI-curated regional intelligence dashboard.</p>
          </div>
          <Button 
            onClick={handleCurate} 
            disabled={isCurating}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2"
          >
            <RefreshCw className={isCurating ? "animate-spin size-4" : "size-4"} />
            {isCurating ? "Curating..." : "Refresh Intelligence"}
          </Button>
        </header>
        {briefing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-none bg-slate-900 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="size-32" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-indigo-500 text-white border-none">DAILY BRIEFING</Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(briefing.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <CardTitle className="text-3xl font-display italic">"Good Morning, Lehigh Valley..."</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-slate-200 max-w-4xl">
                  {briefing.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger value="all">All Content</TabsTrigger>
              <TabsTrigger value="news">Local News</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {events.length} Live Items
            </div>
          </div>
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <motion.div key={event.id} layout>
                  <Card className="h-full flex flex-col group hover:shadow-lg transition-all border-indigo-50/50 dark:border-indigo-950/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] font-bold border-indigo-100 text-indigo-600 uppercase">
                          {event.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3 italic">
                        {event.summary}
                      </p>
                      <div className="space-y-2 pt-4 border-t border-dashed">
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                          <MapPin className="size-3.5 text-indigo-500" />
                          {event.venue} • {event.location}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 flex justify-end">
                      <Button variant="ghost" size="sm" asChild className="gap-2 text-xs font-bold">
                        <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                          Source <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        <footer className="mt-24 border-t py-12 text-center">
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
               <Info className="size-4" />
               Automated Regional Intelligence
             </div>
             <p className="text-sm text-muted-foreground max-w-xl">
               The Lehigh Valley Hub uses Gemini-2.0 to scrape and summarize regional news from WFMZ and LehighValleyNews. Sources are updated every 24 hours.
             </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}