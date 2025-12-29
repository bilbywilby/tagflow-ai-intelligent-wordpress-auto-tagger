import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { fetchEvents, fetchBriefing, syncHubPro, fetchHubStats } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Sparkles, MapPin, ExternalLink, RefreshCw, Info, Search, Filter, Activity, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { HubLocation } from '@/types/schema';
import { formatDistanceToNow } from 'date-fns';
export function Hub() {
  const events = useAppStore(s => s.events);
  const briefing = useAppStore(s => s.briefing);
  const isSyncing = useAppStore(s => s.isSyncing);
  const hubStats = useAppStore(s => s.hubStats);
  const hubSearchQuery = useAppStore(s => s.hubSearchQuery);
  const hubSelectedLocation = useAppStore(s => s.hubSelectedLocation);
  const setEvents = useAppStore(s => s.setEvents);
  const setBriefing = useAppStore(s => s.setBriefing);
  const setSyncing = useAppStore(s => s.setSyncing);
  const setHubStats = useAppStore(s => s.setHubStats);
  const setHubSearchQuery = useAppStore(s => s.setHubSearchQuery);
  const setHubSelectedLocation = useAppStore(s => s.setHubSelectedLocation);
  const loadHubData = useCallback(async () => {
    try {
      const [eventsData, briefingData, statsData] = await Promise.all([
        fetchEvents(hubSelectedLocation || undefined, undefined, hubSearchQuery),
        fetchBriefing(),
        fetchHubStats()
      ]);
      setEvents(eventsData);
      setBriefing(briefingData);
      setHubStats(statsData);
    } catch (e) {
      toast.error("Failed to load Lehigh Valley intelligence");
    }
  }, [hubSelectedLocation, hubSearchQuery, setEvents, setBriefing, setHubStats]);
  useEffect(() => {
    loadHubData();
  }, [loadHubData]);
  const handleRefresh = async () => {
    setSyncing(true);
    toast.promise(syncHubPro(), {
      loading: 'Running professional regional sync...',
      success: (data) => {
        loadHubData();
        return `Sync complete: Curated ${data.count} items from top sources.`;
      },
      error: 'Intelligence sync failed',
      finally: () => setSyncing(false)
    });
  };
  const locations: (HubLocation | 'All')[] = ['All', 'Allentown', 'Bethlehem', 'Easton', 'Greater LV'];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Intelligence</span>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Lehigh Valley <span className="text-indigo-600">Hub</span>
            </h1>
            <p className="text-muted-foreground text-lg">AI-Powered Regional News & Events Network.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2 text-xs font-bold"
                onClick={loadHubData}
             >
                <Activity className="size-3.5" />
                Latest Stats
             </Button>
             <Button
                onClick={handleRefresh}
                disabled={isSyncing}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw className={isSyncing ? "animate-spin size-4" : "size-4"} />
                {isSyncing ? "Syncing..." : "Pro Sync"}
              </Button>
          </div>
        </header>
        {/* Region Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
           {['Allentown', 'Bethlehem', 'Easton', 'Greater LV'].map((loc) => (
             <Card key={`stat-${loc}`} className="border-none bg-secondary/30 shadow-none">
               <CardContent className="p-4 flex items-center justify-between">
                 <div className="text-xs font-bold text-muted-foreground uppercase">{loc}</div>
                 <div className="text-xl font-display font-bold text-indigo-600">
                   {hubStats?.locations?.[loc] || 0}
                 </div>
               </CardContent>
             </Card>
           ))}
        </div>
        {briefing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-none bg-slate-950 text-white shadow-2xl overflow-hidden relative group rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-transparent opacity-60" />
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="size-48" />
              </div>
              <CardHeader className="relative z-10 p-8 md:p-12 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-indigo-500 text-white border-none px-3 py-1 font-bold">DAILY BRIEFING</Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(briefing.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <CardTitle className="text-4xl md:text-5xl font-display italic tracking-tight mb-4">"Lehigh Valley at a glance..."</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 p-8 md:p-12 pt-0">
                <div className="text-xl md:text-2xl leading-relaxed text-slate-200 max-w-5xl font-light whitespace-pre-line">
                  {briefing.content}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Search local intelligence..."
              className="pl-12 h-14 bg-secondary/40 border-none rounded-2xl text-lg focus-visible:ring-indigo-500/20"
              value={hubSearchQuery}
              onChange={(e) => setHubSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 px-1">
            {locations.map((loc) => (
              <Button
                key={loc}
                variant={hubSelectedLocation === (loc === 'All' ? null : loc) ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setHubSelectedLocation(loc === 'All' ? null : loc)}
                className="rounded-full text-xs font-bold px-5 h-10 shrink-0"
              >
                {loc}
              </Button>
            ))}
          </div>
        </div>
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <TabsList className="bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg px-6">All Feed</TabsTrigger>
              <TabsTrigger value="news" className="rounded-lg px-6">News</TabsTrigger>
              <TabsTrigger value="events" className="rounded-lg px-6">Events</TabsTrigger>
            </TabsList>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3">
              <Clock className="size-3.5" />
              <span>{events.length} Items Live</span>
            </div>
          </div>
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full flex flex-col group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 border-none shadow-soft bg-white dark:bg-slate-900/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="secondary" className="text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 uppercase tracking-wider">
                            {event.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {formatDistanceToNow(new Date(event.eventDate))} ago
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                          {event.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-6">
                        <p className="text-sm text-muted-foreground line-clamp-4 italic leading-relaxed">
                          {event.summary}
                        </p>
                        <div className="space-y-3 pt-6 border-t border-dashed">
                          <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                            <MapPin className="size-4 text-indigo-500" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-6">
                             {event.location}
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button variant="outline" className="w-full h-10 gap-2 text-xs font-bold rounded-xl border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all" asChild>
                          <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                            Read Original <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {events.length === 0 && (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-3xl bg-muted/20 border-muted-foreground/10">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                   <Info className="size-8 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No regional intel found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Try broadening your search or switching to "Greater LV" to see more items.</p>
                <Button variant="link" onClick={() => {setHubSearchQuery(''); setHubSelectedLocation(null);}} className="mt-4 text-indigo-600">
                  Clear all filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <footer className="mt-24 border-t py-12 text-center">
          <div className="flex flex-col items-center gap-6">
             <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
               <Activity className="size-4 text-emerald-500" />
               Regional Intelligence Node Active
             </div>
             <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
               TagFlow AI continuously monitors RSS feeds from WFMZ, Morning Call, and LehighValleyNews. Our specialized intelligence pipeline uses Gemini 2.0 to extract and normalize events, ensuring the Lehigh Valley community stays informed with high-quality, summarized content.
             </p>
             <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">
               Instance ID: {crypto.randomUUID().slice(0, 8)} • Last Sync: {new Date().toLocaleTimeString()}
             </div>
          </div>
        </footer>
      </div>
    </div>
  );
}