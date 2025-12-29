import { motion } from 'framer-motion';
import { Article } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, Loader2, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
interface BatchActionsProps {
  articles: Article[];
  onAnalyzeAll: () => void;
  onSyncAll: () => void;
  isProcessing: boolean;
}
export function BatchActions({ articles, onAnalyzeAll, onSyncAll, isProcessing }: BatchActionsProps) {
  const pendingCount = articles.filter(a => a.status === 'pending').length;
  const taggedCount = articles.filter(a => a.status === 'tagged').length;
  const syncedCount = articles.filter(a => a.status === 'synced').length;
  const total = articles.length;
  const progressPercent = (syncedCount / total) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 shadow-soft"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Batch Intelligence</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="text-muted-foreground">Pending: <span className="text-foreground">{pendingCount}</span></span>
              <span className="text-indigo-500">Ready: <span className="text-foreground">{taggedCount}</span></span>
              <span className="text-emerald-500">Synced: <span className="text-foreground">{syncedCount}</span></span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 w-full max-w-md flex-col gap-2">
           <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
             <span>Sync Progress</span>
             <span>{Math.round(progressPercent)}%</span>
           </div>
           <Progress value={progressPercent} className="h-2 bg-secondary" />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button
            onClick={onAnalyzeAll}
            disabled={isProcessing || pendingCount === 0}
            className="flex-1 lg:flex-none h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-500/20"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze All
          </Button>
          <Button
            variant="outline"
            onClick={onSyncAll}
            disabled={isProcessing || taggedCount === 0}
            className="flex-1 lg:flex-none h-12 px-6 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold gap-2"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Push All
          </Button>
        </div>
      </div>
    </motion.div>
  );
}