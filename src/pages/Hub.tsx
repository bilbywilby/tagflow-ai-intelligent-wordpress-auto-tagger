import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { fetchEvents, fetchBriefing, syncHubPro, fetchHubStats, fetchGeofences, fetchLandmarks } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Sparkles, MapPin, ExternalLink, RefreshCw, Activity, Search, Landmark as LandmarkIcon, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { HubLocation, Landmark, HubEvent } from '@/types/schema';
import { formatDistanceToNow } from 'date-fns';
export function Hub() {
  const events = useAppStore(s => s.events);
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
  const getTrendingLandmarks = () => {
    const counts: Record<string, number> = {};
    events.forEach(e => {
      if (e.landmarkId) counts[e.landmarkId] = (counts[e.landmarkId] || 0) + 1;
    });
    return Object.entries(counts).filter(([_, count]) => count >= 2).map(([id]) => id);
  };
  const trendingIds = React.useMemo(() => getTrendingLandmarks(), [events]);
  const locations: (HubLocation | 'All')[] = ['All', 'Allentown', 'Bethlehem', 'Easton', 'Greater LV'];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Lehigh Valley <span className="text-indigo-600">Hub</span>
            </h1>
            <p className="text-muted-foreground text-lg">Spatial Intelligence for local events and news.</p>
          </div>
          <Button onClick={handleRefresh} disabled={isSyncing} className="bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className={isSyncing ? "animate-spin size-4 mr-2" : "size-4 mr-2"} />
            Pro Sync
          </Button>
        </header>
        <div className="space-y-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events or venues..."
                className="pl-10 h-12 rounded-xl"
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
                  onClick={() => setHubSelectedLocation(loc === 'All' ? null : loc)}
                  className="rounded-full px-4 h-10 shrink-0"
                >
                  {loc}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Tabs defaultValue="feed" className="space-y-8">
          <TabsList className="bg-secondary p-1 rounded-xl">
            <TabsTrigger value="feed" className="rounded-lg">Intelligence Feed</TabsTrigger>
            <TabsTrigger value="districts" className="rounded-lg">Neighborhoods</TabsTrigger>
          </TabsList>
          <TabsContent value="feed" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {events.map((event) => {
                const landmark = landmarks.find(l => l.id === event.landmarkId);
                const isTrending = event.landmarkId && trendingIds.includes(event.landmarkId);
                return (
                  <motion.div key={event.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="h-full flex flex-col group border-none shadow-soft hover:shadow-glow transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                            {event.category}
                          </Badge>
                          {isTrending && (
                            <Badge className="bg-orange-500 text-white border-0 text-[10px] animate-pulse">
                              <TrendingUp className="size-3 mr-1" /> TRENDING VENUE
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold leading-tight group-hover:text-indigo-600">
                          {event.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-6">{event.summary}</p>
                        <div className="space-y-2 pt-4 border-t border-dashed">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <MapPin className="size-3.5 text-indigo-500" />
                            <span>{event.venue}</span>
                          </div>
                          {landmark && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-5 uppercase font-bold tracking-widest">
                              <LandmarkIcon className="size-3" />
                              <span>{landmark.category} Landmark</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button variant="outline" className="w-full rounded-xl" asChild>
                          <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                            View Details <ExternalLink className="size-3.5 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="districts" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {geofences.map(fence => (
              <Card key={fence.id} className="cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => {
                setHubSelectedLocation(fence.canonicalPlace);
                setHubSelectedNeighborhood(fence.name);
              }}>
                <CardHeader>
                  <CardTitle className="text-lg">{fence.name}</CardTitle>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">
                    {fence.canonicalPlace} • {fence.zipCodes.join(', ')}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}