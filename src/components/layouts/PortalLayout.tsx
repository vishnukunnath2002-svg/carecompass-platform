import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { Heart, LogOut, LucideIcon, AlertTriangle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
function SubscriptionBanner({ variant, message }: { variant: 'expired' | 'warning'; message: string }) {
  const navigate = useNavigate();
  const isExp = variant === 'expired';
  return (
    <div className={`${isExp ? 'bg-destructive/10 border-destructive/20' : 'bg-warning/10 border-warning/20'} border-b px-6 py-3 flex items-center gap-3`}>
      <AlertTriangle className={`h-4 w-4 ${isExp ? 'text-destructive' : 'text-warning'}`} />
      <span className={`text-sm font-medium flex-1 ${isExp ? 'text-destructive' : 'text-warning'}`}>{message}</span>
      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => navigate('/renew')}>
        <CreditCard className="h-3.5 w-3.5" /> Renew Now
      </Button>
    </div>
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
            <SubscriptionBanner
              variant="expired"
              message="Your subscription has expired. Renew now to continue using the platform."
            />
          )}
          {!isExpired && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
            <SubscriptionBanner
              variant="warning"
              message={`Your subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to avoid interruption.`}
            />
          )}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
