import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';

export default function VendorInventory() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('products').select('*').order('name').then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Inventory</h2>
        <p className="text-sm text-muted-foreground">Manage stock levels for your products.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2" />No products found.</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-sm">{p.sku || '—'}</TableCell>
                    <TableCell><Badge variant={(p.stock_quantity || 0) > 10 ? 'default' : (p.stock_quantity || 0) > 0 ? 'secondary' : 'destructive'}>{p.stock_quantity || 0} units</Badge></TableCell>
                    <TableCell><Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
