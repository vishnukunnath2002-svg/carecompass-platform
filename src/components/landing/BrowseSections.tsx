import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Star, ShoppingCart, MapPin, Store, Search, Navigation, CheckCircle, Clock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ServiceDetailDialog from '@/components/care/ServiceDetailDialog';

interface AgencyService {
  id: string;
  name: string;
  description: string | null;
  service_type: string;
  price_hourly: number | null;
  price_daily: number | null;
  price_weekly: number | null;
  conditions_served: string[];
  rating: number | null;
  review_count: number | null;
  assigned_staff: string[] | null;
  equipment_suggestions: string[] | null;
  tenant_id: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  brand: string | null;
  rating: number | null;
  tenant_id: string;
  is_prescription_required: boolean | null;
  category_id: string | null;
}

interface StoreProfile {
  id: string;
  store_name: string;
  owner_name: string | null;
  rating: number | null;
  delivery_available: boolean | null;
  lat: number | null;
  lng: number | null;
}

interface ProductCategory {
  id: string;
  name: string;
}

const typeLabel: Record<string, string> = {
  nurse: 'Home Nurse', caregiver: 'Caregiver', companion: 'Companion',
  nanny: 'Baby Care', helper: 'Helper', physiotherapist: 'Physiotherapist',
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function BrowseServicesSection() {
  const [services, setServices] = useState<AgencyService[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<AgencyService | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('agency_services').select('id, name, description, service_type, price_hourly, price_daily, price_weekly, conditions_served, rating, review_count, assigned_staff, equipment_suggestions, tenant_id')
      .eq('is_active', true).limit(12).then(({ data }) => {
        if (data) setServices(data as AgencyService[]);
      });
  }, []);

  const types = useMemo(() => [...new Set(services.map(s => s.service_type))], [services]);

  const filtered = useMemo(() => services.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.conditions_served?.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || s.service_type === typeFilter;
    return matchSearch && matchType;
  }), [services, search, typeFilter]);

  const handleBook = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/patient/book?service=${serviceId}`)}`);
    } else {
      navigate(`/patient/book?service=${serviceId}`);
    }
  };

  if (services.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Browse Care Services</h2>
            <p className="text-sm text-muted-foreground mt-1">Verified healthcare services from registered agencies</p>
          </div>
          <Link to="/patient/find-care"><Button variant="outline">View All</Button></Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, condition..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{typeLabel[t] || t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 6).map(s => (
            <Card key={s.id} className="group border-0 shadow-card hover:shadow-elevated transition-all cursor-pointer overflow-hidden rounded-2xl" onClick={() => setSelectedService(s)}>
              {/* Gradient Banner */}
              <div className="relative h-28 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/40 flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                  <Users className="h-8 w-8 text-white" />
                </div>
                {/* Rating badge */}
                {(s.rating ?? 0) > 0 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-sm font-semibold shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {s.rating}
                    <span className="text-xs text-muted-foreground">({s.review_count || 0})</span>
                  </div>
                )}
                {/* Verified badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                  <CheckCircle className="h-3 w-3" /> Verified
                </div>
              </div>

              <CardContent className="p-5 space-y-3">
                {/* Service name & type */}
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
                  <Badge className="mt-1.5 bg-primary/10 text-primary border-primary/20 text-xs">{typeLabel[s.service_type] || s.service_type}</Badge>
                </div>

                {/* Description */}
                {s.description && <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>}

                {/* Conditions */}
                {s.conditions_served?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {s.conditions_served.slice(0, 3).map(c => (
                      <Badge key={c} variant="outline" className="text-xs rounded-full">{c}</Badge>
                    ))}
                    {s.conditions_served.length > 3 && (
                      <Badge variant="outline" className="text-xs rounded-full">+{s.conditions_served.length - 3}</Badge>
                    )}
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
                  {s.assigned_staff && s.assigned_staff.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" /> {s.assigned_staff.length} staff
                    </span>
                  )}
                  {s.equipment_suggestions && s.equipment_suggestions.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5 text-primary" /> {s.equipment_suggestions.length} equipment
                    </span>
                  )}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {s.price_hourly && (
                      <div className="text-lg font-bold text-foreground">₹{s.price_hourly}<span className="text-xs font-normal text-muted-foreground">/hr</span></div>
                    )}
                    {s.price_daily && !s.price_hourly && (
                      <div className="text-lg font-bold text-foreground">₹{s.price_daily}<span className="text-xs font-normal text-muted-foreground">/day</span></div>
                    )}
                    {!s.price_hourly && !s.price_daily && s.price_weekly && (
                      <div className="text-lg font-bold text-foreground">₹{s.price_weekly}<span className="text-xs font-normal text-muted-foreground">/wk</span></div>
                    )}
                  </div>
                  <Button size="sm" className="rounded-full gradient-primary border-0 shadow-sm" onClick={(e) => handleBook(e, s.id)}>
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ServiceDetailDialog
        service={selectedService}
        open={!!selectedService}
        onOpenChange={(open) => !open && setSelectedService(null)}
      />
    </section>
  );
}

