import React from 'react';
interface StudioLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
}
export function StudioLayout({ children, header }: StudioLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {header}
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}