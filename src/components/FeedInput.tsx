import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Rss, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
interface FeedInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
  className?: string;
}
export function FeedInput({ onFetch, isLoading, className }: FeedInputProps) {
  const [url, setUrl] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && url.startsWith('http')) {
      onFetch(url.trim());
    }
  };
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("flex w-full items-center gap-2", className)}
    >
      <div className="relative flex-1 group">
        <Rss className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
        <Input
          type="url"
          placeholder="https://your-blog.com/feed"
          className="pl-10 h-11 bg-secondary/30 focus-visible:ring-indigo-500/30"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !url.trim() || !url.startsWith('http')} 
        className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 transition-all font-bold"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <span>Fetch</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </Button>
    </form>
  );
}