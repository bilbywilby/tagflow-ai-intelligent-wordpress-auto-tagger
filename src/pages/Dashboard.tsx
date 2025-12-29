import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowUpRight,
  Newspaper
} from 'lucide-react';
import { cn } from '@/lib/utils';
export function Dashboard() {
  const articles = useAppStore(s => s.articles);
  const totalProcessed = articles.length;
  const syncedCount = articles.filter(a => a.status === 'synced').length;
  const pendingCount = articles.filter(a => a.status === 'pending' || a.status === 'tagged').length;
  const syncRate = totalProcessed > 0 ? Math.round((syncedCount / totalProcessed) * 100) : 0;
  const stats = [
    {
      title: "Total Articles",
      value: totalProcessed,
      icon: Newspaper,
      description: "Fetched from RSS feeds",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "Pending Tags",
      value: pendingCount,
      icon: Clock,
      description: "Awaiting analysis/sync",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Sync Success",
      value: `${syncRate}%`,
      icon: CheckCircle2,
      description: "Pushed to WordPress",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "AI Confidence",
      value: "94.2%",
      icon: Zap,
      description: "Average tag accuracy",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/30"
    }
  ];
  const recentActivity = articles
    .filter(a => a.status === 'synced' || a.status === 'tagged')
    .slice(0, 5);
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Overview of your automated content classification pipeline.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-none shadow-soft hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Activity Stream
            </CardTitle>
            <CardDescription>Recent articles tagged and synced to your instance.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.map((article) => (
                  <div key={article.id} className="flex items-start justify-between group">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {article.tags.length} tags identified
                        </span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="text-xs text-muted-foreground">
                          {article.author}
                        </span>
                      </div>
                    </div>
                    <Badge variant={article.status === 'synced' ? "secondary" : "outline"} className={cn(
                      "text-[10px] uppercase font-bold",
                      article.status === 'synced' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-indigo-600 border-indigo-200"
                    )}>
                      {article.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <p className="text-sm">No recent activity found.</p>
                <p className="text-xs">Start by fetching a feed in the studio.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-soft overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="h-32 w-32 text-indigo-500" />
          </div>
          <CardHeader>
            <CardTitle>AI Utilization</CardTitle>
            <CardDescription>Monthly token usage & quotas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span>Monthly Limit</span>
                <span>45%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[45%]" />
              </div>
            </div>
            <div className="pt-4 border-t space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your account is currently using the <strong>Standard Processing Tier</strong>. Automated tagging is optimized for accuracy over speed.
              </p>
              <Badge className="bg-indigo-600 text-white border-none cursor-pointer hover:bg-indigo-700">
                Upgrade Plan
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}