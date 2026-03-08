import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

export default function ServiceCatalogue() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('service_categories').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Service Catalogue</h2>
        <p className="text-sm text-muted-foreground">Services offered by your agency.</p>
      </div>
      {categories.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No services configured. Contact admin to set up service categories.</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="hover:shadow-elevated transition-shadow">
              <CardContent className="py-4">
                <p className="font-medium">{c.name}</p>
                {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
                <Badge variant="default" className="mt-2">Active</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
