import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Search, ShoppingCart, Package, Filter } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  brand: string | null;
  stock_quantity: number | null;
  tenant_id: string;
  is_prescription_required: boolean | null;
  category_id: string | null;
  rating: number | null;
}

export default function AgencyEquipment() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, totalItems } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase.from('product_categories').select('id, name').eq('is_active', true),
      ]);
      if (prodRes.data) setProducts(prodRes.data as Product[]);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category_id === category;
    return matchSearch && matchCat;
  });

  const handleAdd = (p: Product) => {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp,
      brand: p.brand,
      tenantId: p.tenant_id,
      isPrescriptionRequired: !!p.is_prescription_required,
      source: 'vendor',
    });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Browse Equipment</h2>
          <p className="text-sm text-muted-foreground">Purchase medical equipment and supplies from verified vendors.</p>
        </div>
        <Badge variant="outline" className="gap-1 text-sm"><ShoppingCart className="h-4 w-4" />{totalItems} items</Badge>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search equipment…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No products found.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <Card key={p.id} className="border shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-muted/30">
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-foreground">₹{p.price.toLocaleString('en-IN')}</span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {(p.stock_quantity ?? 0) <= 0 && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
                </div>
                <Button className="w-full" onClick={() => handleAdd(p)} disabled={(p.stock_quantity ?? 0) <= 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
