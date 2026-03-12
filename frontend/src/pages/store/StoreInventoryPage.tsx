import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  product_name: string;
  brand: string | null;
  category: string | null;
  price: number;
  stock_quantity: number | null;
  is_active: boolean | null;
  is_prescription_required: boolean | null;
}

export default function StoreInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (roleData?.tenant_id) {
        const { data: storeData } = await supabase.from('medical_store_profiles').select('id').eq('tenant_id', roleData.tenant_id).limit(1).single();
        if (storeData) {
          const { data } = await supabase.from('store_inventory').select('*').eq('store_id', storeData.id).order('created_at', { ascending: false });
          setItems((data as InventoryItem[]) || []);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const filtered = items.filter(i =>
    !searchTerm || i.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Manage your store's product inventory.</p>
        </div>
        <Button onClick={() => toast({ title: 'Coming soon', description: 'Add inventory item form coming soon.' })}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search inventory..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-muted-foreground">No inventory items.</p>
                </TableCell></TableRow>
              ) : filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{item.product_name}</div>
                      {item.brand && <div className="text-xs text-muted-foreground">{item.brand}</div>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{item.category || 'General'}</Badge></TableCell>
                  <TableCell className="text-foreground font-medium">₹{item.price}</TableCell>
                  <TableCell>
                    <Badge className={
                      (item.stock_quantity || 0) > 50 ? 'bg-success/10 text-success' :
                      (item.stock_quantity || 0) > 10 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }>
                      {item.stock_quantity || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.is_prescription_required ? <Badge variant="outline" className="border-destructive text-destructive text-xs">Rx</Badge> : '—'}
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
