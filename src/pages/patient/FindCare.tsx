import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Provider {
  id: string;
  user_id: string;
  provider_type: string;
  qualification: string | null;
  years_experience: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  hourly_rate: number | null;
  daily_rate: number | null;
  rating: number | null;
  review_count: number | null;
  bio: string | null;
  is_available: boolean | null;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

export default function FindCare() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      supabase.from('caregiver_profiles').select('*').eq('verification_status', 'approved'),
      supabase.from('service_categories').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([provRes, catRes]) => {
      setProviders((provRes.data as Provider[]) || []);
      setCategories((catRes.data as ServiceCategory[]) || []);
      setLoading(false);
    });
  }, []);

  const filtered = providers.filter((p) => {
    const matchesSearch = !searchTerm ||
      p.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.provider_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const providerTypeLabel = (type: string) => {
    const map: Record<string, string> = { nurse: 'Nurse', caregiver: 'Caregiver', companion: 'Companion', nanny: 'Nanny', helper: 'Helper', physiotherapist: 'Physiotherapist' };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Find Care</h2>
        <p className="text-sm text-muted-foreground">Browse verified providers and book care for your loved ones.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by specialization, type..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-48 p-6" /></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No providers found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <Card key={p.id} className="border shadow-card transition-all hover:shadow-elevated">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-foreground">{providerTypeLabel(p.provider_type)}</h3>
                      <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.qualification} · {p.years_experience} yrs exp</p>
                  </div>
                  {p.rating && (
                    <div className="flex items-center gap-1 text-sm font-medium text-warning">
                      <Star className="h-4 w-4 fill-warning" /> {p.rating}
                      <span className="text-xs text-muted-foreground">({p.review_count})</span>
                    </div>
                  )}
                </div>

                {p.bio && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.bio}</p>}

                {p.specializations && p.specializations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.specializations.slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                    {p.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{p.specializations.length - 3}</Badge>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {p.languages && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {p.languages.slice(0, 2).join(', ')}
                      </span>
                    )}
                    {p.hourly_rate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> ₹{p.hourly_rate}/hr
                      </span>
                    )}
                  </div>
                  <Button size="sm" onClick={() => navigate(`/patient/book?provider=${p.id}`)}>
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
