import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { StudioLayout } from '@/components/layout/StudioLayout';
import { FeedInput } from '@/components/FeedInput';
import { ArticleCard } from '@/components/ArticleCard';
import { fetchFeed, analyzeArticle, syncToWP } from '@/lib/api';
import { toast } from 'sonner';
import { TagflowLogo } from '@/components/TagflowLogo';
import { Info } from 'lucide-react';
export default function TaggingStudio() {
  const articles = useAppStore((s) => s.articles);
  const isLoading = useAppStore((s) => s.isLoading);
  const setArticles = useAppStore((s) => s.setArticles);
  const addArticles = useAppStore((s) => s.addArticles);
  const updateArticle = useAppStore((s) => s.updateArticle);
  const setLoading = useAppStore((s) => s.setLoading);
  const handleFetchFeed = async (url: string) => {
    setLoading(true);
    try {
      const fetched = await fetchFeed(url);
      addArticles(fetched);
      toast.success(`Fetched ${fetched.length} articles from feed`);
    } catch (e) {
      toast.error('Failed to fetch RSS feed. Please check the URL.');
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
      toast.success('AI tags generated');
    } catch (e) {
      updateArticle(id, { status: 'error' });
      toast.error('AI Analysis failed');
    }
  };
  const handleSync = async (id: string) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    updateArticle(id, { status: 'syncing' });
    try {
      await syncToWP(id, article.tags);
      updateArticle(id, { status: 'synced' });
      toast.success('Synced to WordPress');
    } catch (e) {
      updateArticle(id, { status: 'error' });
      toast.error('Sync failed');
    }
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
        <>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
              <span className="font-bold text-xl">TF</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TagFlow Studio</h1>
              <p className="text-sm text-muted-foreground">Automated WordPress Taxonomy Intelligence</p>
            </div>
          </div>
          <FeedInput onFetch={handleFetchFeed} isLoading={isLoading} />
        </>
      }
    >
      {articles.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed rounded-3xl p-12 bg-muted/30">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Articles Loaded</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter a WordPress RSS feed URL above to begin. We'll fetch your latest posts and help you generate intelligent tags.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard 
              key={article.id}
              article={article}
              onAnalyze={handleAnalyze}
              onSync={handleSync}
              onRemoveTag={handleRemoveTag}
            />
          ))}
        </div>
      )}
      <footer className="mt-20 border-t pt-8 text-center text-sm text-muted-foreground">
        <p>Although this project has AI capabilities, there is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period.</p>
        <p className="mt-2">Powered by Cloudflare Agents & OpenAI</p>
      </footer>
    </StudioLayout>
  );
}