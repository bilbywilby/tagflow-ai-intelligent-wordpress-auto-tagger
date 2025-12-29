import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Globe, 
  Key, 
  Sparkles, 
  Zap, 
  Save, 
  Settings as SettingsIcon,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
export function Settings() {
  const settings = useAppStore(s => s.settings);
  const updateSettings = useAppStore(s => s.updateSettings);
  const [localSettings, setLocalSettings] = React.useState(settings);
  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Settings updated successfully');
  };
  return (
    <div className="space-y-10 animate-fade-in max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">Manage your connection strings and AI behavior defaults.</p>
      </div>
      <div className="grid gap-8">
        <Card className="border-none shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-500" />
              WordPress Instance
            </CardTitle>
            <CardDescription>Configure the endpoint and credentials for content synchronization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wp-url">REST API Root URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="wp-url"
                  className="pl-10"
                  value={localSettings.wpApiUrl} 
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, wpApiUrl: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wp-key">Application Password / API Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="wp-key"
                  type="password"
                  className="pl-10"
                  placeholder="��•••••••••••••••"
                  value={localSettings.wpApiKey}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, wpApiKey: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Automatic Synchronization</Label>
                <p className="text-xs text-muted-foreground">Push tags immediately after AI analysis without review.</p>
              </div>
              <Switch 
                checked={localSettings.autoSync}
                onCheckedChange={(val) => setLocalSettings(prev => ({ ...prev, autoSync: val }))}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              AI Intelligence Profile
            </CardTitle>
            <CardDescription>Customize the prompting logic used for tag generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Analysis System Prompt</Label>
              <Textarea 
                id="ai-prompt"
                className="min-h-[120px] leading-relaxed"
                value={localSettings.aiPrompt}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, aiPrompt: e.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground italic">
                Pro tip: Be specific about the number of tags and preferred SEO keywords.
              </p>
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-3 block">Processing Model</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl bg-accent/50 border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-indigo-500" />
                    <span className="font-bold text-sm">Gemini 2.0 Flash</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Optimized for speed and efficiency. Best for large feeds.</p>
                </div>
                <div className="p-4 border rounded-xl opacity-50 grayscale cursor-not-allowed">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="font-bold text-sm">Gemini 1.5 Pro</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Deep analysis for long-form content. Enterprise only.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}