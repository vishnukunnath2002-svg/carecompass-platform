import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare } from 'lucide-react';

const templates = [
  { name: 'Booking Confirmed', channel: 'Email + Push', trigger: 'booking.confirmed', active: true },
  { name: 'Booking Cancelled', channel: 'Email + Push', trigger: 'booking.cancelled', active: true },
  { name: 'Provider Assigned', channel: 'Push', trigger: 'booking.provider_assigned', active: true },
  { name: 'Order Shipped', channel: 'Email + SMS', trigger: 'order.shipped', active: true },
  { name: 'Payment Received', channel: 'Email', trigger: 'payment.received', active: true },
  { name: 'Payout Processed', channel: 'Email', trigger: 'payout.processed', active: false },
  { name: 'New Review', channel: 'Push', trigger: 'review.created', active: true },
  { name: 'Document Verified', channel: 'Email + Push', trigger: 'document.verified', active: true },
];

export default function NotificationTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Notification Templates</h2>
        <p className="text-sm text-muted-foreground">Configure automated notification templates for platform events.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => (
          <Card key={t.trigger}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {t.channel.includes('Email') ? <Mail className="h-5 w-5 text-primary" /> : t.channel.includes('SMS') ? <MessageSquare className="h-5 w-5 text-primary" /> : <Bell className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.channel}</p>
                </div>
              </div>
              <Badge variant={t.active ? 'default' : 'secondary'}>{t.active ? 'Active' : 'Draft'}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
