import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export default function AgencySettings() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Agency Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your agency preferences.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Agency Name</Label><Input placeholder="Your Agency Name" /></div>
          <div className="space-y-2"><Label>Contact Email</Label><Input type="email" placeholder="contact@agency.com" /></div>
          <div className="space-y-2"><Label>Contact Phone</Label><Input placeholder="+91 98765 43210" /></div>
          <div className="flex items-center justify-between"><Label>Auto-accept Bookings</Label><Switch /></div>
          <div className="flex items-center justify-between"><Label>Email Notifications</Label><Switch defaultChecked /></div>
          <Button className="w-full gradient-primary border-0">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
