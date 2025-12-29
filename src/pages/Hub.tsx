import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { fetchEvents, fetchBriefing, syncHubPro, fetchHubStats, fetchGeofences, fetchLandmarks } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Sparkles, MapPin, ExternalLink, RefreshCw, Activity, Clock, Search, Navigation, Landmark as LandmarkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { HubLocation, Landmark } from '@/types/schema';
import { formatDistanceToNow } from 'date-fns';
export function Hub() {
  const events = useAppStore(s => s.events);
  const briefing = useAppStore(s => s.briefing);
  const isSyncing = useAppStore(s => s.isSyncing);
  const hubSearchQuery = useAppStore(s => s.hubSearchQuery);
  const hubSelectedLocation = useAppStore(s => s.hubSelectedLocation);
  const hubSelectedNeighborhood = useAppStore(s => s.hubSelectedNeighborhood);
  const geofences = useAppStore(s => s.geofences);
  const setEvents = useAppStore(s => s.setEvents);
  const setBriefing = useAppStore(s => s.setBriefing);
  const setSyncing = useAppStore(s => s.setSyncing);
  const setHubStats = useAppStore(s => s.setHubStats);
  const setHubSearchQuery = useAppStore(s => s.setHubSearchQuery);
  const setHubSelectedLocation = useAppStore(s => s.setHubSelectedLocation);
  const setHubSelectedNeighborhood = useAppStore(s => s.setHubSelectedNeighborhood);
  const setGeofences = useAppStore(s => s.setGeofences);
  const [landmarks, setLandmarks] = React.useState<Landmark[]>([]);
  const [selectedLandmarkId, setSelectedLandmarkId] = React.useState<string | null>(null);
  const loadHubData = React.useCallback(async () => {
    try {
      const [eventsData, briefingData, statsData, geoData, landmarkData] = await Promise.all([
        fetchEvents({ 
          location: hubSelectedLocation, 
          q: hubSearchQuery, 
          neighborhood: hubSelectedNeighborhood || undefined,
          landmarkId: selectedLandmarkId || undefined
        }),
        fetchBriefing(),
        fetchHubStats(),
        fetchGeofences(),
        fetchLandmarks()
      ]);
      setEvents(eventsData);
      setBriefing(briefingData);
      setHubStats(statsData);
      setGeofences(geoData);
      setLandmarks(landmarkData);
    } catch (e) {
      toast.error("Failed to load Lehigh Valley intelligence");
    }
  }, [hubSelectedLocation, hubSearchQuery, hubSelectedNeighborhood, selectedLandmarkId, setEvents, setBriefing, setHubStats, setGeofences]);
  React.useEffect(() => {
    loadHubData();
  }, [loadHubData]);
  const handleRefresh = async () => {
    setSyncing(true);
    toast.promise(syncHubPro(), {
      loading: 'Running professional regional sync...',
      success: (data) => {
        loadHubData();
        return `Sync complete: Curated ${data.count} items.`;
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
               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Spatial Intelligence Live</span>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Lehigh Valley <span className="text-indigo-600">Hub</span>
            </h1>
            <p className="text-muted-foreground text-lg">Real-time regional intelligence and venue alerts.</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw className={isSyncing ? "animate-spin size-4" : "size-4"} />
            {isSyncing ? "Syncing..." : "Pro Sync"}
          </Button>
        </header>
        <div className="space-y-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search Lehigh Valley events & venues..."
                className="pl-12 h-14 bg-secondary/40 border-none rounded-2xl text-lg focus-visible:ring-indigo-500/20"
                value={hubSearchQuery}
                onChange={(e) => setHubSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              {locations.map((loc) => (
                <Button
                  key={loc}
                  variant={hubSelectedLocation === (loc === 'All' ? null : loc) ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setHubSelectedLocation(loc === 'All' ? null : loc);
                    setHubSelectedNeighborhood(null);
                    setSelectedLandmarkId(null);
                  }}
                  className="rounded-full text-xs font-bold px-5 h-10 shrink-0"
                >
                  {loc}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl overflow-hidden">
            <LandmarkIcon className="size-4 text-indigo-500 shrink-0" />
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Button
                variant={selectedLandmarkId === null ? 'outline' : 'ghost'}
                size="sm"
                className="h-8 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                onClick={() => setSelectedLandmarkId(null)}
              >
                All Venues
              </Button>
              {landmarks.map(landmark => (
                <Button
                  key={landmark.id}
                  variant={selectedLandmarkId === landmark.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedLandmarkId(landmark.id)}
                  className="h-8 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                >
                  {landmark.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <TabsList className="bg-secondary/50 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg px-6">Intelligence Feed</TabsTrigger>
              <TabsTrigger value="venues" className="rounded-lg px-6">Venues</TabsTrigger>
            </TabsList>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3">
              <Activity className="size-3.5 text-emerald-500" />
              <span>{events.length} Live Items</span>
            </div>
          </div>
          <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {events.map((event) => {
                const landmark = landmarks.find(l => l.id === event.landmarkId);
                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="h-full flex flex-col group hover:shadow-2xl transition-all duration-500 border-none shadow-soft bg-white dark:bg-slate-900/50 overflow-hidden">
                      <div className="h-1 bg-indigo-500 w-0 group-hover:w-full transition-all duration-500" />
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                              {event.category}
                            </Badge>
                            {landmark && (
                              <Badge variant="outline" className="text-[10px] font-bold border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                                @ {landmark.name}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatDistanceToNow(new Date(event.eventDate))} ago
                          </span>
                        </div>
                        <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6">
                          {event.summary}
                        </p>
                        <div className="space-y-2 pt-4 border-t border-dashed">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <MapPin className="size-3.5 text-indigo-500" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-5 flex justify-between">
                            <span>{event.location} {event.neighborhood ? `• ${event.neighborhood}` : ''}</span>
                            {event.zipCode && <span className="text-indigo-500/50">{event.zipCode}</span>}
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button variant="outline" className="w-full h-11 gap-2 text-xs font-bold rounded-xl border-indigo-100 hover:bg-indigo-50" asChild>
                          <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                            Read Intelligence Report <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}