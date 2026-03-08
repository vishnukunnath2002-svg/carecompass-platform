import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTenantSubscription } from '@/hooks/useTenantSubscription';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

export default function AgencyReviews() {
  const { tenant } = useTenantSubscription();
  const [reviews, setReviews] = useState<any[]>([]);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch agency reviews + service reviews
    const fetchReviews = async () => {
      const { data: agencyReviews } = await supabase.from('reviews').select('*')
        .eq('target_type', 'agency').order('created_at', { ascending: false });

      // Also fetch reviews for agency services
      let serviceReviews: any[] = [];
      if (tenant) {
        const { data: services } = await supabase.from('agency_services').select('id, name').eq('tenant_id', tenant.id);
        if (services && services.length > 0) {
          const names: Record<string, string> = {};
          const serviceIds = services.map(s => { names[s.id] = s.name; return s.id; });
          setServiceNames(names);

          const { data: srvReviews } = await supabase.from('reviews').select('*')
            .eq('target_type', 'agency_service')
            .in('target_id', serviceIds)
            .order('created_at', { ascending: false });
          if (srvReviews) serviceReviews = srvReviews;
        }
      }

      const all = [...(agencyReviews || []), ...serviceReviews].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReviews(all);
    };
    fetchReviews();
  }, [tenant]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Reviews</h2>
        <p className="text-sm text-muted-foreground">Customer reviews for your agency and services.</p>
      </div>
      {reviews.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Star className="h-8 w-8 mx-auto mb-2" />No reviews yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex items-center gap-1 rounded-lg bg-warning/10 px-2 py-1">
                  <Star className="h-4 w-4 fill-warning text-warning" /><span className="font-bold text-sm">{r.rating}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{r.title || 'Review'}</p>
                    {r.target_type === 'agency_service' && serviceNames[r.target_id] && (
                      <Badge variant="outline" className="text-xs">{serviceNames[r.target_id]}</Badge>
                    )}
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{format(new Date(r.created_at), 'dd MMM yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
