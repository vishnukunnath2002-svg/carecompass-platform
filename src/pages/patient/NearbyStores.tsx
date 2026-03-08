import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Star, MapPin, Clock, Truck, CheckCircle } from 'lucide-react';

interface StoreProfile {
  id: string;
  store_name: string;
  owner_name: string | null;
  rating: number | null;
  review_count: number | null;
  delivery_available: boolean | null;
  delivery_fee: number | null;
  minimum_order_value: number | null;
  operating_hours: any;
  catchment_radius_km: number | null;
  verification_status: string | null;
}

export default function NearbyStores() {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('medical_store_profiles')
      .select('*')
      .eq('verification_status', 'approved')
      .then(({ data }) => {
        setStores((data as StoreProfile[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Nearby Medical Stores</h2>
        <p className="text-sm text-muted-foreground">Order medicines and healthcare products from stores near you.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-40 p-6" /></Card>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <Card className="border">
          <CardContent className="flex flex-col items-center py-16">
            <Store className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-display font-semibold text-foreground">No stores nearby</p>
            <p className="mt-1 text-sm text-muted-foreground">We're expanding to your area soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stores.map((s) => (
            <Card key={s.id} className="border shadow-card transition-all hover:shadow-elevated">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-foreground">{s.store_name}</h3>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    </div>
                  </div>
                  {s.rating && (
                    <div className="flex items-center gap-1 text-sm font-medium text-warning">
                      <Star className="h-4 w-4 fill-warning" /> {s.rating}
                      <span className="text-xs text-muted-foreground">({s.review_count})</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {s.operating_hours?.open && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {s.operating_hours.open} - {s.operating_hours.close}
                    </span>
                  )}
                  {s.catchment_radius_km && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {s.catchment_radius_km} km radius
                    </span>
                  )}
                  {s.delivery_available && (
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" /> Delivery ₹{s.delivery_fee}
                    </span>
                  )}
                </div>

                {s.minimum_order_value && s.minimum_order_value > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">Min order: ₹{s.minimum_order_value}</p>
                )}

                <Button className="mt-4 w-full" size="sm">
                  <Store className="mr-2 h-4 w-4" /> Browse & Order
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
