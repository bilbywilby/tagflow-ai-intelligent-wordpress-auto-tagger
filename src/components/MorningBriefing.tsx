import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Zap } from 'lucide-react';
import { MorningBriefing as MorningBriefingType } from '@/types/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
interface MorningBriefingProps {
  briefing: MorningBriefingType | null;
  isLoading: boolean;
}
export function MorningBriefing({ briefing, isLoading }: MorningBriefingProps) {
  if (isLoading) {
    return (
      <Card className="border-none shadow-soft overflow-hidden mb-12">
        <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <CardContent className="bg-background rounded-[calc(var(--radius)-1px)] p-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }
  if (!briefing) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-12"
    >
      <Card className="relative border-none shadow-soft overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 group-hover:opacity-100 opacity-80">
          <CardContent className="relative bg-background dark:bg-slate-950 rounded-[calc(var(--radius)-1px)] p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                    <Sparkles className="size-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                      Daily Intelligence Report
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar className="size-3" />
                      {new Date(briefing.date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-display font-medium leading-relaxed text-foreground/90">
                  {briefing.content}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-none px-3 py-1 font-bold">
                    <Zap className="size-3 mr-1.5 fill-current" />
                    {briefing.highlightCount} Regional Highlights
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter px-3">
                    AI Synthetic Summary
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}