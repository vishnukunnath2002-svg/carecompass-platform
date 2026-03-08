import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

export default function CategoriesPage() {
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('service_categories').select('*').order('sort_order'),
      supabase.from('product_categories').select('*').order('sort_order'),
      supabase.from('specialization_tags').select('*').order('name'),
    ]).then(([s, p, t]) => {
      if (s.data) setServiceCategories(s.data);
      if (p.data) setProductCategories(p.data);
      if (t.data) setTags(t.data);
    });
  }, []);

  const renderCategories = (cats: any[]) => (
    cats.length === 0 ? <p className="py-8 text-center text-muted-foreground">No categories found.</p> : (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.name}</span>
                <Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Categories & Tags</h2>
        <p className="text-sm text-muted-foreground">Manage service categories, product categories, and specialization tags.</p>
      </div>
      <Tabs defaultValue="services">
        <TabsList><TabsTrigger value="services">Services</TabsTrigger><TabsTrigger value="products">Products</TabsTrigger><TabsTrigger value="tags">Tags</TabsTrigger></TabsList>
        <TabsContent value="services" className="mt-4">{renderCategories(serviceCategories)}</TabsContent>
        <TabsContent value="products" className="mt-4">{renderCategories(productCategories)}</TabsContent>
        <TabsContent value="tags" className="mt-4">
          {tags.length === 0 ? <p className="py-8 text-center text-muted-foreground">No tags.</p> : (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t.id} variant="outline" className="text-sm py-1 px-3">{t.name}{t.category && <span className="ml-1 text-muted-foreground">({t.category})</span>}</Badge>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
