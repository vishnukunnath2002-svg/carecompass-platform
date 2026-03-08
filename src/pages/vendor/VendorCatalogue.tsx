import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  price: number;
  mrp: number | null;
  stock_quantity: number | null;
  is_active: boolean | null;
  is_prescription_required: boolean | null;
}

export default function VendorCatalogue() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (roleData?.tenant_id) {
        const { data } = await supabase.from('products').select('*').eq('tenant_id', roleData.tenant_id).order('created_at', { ascending: false });
        setProducts((data as Product[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = products.filter(p =>
    !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleActive = async (product: Product) => {
    const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    if (!error) {
      setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
      toast({ title: product.is_active ? 'Product deactivated' : 'Product activated' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Product Catalogue</h2>
          <p className="text-sm text-muted-foreground">Manage your product listings.</p>
        </div>
        <Button onClick={() => toast({ title: 'Coming soon', description: 'Product creation form will be available soon.' })}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>MRP</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No products found.</p>
                </TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{p.name}</div>
                      {p.brand && <div className="text-xs text-muted-foreground">{p.brand}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{p.sku || '—'}</TableCell>
                  <TableCell className="text-foreground font-medium">₹{p.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.mrp ? `₹${p.mrp.toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      (p.stock_quantity || 0) > 10 ? 'bg-success/10 text-success' :
                      (p.stock_quantity || 0) > 0 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }>
                      {p.stock_quantity || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(p)}>
                      <Badge className={p.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
