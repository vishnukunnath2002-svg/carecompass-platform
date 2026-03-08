import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export default function VendorSettings() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Vendor Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your vendor account preferences.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Business Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Business Name</Label><Input placeholder="Your Business Name" /></div>
          <div className="space-y-2"><Label>GST Number</Label><Input placeholder="22AAAAA0000A1Z5" /></div>
          <div className="space-y-2"><Label>Contact Email</Label><Input type="email" placeholder="vendor@company.com" /></div>
          <div className="flex items-center justify-between"><Label>Auto-accept Orders</Label><Switch /></div>
          <div className="flex items-center justify-between"><Label>Email Notifications</Label><Switch defaultChecked /></div>
          <Button className="w-full gradient-primary border-0">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
