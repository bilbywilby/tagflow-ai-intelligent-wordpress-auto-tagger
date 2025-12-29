import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/store/useAppStore';
import { StudioLayout } from '@/components/layout/StudioLayout';
import { FeedSelector } from '@/components/FeedSelector';
import { ArticleCard } from '@/components/ArticleCard';
import { BatchActions } from '@/components/BatchActions';
import { fetchFeed, analyzeArticle, syncToWP } from '@/lib/api';
import { toast } from 'sonner';
import { TagflowLogo } from '@/components/TagflowLogo';
import { Info, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function TaggingStudio() {
  // 1. Primitive and Shallow Selectors
  const articles = useAppStore(useShallow((s) => s.articles));
  const isLoading = useAppStore((s) => s.isLoading);
  const clearArticles = useAppStore((s) => s.clearArticles);
  const addArticles = useAppStore((s) => s.addArticles);
  const updateArticle = useAppStore((s) => s.updateArticle);
  const setLoading = useAppStore((s) => s.setLoading);
  // 2. Local State
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const handleFetchFeed = async (url: string) => {
    setLoading(true);
    try {
      const fetched = await fetchFeed(url);
      addArticles(fetched);
      toast.success(`Successfully loaded ${fetched.length} new articles`);
    } catch (e) {
      toast.error('Failed to fetch RSS feed. The URL may be invalid or restricted.');
    } finally {
      setLoading(false);
    }
  };
  const handleAnalyze = async (id: string) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    updateArticle(id, { status: 'analyzing' });
    try {
      const tags = await analyzeArticle(article);
      updateArticle(id, { tags, status: 'tagged' });
    } catch (e) {
      updateArticle(id, { status: 'error' });
      throw e;
    }
  };
  const handleSync = async (id: string) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    updateArticle(id, { status: 'syncing' });
    try {
      await syncToWP(id, article.tags);
      updateArticle(id, { status: 'synced' });
    } catch (e) {
      updateArticle(id, { status: 'error' });
      throw e;
    }
  };
  const handleAnalyzeAll = async () => {
    const pending = articles.filter(a => a.status === 'pending');
    if (pending.length === 0) return;
    setIsBatchProcessing(true);
    let successCount = 0;
    for (const article of pending) {
      try {
        await handleAnalyze(article.id);
        successCount++;
      } catch (err) {
        console.error(`Failed to analyze ${article.id}`, err);
      }
    }
    setIsBatchProcessing(false);
    toast.success(`Batch complete: ${successCount} articles analyzed.`);
  };
  const handleSyncAll = async () => {
    const tagged = articles.filter(a => a.status === 'tagged');
    if (tagged.length === 0) return;
    setIsBatchProcessing(true);
    let successCount = 0;
    for (const article of tagged) {
      try {
        await handleSync(article.id);
        successCount++;
      } catch (err) {
        console.error(`Failed to sync ${article.id}`, err);
      }
    }
    setIsBatchProcessing(false);
    toast.success(`Batch complete: ${successCount} articles synced to WP.`);
  };
  const handleRemoveTag = (articleId: string, tagId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    const newTags = article.tags.filter(t => t.id !== tagId);
    updateArticle(articleId, { tags: newTags });
  };
  return (
    <StudioLayout
      header={
        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
          <TagflowLogo />
          <div className="flex-1 flex justify-center w-full">
            <FeedSelector onSelect={handleFetchFeed} isLoading={isLoading} />
          </div>
          {articles.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearArticles} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      }
    >
      {articles.length > 0 && (
        <div className="mb-10">
          <BatchActions
            articles={articles}
            onAnalyzeAll={handleAnalyzeAll}
            onSyncAll={handleSyncAll}
            isProcessing={isBatchProcessing}
          />
        </div>
      )}
      {articles.length === 0 ? (
        <div className="min-h-[500px] flex flex-col items-center justify-center text-center border-2 border-dashed rounded-4xl p-12 bg-muted/20 border-muted-foreground/10">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-8">
            <Info className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Your Tagging Studio is Empty</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Use the directory above to select a Lehigh Valley news feed, or enter a custom WordPress RSS URL to begin your automated tagging workflow.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onAnalyze={() => handleAnalyze(article.id)}
              onSync={() => handleSync(article.id)}
              onRemoveTag={handleRemoveTag}
            />
          ))}
        </div>
      )}
      <footer className="mt-24 border-t py-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-900">
            <ShieldAlert className="h-4 w-4" />
            <span>AI RATE LIMIT WARNING</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please be advised that while TagFlow AI provides advanced content classification capabilities, there is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period.
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">Powered by</p>
            <p className="text-sm font-semibold">Cloudflare Agents & OpenAI Infrastructure</p>
          </div>
        </div>
      </footer>
    </StudioLayout>
  );
}