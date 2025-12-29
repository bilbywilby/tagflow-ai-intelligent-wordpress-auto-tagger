import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Send, X, AlertCircle } from 'lucide-react';
import { Article, Tag } from '@/types/schema';
import { cn } from '@/lib/utils';
interface ArticleCardProps {
  article: Article;
  onAnalyze: (id: string) => void;
  onSync: (id: string) => void;
  onRemoveTag: (articleId: string, tagId: string) => void;
}
export function ArticleCard({ article, onAnalyze, onSync, onRemoveTag }: ArticleCardProps) {
  const isPending = article.status === 'pending';
  const isAnalyzing = article.status === 'analyzing';
  const isTagged = article.status === 'tagged';
  const isSyncing = article.status === 'syncing';
  const isSynced = article.status === 'synced';
  const isError = article.status === 'error';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "h-full flex flex-col transition-all duration-300",
        isAnalyzing && "ring-2 ring-primary/20",
        isSynced && "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900"
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {article.title}
            </CardTitle>
            {isSynced && <Check className="h-5 w-5 text-emerald-500 shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {article.publishedDate ? new Date(article.publishedDate).toLocaleDateString() : 'Unknown date'}
          </p>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {article.excerpt}
          </p>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            <AnimatePresence>
              {article.tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge variant="secondary" className="group py-1 px-2 flex items-center gap-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900">
                    {tag.name}
                    {!isSynced && (
                      <X 
                        className="h-3 w-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={() => onRemoveTag(article.id, tag.id)}
                      />
                    )}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            {isPending && <div className="text-xs text-muted-foreground italic flex items-center h-8">No tags yet...</div>}
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t flex justify-between gap-2">
          {isError ? (
            <div className="flex items-center text-destructive text-xs gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to process</span>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex gap-2">
            {!isSynced && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAnalyze(article.id)}
                disabled={isAnalyzing || isSyncing}
                className="gap-1.5 h-8 text-xs"
              >
                {isAnalyzing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </motion.div>
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                )}
                Auto-Tag
              </Button>
            )}
            {(isTagged || isSynced) && (
              <Button 
                variant={isSynced ? "ghost" : "default"}
                size="sm" 
                onClick={() => onSync(article.id)}
                disabled={isSyncing || isSynced}
                className={cn("gap-1.5 h-8 text-xs", !isSynced && "bg-emerald-600 hover:bg-emerald-700")}
              >
                {isSyncing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Send className="h-3.5 w-3.5" />
                  </motion.div>
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isSynced ? 'Synced' : 'Sync to WP'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}