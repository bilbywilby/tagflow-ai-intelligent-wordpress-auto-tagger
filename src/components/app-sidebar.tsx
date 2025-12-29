import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Settings,
  BookOpen,
  Info,
  ChevronRight,
  Hash
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TagflowLogo } from "@/components/TagflowLogo";
import { cn } from "@/lib/utils";
import { CATEGORIES, RSS_FEEDS } from "@/data/rssFeeds";
import { useAppStore } from "@/store/useAppStore";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const selectedCategory = useAppStore(s => s.selectedCategory);
  const setSelectedCategory = useAppStore(s => s.setSelectedCategory);
  const getFeedCount = (category: string) => {
    return RSS_FEEDS.filter(f => f.category === category).length;
  };
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="py-4 px-4">
        <TagflowLogo className="group-data-[collapsible=icon]:scale-75 origin-left transition-transform" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Explorer
          </SidebarGroupLabel>
          <SidebarMenu className="px-2 mt-2 gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/"}
                className={cn(
                  "h-11 px-3 rounded-xl transition-all",
                  location.pathname === "/" && !selectedCategory ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold" : ""
                )}
                onClick={() => setSelectedCategory(null)}
              >
                <Link to="/">
                  <LayoutDashboard className="size-5" />
                  <span>Full Directory</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="h-11 px-3 rounded-xl hover:bg-accent/50">
                    <Hash className="size-5 text-muted-foreground" />
                    <span>Categories</span>
                    <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-1 mt-1 pl-4 pr-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          // Ensure we're on the dashboard
                          if(location.pathname !== "/") window.location.href = "/";
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left",
                          selectedCategory === cat 
                            ? "bg-indigo-100/50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-bold"
                            : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                        )}
                      >
                        <span className="truncate">{cat}</span>
                        <span className="text-[10px] opacity-50 bg-secondary px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                          {getFeedCount(cat)}
                        </span>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Tools
          </SidebarGroupLabel>
          <SidebarMenu className="px-2 mt-2 gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/studio"}
                className={cn(
                  "h-11 px-3 rounded-xl transition-all",
                  location.pathname === "/studio" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold" : ""
                )}
              >
                <Link to="/studio">
                  <Sparkles className="size-5" />
                  <span>Tagging Studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/settings"}
                className={cn(
                  "h-11 px-3 rounded-xl transition-all",
                  location.pathname === "/settings" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold" : ""
                )}
              >
                <Link to="/settings">
                  <Settings className="size-5" />
                  <span>Configuration</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="bg-indigo-600/5 dark:bg-indigo-500/5 rounded-2xl p-4 border border-indigo-500/10">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Regional Feed Active
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            v{RSS_FEEDS.length} items verified
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}