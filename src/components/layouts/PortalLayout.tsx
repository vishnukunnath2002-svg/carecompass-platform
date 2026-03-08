import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { Heart, LogOut, LucideIcon, AlertTriangle } from 'lucide-react';
import { useTenantSubscription } from '@/hooks/useTenantSubscription';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface PortalLayoutProps {
  children: ReactNode;
  portalName: string;
  navItems: NavItem[];
  accentColor?: string;
}

function PortalSidebar({ portalName, navItems }: { portalName: string; navItems: NavItem[] }) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Heart className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-display text-sm font-bold text-sidebar-foreground">CYLO</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider">{portalName}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url.split('/').length <= 2} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto border-t border-sidebar-border p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </Sidebar>
  );
}

export default function PortalLayout({ children, portalName, navItems }: PortalLayoutProps) {
  const { isExpired, daysRemaining } = useTenantSubscription();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PortalSidebar portalName={portalName} navItems={navItems} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-6">
            <SidebarTrigger />
            <h1 className="font-display text-sm font-semibold text-foreground">{portalName}</h1>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground">← Home</Button>
              </Link>
            </div>
          </header>
          {isExpired && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Your subscription has expired. Please contact the administrator to renew your plan.</span>
            </div>
          )}
          {!isExpired && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
            <div className="bg-warning/10 border-b border-warning/20 px-6 py-3 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Contact admin to renew.</span>
            </div>
          )}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
