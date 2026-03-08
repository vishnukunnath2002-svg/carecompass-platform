import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setNotifications(data);
    });
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Stay updated on your bookings, orders, and more.</p>
      </div>
      {notifications.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Bell className="h-8 w-8 mx-auto mb-2" />No notifications yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.is_read ? 'opacity-60' : ''}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${n.is_read ? 'bg-muted' : 'bg-primary'}`} />
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.message && <p className="text-xs text-muted-foreground">{n.message}</p>}
                    <p className="text-xs text-muted-foreground">{format(new Date(n.created_at), 'dd MMM, hh:mm a')}</p>
                  </div>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
