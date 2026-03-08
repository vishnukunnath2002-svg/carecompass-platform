import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Star, ShoppingCart, MapPin, Store } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  brand: string | null;
  rating: number | null;
  tenant_id: string;
  is_prescription_required: boolean | null;
}

interface StoreProfile {
  id: string;
  store_name: string;
  owner_name: string | null;
  rating: number | null;
  delivery_available: boolean | null;
}

interface ServiceProvider {
  id: string;
  provider_type: string;
  qualification: string | null;
  specializations: string[] | null;
  hourly_rate: number | null;
  rating: number | null;
  review_count: number | null;
}

export function BrowseServicesSection() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  useEffect(() => {
    supabase.from('caregiver_profiles').select('id, provider_type, qualification, specializations, hourly_rate, rating, review_count')
      .eq('verification_status', 'approved').limit(6).then(({ data }) => {
        if (data) setProviders(data as ServiceProvider[]);
      });
  }, []);

  const typeLabel: Record<string, string> = { nurse: 'Home Nurse', caregiver: 'Caregiver', companion: 'Companion', nanny: 'Baby Care', helper: 'Helper', physiotherapist: 'Physiotherapist' };

  if (providers.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Browse Care Services</h2>
            <p className="text-sm text-muted-foreground mt-1">Verified healthcare professionals available near you</p>
          </div>
          <Link to="/auth?tab=register"><Button variant="outline">View All</Button></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map(p => (
            <Card key={p.id} className="border shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20">{typeLabel[p.provider_type] || p.provider_type}</Badge>
                  {p.rating != null && p.rating > 0 && (
                    <span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{p.rating} <span className="text-muted-foreground text-xs">({p.review_count || 0})</span></span>
                  )}
                </div>
                <p className="font-semibold text-foreground">{p.qualification || typeLabel[p.provider_type]}</p>
                {p.specializations && p.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.specializations.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  {p.hourly_rate && <span className="font-bold text-foreground">₹{p.hourly_rate}/hr</span>}
                  <Link to="/auth"><Button size="sm">Book Now</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShopProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    supabase.from('products').select('id, name, price, mrp, brand, rating, tenant_id, is_prescription_required')
      .eq('is_active', true).limit(8).order('rating', { ascending: false }).then(({ data }) => {
        if (data) setProducts(data as Product[]);
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 lg:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Shop Medical Equipment</h2>
            <p className="text-sm text-muted-foreground mt-1">Certified products from verified vendors</p>
          </div>
          <Link to="/auth?tab=register"><Button variant="outline">View All</Button></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(p => (
            <Card key={p.id} className="border shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex h-24 w-full items-center justify-center rounded-lg bg-muted/50">
                  <Package className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground">₹{p.price.toLocaleString('en-IN')}</span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {p.rating != null && p.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs"><Star className="h-3 w-3 fill-warning text-warning" />{p.rating}</span>
                  )}
                </div>
                <Button size="sm" className="w-full" variant="outline" onClick={() => {
                  addItem({ productId: p.id, name: p.name, price: p.price, mrp: p.mrp, brand: p.brand, tenantId: p.tenant_id, isPrescriptionRequired: !!p.is_prescription_required, source: 'vendor' });
                }}>
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NearbyPharmaciesSection() {
  const [pharmacies, setPharmacies] = useState<StoreProfile[]>([]);

  useEffect(() => {
    supabase.from('medical_store_profiles').select('id, store_name, owner_name, rating, delivery_available')
      .eq('verification_status', 'approved').limit(6).then(({ data }) => {
        if (data) setPharmacies(data as StoreProfile[]);
      });
  }, []);

  if (pharmacies.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Nearby Pharmacies</h2>
            <p className="text-sm text-muted-foreground mt-1">Order medicines from verified local pharmacies</p>
          </div>
          <Link to="/auth?tab=register"><Button variant="outline">View All</Button></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pharmacies.map(s => (
            <Card key={s.id} className="border shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
                    <Store className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.store_name}</p>
                    {s.owner_name && <p className="text-xs text-muted-foreground">{s.owner_name}</p>}
                  </div>
                  <div className="text-right">
                    {s.rating != null && s.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-sm"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{s.rating}</span>
                    )}
                    {s.delivery_available && <Badge variant="outline" className="text-xs mt-1">Delivery</Badge>}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />Nearby</span>
                  <Link to="/auth"><Button size="sm" variant="outline">Order Now</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
