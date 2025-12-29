import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search, Rss, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RSS_FEEDS, CATEGORIES, RSSFeed } from '@/data/rssFeeds';
import { FeedInput } from './FeedInput';
interface FeedSelectorProps {
  onSelect: (url: string) => void;
  isLoading: boolean;
}
export function FeedSelector({ onSelect, isLoading }: FeedSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  return (
    <div className="flex items-center gap-2 w-full max-w-xl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-secondary/50 border-input h-11"
            disabled={isLoading}
          >
            <div className="flex items-center gap-2 truncate">
              <Rss className="h-4 w-4 text-indigo-500" />
              <span className="truncate">
                {selectedFeed ? selectedFeed.title : "Select an RSS Feed..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="max-h-[450px]">
            <CommandInput placeholder="Search Lehigh Valley feeds..." />
            <CommandList>
              <CommandEmpty>No feed found.</CommandEmpty>
              {CATEGORIES.map((category) => {
                const categoryFeeds = RSS_FEEDS.filter(f => f.category === category);
                if (categoryFeeds.length === 0) return null;
                return (
                  <CommandGroup key={category} heading={category}>
                    {categoryFeeds.map((feed) => (
                      <CommandItem
                        key={feed.id}
                        value={feed.title}
                        onSelect={() => {
                          setSelectedFeed(feed);
                          onSelect(feed.url);
                          setOpen(false);
                          setShowCustom(false);
                        }}
                        className="flex flex-col items-start gap-0.5 py-3 cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{feed.title}</span>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4 text-indigo-500",
                              selectedFeed?.id === feed.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {feed.description}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setShowCustom(true);
                    setOpen(false);
                  }}
                  className="cursor-pointer py-3 text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Enter Custom URL Fallback
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showCustom && (
        <div className="flex-1 animate-in slide-in-from-left-2 duration-200">
          <FeedInput 
            onFetch={(url) => {
              onSelect(url);
              setSelectedFeed({ id: 'custom', title: 'Custom Feed', url, description: url, category: 'Custom' });
            }} 
            isLoading={isLoading} 
          />
        </div>
      )}
    </div>
  );
}