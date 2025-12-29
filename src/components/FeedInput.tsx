import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Rss, Loader2 } from 'lucide-react';
interface FeedInputProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
}
export function FeedInput({ onFetch, isLoading }: FeedInputProps) {
  const [url, setUrl] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onFetch(url.trim());
  };
  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl items-center space-x-2">
      <div className="relative flex-1">
        <Rss className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="url"
          placeholder="Enter WordPress RSS Feed URL..."
          className="pl-10"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !url.trim()} className="min-w-[100px]">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch Feed'}
      </Button>
    </form>
  );
}