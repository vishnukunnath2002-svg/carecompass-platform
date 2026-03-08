import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin } from 'lucide-react';

export default function CatchmentArea() {
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    supabase.from('medical_store_profiles').select('store_name, catchment_radius_km, catchment_pincodes, lat, lng').limit(1).single().then(({ data }) => {
      if (data) setStore(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Catchment Area</h2>
        <p className="text-sm text-muted-foreground">Define your delivery and service area.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Coverage</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Delivery Radius</p>
            <p className="text-2xl font-bold">{store?.catchment_radius_km || 5} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Serviceable Pincodes</p>
            {store?.catchment_pincodes?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {store.catchment_pincodes.map((p: string) => (
                  <Badge key={p} variant="outline" className="font-mono">{p}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pincodes configured — radius-based delivery active.</p>
            )}
          </div>
          {store?.lat && store?.lng && (
            <p className="text-xs text-muted-foreground">Coordinates: {store.lat.toFixed(4)}, {store.lng.toFixed(4)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
