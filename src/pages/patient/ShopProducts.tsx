import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShoppingBag, Star, Package, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ProductDetailDialog from '@/components/shop/ProductDetailDialog';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  brand: string | null;
  stock_quantity: number | null;
  rating: number | null;
  review_count: number | null;
  is_prescription_required: boolean | null;
  specifications: any;
  certifications: string[] | null;
  tenant_id: string;
  images: string[] | null;
  category_id: string | null;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export default function ShopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addItem, totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('product_categories').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([prodRes, catRes]) => {
      setProducts((prodRes.data as Product[]) || []);
      setCategories((catRes.data as ProductCategory[]) || []);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddToCart = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
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
    toast({ title: 'Added to cart', description: `${p.name} added.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Shop Medical Products</h2>
          <p className="text-sm text-muted-foreground">Browse medical equipment and supplies from verified vendors.</p>
        </div>
        <Button variant="outline" className="relative" onClick={() => navigate('/patient/checkout')}>
          <ShoppingCart className="h-4 w-4 mr-2" /> Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{totalItems}</span>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Card key={i} className="animate-pulse"><CardContent className="h-56 p-6" /></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 font-semibold text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="border shadow-card transition-all hover:shadow-elevated overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(p)}>
              <div className="flex h-32 items-center justify-center bg-muted/50">
                <Package className="h-12 w-12 text-muted-foreground/20" />
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-foreground truncate">{p.name}</h3>
                    {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                  </div>
                  {p.is_prescription_required && <Badge variant="outline" className="ml-2 shrink-0 text-xs border-destructive text-destructive">Rx</Badge>}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-lg font-bold text-foreground">₹{p.price.toLocaleString('en-IN')}</span>
                  {p.mrp && p.mrp > p.price && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                      <Badge className="bg-success/10 text-success text-xs">{Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off</Badge>
                    </>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  {p.rating ? <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {p.rating}</span> : null}
                  <span>{p.stock_quantity ? `${p.stock_quantity} in stock` : 'Out of stock'}</span>
                </div>
                <Button className="mt-4 w-full" size="sm" disabled={!p.stock_quantity || p.stock_quantity === 0} onClick={(e) => handleAddToCart(p, e)}>
                  <ShoppingBag className="mr-2 h-4 w-4" /> {p.stock_quantity ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductDetailDialog product={selectedProduct} open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)} />
    </div>
  );
}
