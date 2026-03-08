import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

export default function VendorPricing() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('products').select('name, sku, price, mrp, moq').order('name').then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Pricing</h2>
        <p className="text-sm text-muted-foreground">Manage pricing and MRP for your products.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No products found.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>MRP</TableHead><TableHead>MOQ</TableHead><TableHead>Margin</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>₹{Number(p.price).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{p.mrp ? `₹${Number(p.mrp).toLocaleString()}` : '—'}</TableCell>
                    <TableCell>{p.moq || 1}</TableCell>
                    <TableCell className="text-success">{p.mrp ? `${Math.round(((p.mrp - p.price) / p.mrp) * 100)}%` : '—'}</TableCell>
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
