import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Store } from 'lucide-react';

export default function StoreProfile() {
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    supabase.from('medical_store_profiles').select('*').limit(1).single().then(({ data }) => {
      if (data) setStore(data);
    });
  }, []);

  if (!store) return <div className="py-12 text-center text-muted-foreground">Loading store profile...</div>;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Store Profile</h2>
        <p className="text-sm text-muted-foreground">Your medical store information.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />{store.store_name}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Badge variant={store.verification_status === 'approved' ? 'default' : 'secondary'}>{store.verification_status}</Badge>
            {store.delivery_available && <Badge variant="outline">Delivery Available</Badge>}
          </div>
          <div className="space-y-2"><Label>Owner</Label><Input value={store.owner_name || ''} readOnly className="bg-muted" /></div>
          <div className="space-y-2"><Label>Drug Licence</Label><Input value={store.drug_licence_number || ''} readOnly className="bg-muted" /></div>
          <div className="space-y-2"><Label>GST Number</Label><Input value={store.gst_number || ''} readOnly className="bg-muted" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Min Order</Label><p className="text-sm font-medium">₹{Number(store.minimum_order_value || 0).toLocaleString()}</p></div>
            <div><Label>Delivery Fee</Label><p className="text-sm font-medium">₹{Number(store.delivery_fee || 0).toLocaleString()}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
