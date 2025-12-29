import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { fetchEvents, fetchBriefing, triggerCuration } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Sparkles, MapPin, ExternalLink, RefreshCw, Info, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { HubLocation } from '@/types/schema';
export function Hub() {
  const events = useAppStore(s => s.events);
  const briefing = useAppStore(s => s.briefing);
  const isCurating = useAppStore(s => s.isCurating);
  const hubSearchQuery = useAppStore(s => s.hubSearchQuery);
  const hubSelectedLocation = useAppStore(s => s.hubSelectedLocation);
  const setEvents = useAppStore(s => s.setEvents);
  const setBriefing = useAppStore(s => s.setBriefing);
  const setCurating = useAppStore(s => s.setCurating);
  const setHubSearchQuery = useAppStore(s => s.setHubSearchQuery);
  const setHubSelectedLocation = useAppStore(s => s.setHubSelectedLocation);
  const loadHubData = useCallback(async () => {
    try {
      const [eventsData, briefingData] = await Promise.all([
        fetchEvents(hubSelectedLocation || undefined, undefined, hubSearchQuery),
        fetchBriefing()
      ]);
      setEvents(eventsData);
      setBriefing(briefingData);
    } catch (e) {
      toast.error("Failed to load Lehigh Valley intelligence");
    }
  }, [hubSelectedLocation, hubSearchQuery, setEvents, setBriefing]);
  useEffect(() => {
    loadHubData();
  }, [loadHubData]);
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
  const locations: (HubLocation | 'All')[] = ['All', 'Allentown', 'Bethlehem', 'Easton', 'Greater LV'];
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
            className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw className={isCurating ? "animate-spin size-4" : "size-4"} />
            {isCurating ? "Curating..." : "Refresh Intelligence"}
          </Button>
        </header>
        {briefing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <Card className="border-none bg-slate-950 text-white shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent opacity-50" />
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="size-48" />
              </div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-none px-3 py-1 font-bold">DAILY BRIEFING</Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(briefing.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <CardTitle className="text-4xl font-display italic tracking-tight">"Good Morning, Lehigh Valley..."</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-xl leading-relaxed text-slate-200 max-w-4xl font-light">
                  {briefing.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search local events, news, or venues..." 
              className="pl-10 h-12 bg-secondary/30 border-none rounded-xl"
              value={hubSearchQuery}
              onChange={(e) => setHubSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            <Filter className="size-4 text-muted-foreground shrink-0 ml-2" />
            {locations.map((loc) => (
              <Button
                key={loc}
                variant={hubSelectedLocation === (loc === 'All' ? null : loc) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHubSelectedLocation(loc === 'All' ? null : loc)}
                className="rounded-full text-xs font-bold px-4 shrink-0"
              >
                {loc}
              </Button>
            ))}
          </div>
        </div>
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger value="all">All Items</TabsTrigger>
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
              <AnimatePresence mode="popLayout">
                {events.map((event) => (
                  <motion.div 
                    key={event.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="h-full flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-indigo-50/50 dark:border-indigo-950/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-tighter">
                            {event.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {event.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3 italic leading-relaxed">
                          {event.summary}
                        </p>
                        <div className="space-y-2 pt-4 border-t border-dashed">
                          <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                            <MapPin className="size-3.5 text-indigo-500" />
                            <span className="truncate">{event.venue} • {event.location}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0 flex justify-end">
                        <Button variant="ghost" size="sm" asChild className="gap-2 text-xs font-bold group-hover:text-indigo-600">
                          <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                            Source <ExternalLink className="size-3" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {events.length === 0 && (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-3xl bg-muted/20 border-muted-foreground/10">
                <Info className="size-10 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-bold">No items found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <footer className="mt-24 border-t py-12 text-center">
          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
               <Info className="size-4" />
               Automated Regional Intelligence
             </div>
             <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
               The Lehigh Valley Hub uses Gemini-2.0 to scrape and summarize regional news from WFMZ and LehighValleyNews. Sources are updated periodically using our intelligent ingestion pipeline.
             </p>
          </div>
        </footer>
      </div>
    </div>
  );
}