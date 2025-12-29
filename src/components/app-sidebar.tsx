import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Sparkles, 
  Settings, 
  Database,
  Search,
  BookOpen,
  Info
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
import { TagflowLogo } from "@/components/TagflowLogo";
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "Tagging Studio",
      icon: Sparkles,
      path: "/studio",
    },
    {
      title: "Configuration",
      icon: Settings,
      path: "/settings",
    },
  ];
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="py-4 px-4">
        <TagflowLogo className="group-data-[collapsible=icon]:scale-75 origin-left transition-transform" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Main Pipeline
          </SidebarGroupLabel>
          <SidebarMenu className="px-2 mt-2 gap-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.path}
                  className={cn(
                    "h-11 px-3 rounded-xl transition-all duration-200",
                    location.pathname === item.path 
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold shadow-sm" 
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Link to={item.path}>
                    <item.icon className={cn(
                      "size-5",
                      location.pathname === item.path ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                    )} /> 
                    <span className="ml-2">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            System
          </SidebarGroupLabel>
          <SidebarMenu className="px-2 mt-2 gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-11 px-3 rounded-xl text-muted-foreground hover:text-foreground">
                <a href="#"><BookOpen className="size-5" /> <span>Documentation</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-11 px-3 rounded-xl text-muted-foreground hover:text-foreground">
                <a href="#"><Info className="size-5" /> <span>System Logs</span></a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="bg-indigo-600/5 dark:bg-indigo-500/5 rounded-2xl p-4 border border-indigo-500/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400">
              API Status: Active
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Connected to Cloudflare AI Gateway & RSS Workers
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}