export function ShopProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { addItem } = useCart();

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('id, name, price, mrp, brand, rating, tenant_id, is_prescription_required, category_id')
        .eq('is_active', true).limit(20).order('rating', { ascending: false }),
      supabase.from('product_categories').select('id, name').eq('is_active', true),
    ]).then(([pRes, cRes]) => {
      if (pRes.data) setProducts(pRes.data as Product[]);
      if (cRes.data) setCategories(cRes.data as ProductCategory[]);
    });
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchSearch && matchCat;
  }), [products, search, categoryFilter]);

  if (products.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 lg:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Shop Medical Equipment</h2>
            <p className="text-sm text-muted-foreground mt-1">Certified products from verified vendors</p>
          </div>
          <Link to="/patient/shop"><Button variant="outline">View All</Button></Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, brand..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.slice(0, 8).map(p => (
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
                  {(p.rating ?? 0) > 0 && (
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
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    supabase.from('medical_store_profiles').select('id, store_name, owner_name, rating, delivery_available, lat, lng')
      .eq('verification_status', 'approved').limit(12).then(({ data }) => {
        if (data) setPharmacies(data as StoreProfile[]);
      });
  }, []);

  const requestLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationLoading(false); },
      () => setLocationLoading(false),
      { timeout: 10000 }
    );
  };

  const sorted = useMemo(() => {
    let list = pharmacies.filter(s => !search || s.store_name.toLowerCase().includes(search.toLowerCase()));
    if (userLocation) {
      list = list.map(s => ({
        ...s,
        _distance: s.lat && s.lng ? haversineDistance(userLocation.lat, userLocation.lng, s.lat, s.lng) : 9999,
      })).sort((a: any, b: any) => a._distance - b._distance);
    }
    return list;
  }, [pharmacies, search, userLocation]);

  if (pharmacies.length === 0) return null;

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Nearby Pharmacies</h2>
            <p className="text-sm text-muted-foreground mt-1">Order medicines from verified local pharmacies</p>
          </div>
          <Link to="/patient/nearby-stores"><Button variant="outline">View All</Button></Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search pharmacies..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" onClick={requestLocation} disabled={locationLoading}>
            <Navigation className="h-4 w-4 mr-2" /> {userLocation ? 'Location Set ✓' : locationLoading ? 'Getting location...' : 'Use My Location'}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.slice(0, 6).map(s => (
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
                    {(s.rating ?? 0) > 0 && (
                      <span className="flex items-center gap-0.5 text-sm"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{s.rating}</span>
                    )}
                    {s.delivery_available && <Badge variant="outline" className="text-xs mt-1">Delivery</Badge>}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {userLocation && s.lat && s.lng
                      ? `${haversineDistance(userLocation.lat, userLocation.lng, s.lat, s.lng).toFixed(1)} km`
                      : 'Nearby'}
                  </span>
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
