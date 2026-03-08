import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export default function StoreSettings() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Store Settings</h2>
        <p className="text-sm text-muted-foreground">Configure your store preferences.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Minimum Order Value</Label><Input type="number" placeholder="200" /></div>
          <div className="space-y-2"><Label>Delivery Fee</Label><Input type="number" placeholder="30" /></div>
          <div className="flex items-center justify-between"><Label>Delivery Available</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Own Delivery Staff</Label><Switch /></div>
          <div className="flex items-center justify-between"><Label>Accept Prescriptions</Label><Switch defaultChecked /></div>
          <Button className="w-full gradient-primary border-0">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
