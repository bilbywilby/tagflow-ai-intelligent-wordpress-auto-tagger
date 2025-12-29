import React from 'react';
import { cn } from '@/lib/utils';
interface TagflowLogoProps {
  className?: string;
  showText?: boolean;
}
export function TagflowLogo({ className, showText = true }: TagflowLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-white"
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h10" />
            <path d="m16 16 3 3 3-3" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity hover:opacity-100" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            TagFlow<span className="text-indigo-500">AI</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
            Content Intelligence
          </span>
        </div>
      )}
    </div>
  );
}