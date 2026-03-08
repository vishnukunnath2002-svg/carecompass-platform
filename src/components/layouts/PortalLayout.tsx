import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { Heart, LogOut, LucideIcon } from 'lucide-react';

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
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
