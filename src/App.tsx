import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import TaggingStudio from '@/pages/TaggingStudio';
export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />
      <TaggingStudio />
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}