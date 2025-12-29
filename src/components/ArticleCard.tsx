import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, X, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { Article, Tag } from '@/types/schema';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
interface ArticleCardProps {
  article: Article;
  onAnalyze: (id: string) => void;
  onSync: (id: string) => void;
  onRemoveTag: (articleId: string, tagId: string) => void;
}
export const ArticleCard = forwardRef<HTMLDivElement, ArticleCardProps>(({ article, onAnalyze, onSync, onRemoveTag }, ref) => {
  const isAnalyzing = article.status === 'analyzing';
  const isTagged = article.status === 'tagged';
  const isSyncing = article.status === 'syncing';
  const isSynced = article.status === 'synced';
  const isError = article.status === 'error';
  const copyToClipboard = () => {
    navigator.clipboard.writeText(article.url);
    toast.success('Link copied to clipboard');
  };
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(isAnalyzing && "animate-pulse")}
    >
      <Card className={cn(
        "h-full flex flex-col transition-all duration-500 overflow-hidden border-2",
        isAnalyzing && "border-indigo-500/50 shadow-glow",
        isSynced && "bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-500/30 shadow-none"
      )}>
        <CardHeader className="pb-3 relative group">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {article.title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
               {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
             </span>
             {isSynced && <Badge variant="secondary" className="bg-emerald-500 text-white border-0 text-[10px] px-1.5 h-4">SYNCED</Badge>}
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-6 italic leading-relaxed">
            {article.excerpt}
          </p>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[44px]">
              <AnimatePresence mode="popLayout">
                {article.tags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="relative"
                  >
                    <Badge className={cn(
                      "group py-1.5 px-3 flex items-center gap-2 border shadow-sm transition-all",
                      isSynced ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400"
                    )}>
                      {tag.name}
                      {!isSynced && (
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => onRemoveTag(article.id, tag.id)}
                        />
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {article.tags.length === 0 && !isAnalyzing && (
                <div className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest flex items-center">
                  Awaiting Intelligence...
                </div>
              )}
            </div>
            {(isTagged || isSynced) && article.tags.length > 0 && (
              <div className="pt-2">
                 <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase mb-1">
                   <span>AI Confidence</span>
                   <span>92%</span>
                 </div>
                 <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: '92%' }}
                     className="h-full bg-indigo-500"
                   />
                 </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t bg-secondary/20 flex justify-between items-center gap-3">
          {isError ? (
            <div className="flex items-center text-destructive text-xs font-semibold gap-1.5">
              <AlertCircle className="h-4 w-4" />
              <span>Pipeline Error</span>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-muted-foreground truncate">
              ID: {article.id.split('-')[0]}
            </div>
          )}
          <div className="flex gap-2">
            {!isSynced && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAnalyze(article.id)}
                disabled={isAnalyzing || isSyncing}
                className="gap-2 h-9 text-xs font-bold border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-indigo-900 dark:hover:bg-indigo-950"
              >
                <Sparkles className={cn("h-3.5 w-3.5", isAnalyzing ? "animate-spin" : "text-indigo-500")} />
                {isAnalyzing ? 'Thinking...' : 'Analyze'}
              </Button>
            )}
            {(isTagged || isSynced) && (
              <Button
                variant={isSynced ? "ghost" : "default"}
                size="sm"
                onClick={() => onSync(article.id)}
                disabled={isSyncing || isSynced}
                className={cn(
                  "gap-2 h-9 text-xs font-bold transition-all shadow-sm",
                  !isSynced && "bg-emerald-600 hover:bg-emerald-700 text-white",
                  isSynced && "text-emerald-600 bg-emerald-100/50"
                )}
              >
                {isSyncing ? (
                  <Send className="h-3.5 w-3.5 animate-bounce" />
                ) : isSynced ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isSyncing ? 'Syncing...' : isSynced ? 'Success' : 'Push to WP'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});
ArticleCard.displayName = "ArticleCard";