import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Store, Star, MapPin, Clock, Truck, CheckCircle, Search, ShoppingBag, Package, ShoppingCart, Upload, ArrowLeft } from 'lucide-react';

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
  tenant_id: string;
}

interface StoreItem {
  id: string;
  product_name: string;
  price: number;
  brand: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_prescription_required: boolean | null;
  store_id: string;
}

export default function NearbyStores() {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreProfile | null>(null);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);
  const { addItem, totalItems } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    supabase.from('medical_store_profiles').select('*').eq('verification_status', 'approved').then(({ data }) => {
      setStores((data as StoreProfile[]) || []);
      setLoading(false);
    });
  }, []);

  const openStore = async (store: StoreProfile) => {
    setSelectedStore(store);
    setLoadingItems(true);
    const { data } = await supabase.from('store_inventory').select('*').eq('store_id', store.id).eq('is_active', true);
    setStoreItems((data as StoreItem[]) || []);
    setLoadingItems(false);
  };

  const filteredItems = storeItems.filter(i =>
    !itemSearch || i.product_name.toLowerCase().includes(itemSearch.toLowerCase()) || i.brand?.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleAddStoreItem = (item: StoreItem) => {
    addItem({
      productId: item.id,
      name: item.product_name,
      price: item.price,
      mrp: null,
      brand: item.brand,
      tenantId: selectedStore?.tenant_id || '',
      isPrescriptionRequired: !!item.is_prescription_required,
      source: 'store',
      storeId: item.store_id,
    });
    toast({ title: 'Added to cart', description: `${item.product_name} added.` });
  };

  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file);
    if (uploadErr) { toast({ title: 'Upload failed', description: uploadErr.message, variant: 'destructive' }); return; }
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
    await supabase.from('prescriptions').insert({
      user_id: user.id,
      file_url: urlData.publicUrl || path,
    });
    toast({ title: 'Prescription uploaded', description: 'Your prescription has been saved to your health records.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Nearby Medical Stores</h2>
          <p className="text-sm text-muted-foreground">Order medicines and healthcare products from stores near you.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" /> Upload Prescription
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handlePrescriptionUpload} />
            </label>
          </Button>
          <Button variant="outline" className="relative" onClick={() => navigate('/patient/checkout')}>
            <ShoppingCart className="h-4 w-4 mr-2" /> Cart
            {totalItems > 0 && <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{totalItems}</span>}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[1, 2].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-40 p-6" /></Card>)}</div>
      ) : stores.length === 0 ? (
        <Card className="border"><CardContent className="flex flex-col items-center py-16"><Store className="h-12 w-12 text-muted-foreground/40" /><p className="mt-4 font-display font-semibold text-foreground">No stores nearby</p><p className="mt-1 text-sm text-muted-foreground">We're expanding to your area soon.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stores.map((s) => (
            <Card key={s.id} className="border shadow-card transition-all hover:shadow-elevated cursor-pointer" onClick={() => openStore(s)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-foreground">{s.store_name}</h3>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs"><CheckCircle className="mr-1 h-3 w-3" /> Verified</Badge>
                    </div>
                  </div>
                  {s.rating != null && s.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm font-medium text-warning"><Star className="h-4 w-4 fill-warning" /> {s.rating}<span className="text-xs text-muted-foreground">({s.review_count})</span></div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {s.operating_hours?.open && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.operating_hours.open} - {s.operating_hours.close}</span>}
                  {s.catchment_radius_km && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {s.catchment_radius_km} km</span>}
                  {s.delivery_available && <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery ₹{s.delivery_fee}</span>}
                </div>
                {s.minimum_order_value && s.minimum_order_value > 0 && <p className="mt-2 text-xs text-muted-foreground">Min order: ₹{s.minimum_order_value}</p>}
                <Button className="mt-4 w-full" size="sm" onClick={(e) => { e.stopPropagation(); openStore(s); }}>
                  <Store className="mr-2 h-4 w-4" /> Browse & Order
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Store Detail Dialog */}
      <Dialog open={!!selectedStore} onOpenChange={(open) => !open && setSelectedStore(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> {selectedStore?.store_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-9" value={itemSearch} onChange={e => setItemSearch(e.target.value)} />
            </div>
            {loadingItems ? (
              <div className="py-8 text-center text-muted-foreground">Loading inventory...</div>
            ) : filteredItems.length === 0 ? (
              <div className="py-8 text-center"><Package className="mx-auto h-8 w-8 text-muted-foreground/40" /><p className="mt-2 text-muted-foreground text-sm">No items found.</p></div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground truncate">{item.product_name}</h4>
                        {item.is_prescription_required && <Badge variant="outline" className="text-xs border-destructive text-destructive shrink-0">Rx</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
                        {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{item.price.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">{item.stock_quantity || 0} in stock</p>
                      </div>
                      <Button size="sm" disabled={!item.stock_quantity} onClick={() => handleAddStoreItem(item)}>
                        <ShoppingBag className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
