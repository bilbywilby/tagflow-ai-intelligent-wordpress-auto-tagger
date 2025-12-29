import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { RSSFeed } from '@/data/rssFeeds';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ArrowRight, Rss } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
interface FeedCardProps {
  feed: RSSFeed;
  variant: 'grid' | 'list';
}
export const FeedCard = forwardRef<HTMLDivElement, FeedCardProps>(({ feed, variant }, ref) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const setFeedUrl = useAppStore(s => s.setFeedUrl);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(feed.url);
    setCopied(true);
    toast.success('RSS URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  const handleOpenStudio = () => {
    setFeedUrl(feed.url);
    navigate('/studio');
  };
  if (variant === 'list') {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="group relative"
      >
        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-all shadow-sm">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
            <Rss className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-sm truncate">{feed.title}</h3>
              <Badge variant="outline" className="text-[10px] py-0 h-4 bg-secondary">
                {feed.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{feed.url}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenStudio}>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col border-none shadow-soft group hover:shadow-glow transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2 mb-2">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 font-bold border-none text-[10px] px-2 py-0.5">
              {feed.category}
            </Badge>
            <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Rss className="h-4 w-4 text-indigo-500" />
            </div>
          </div>
          <CardTitle className="text-lg font-bold leading-tight group-hover:text-indigo-600 transition-colors">
            {feed.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {feed.description}
          </p>
          <div className="text-[10px] font-mono text-muted-foreground/60 break-all bg-secondary/30 p-2 rounded-lg border border-input">
            {feed.url}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9 text-xs font-bold gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy URL</>
            )}
          </Button>
          <Button
            className="flex-1 h-9 text-xs font-bold gap-2 bg-indigo-600 hover:bg-indigo-700"
            onClick={handleOpenStudio}
          >
            Studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
});
FeedCard.displayName = "FeedCard";