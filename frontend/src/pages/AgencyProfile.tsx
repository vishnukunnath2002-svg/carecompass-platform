import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Phone, Mail, Globe, CheckCircle, Users, Package, Send, ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from '@/components/care/ReviewForm';

interface AgencyTenant {
  id: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  address_line1: string | null;
  domain_slug: string | null;
  status: string;
}

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
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  user_id: string;
}

const typeLabel: Record<string, string> = {
  nurse: 'Home Nurse', caregiver: 'Caregiver', companion: 'Companion',
  nanny: 'Baby Care', helper: 'Helper', physiotherapist: 'Physiotherapist',
};

export default function AgencyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [agency, setAgency] = useState<AgencyTenant | null>(null);
  const [services, setServices] = useState<AgencyService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [reqServiceType, setReqServiceType] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqCondition, setReqCondition] = useState('');
  const [reqStartDate, setReqStartDate] = useState('');
  const [reqShift, setReqShift] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqName, setReqName] = useState('');

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      setLoading(true);
      const { data: tenant } = await supabase.from('tenants')
        .select('id, name, brand_name, logo_url, contact_email, contact_phone, website, city, state, address_line1, domain_slug, status')
        .eq('domain_slug', slug)
        .eq('type', 'agency')
        .eq('status', 'active')
        .single();

      if (!tenant) { setLoading(false); return; }
      setAgency(tenant as AgencyTenant);

      const [sRes, rRes] = await Promise.all([
        supabase.from('agency_services').select('id, name, description, service_type, price_hourly, price_daily, price_weekly, conditions_served, rating, review_count')
          .eq('tenant_id', tenant.id).eq('is_active', true),
        supabase.from('reviews').select('id, rating, title, comment, created_at, user_id')
          .eq('target_type', 'agency').eq('target_id', tenant.id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (sRes.data) setServices(sRes.data as AgencyService[]);
      if (rRes.data) setReviews(rRes.data);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleRequestService = () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/agency/${slug}`)}`);
      return;
    }
    setShowRequestForm(true);
  };

  const submitRequest = async () => {
    if (!user || !agency || !reqServiceType || !reqDescription || !reqName) return;
    setSubmitting(true);
    const { error } = await supabase.from('service_requests' as any).insert({
      patient_id: user.id,
      tenant_id: agency.id,
      patient_name: reqName,
      patient_phone: reqPhone || null,
      service_type: reqServiceType,
      description: reqDescription,
      patient_condition: reqCondition || null,
      preferred_start_date: reqStartDate || null,
      preferred_shift: reqShift || null,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Request Submitted!', description: 'The agency will review your request and get back to you.' });
      setShowRequestForm(false);
      setReqServiceType(''); setReqDescription(''); setReqCondition(''); setReqStartDate(''); setReqShift(''); setReqPhone(''); setReqName('');
    }
  };

  const refreshReviews = async () => {
    if (!agency) return;
    const { data } = await supabase.from('reviews').select('id, rating, title, comment, created_at, user_id')
      .eq('target_type', 'agency').eq('target_id', agency.id).order('created_at', { ascending: false }).limit(20);
    if (data) setReviews(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading agency profile...</div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Agency Not Found</h1>
        <p className="text-muted-foreground">The agency you're looking for doesn't exist or is no longer active.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  const displayName = agency.brand_name || agency.name;

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta */}
      <title>{`${displayName} — Homecare Agency`}</title>
      <meta name="description" content={`${displayName} provides verified homecare services in ${[agency.city, agency.state].filter(Boolean).join(', ')}. Browse services, read reviews, and request care.`} />

      {/* Hero Banner */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,_hsl(var(--primary)/0.3),_transparent_60%)]" />
        <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="container relative h-full flex items-end pb-6">
          <Button variant="ghost" size="sm" className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-white/10" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Home
          </Button>
        </div>
      </div>

      <div className="container -mt-14 relative z-10 pb-16">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={displayName} className="h-24 w-24 rounded-2xl border-4 border-card object-cover shadow-elevated" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 shadow-elevated">
              <Users className="h-10 w-10 text-primary" />
            </div>
          )}
          <div className="flex-1 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-foreground">{displayName}</h1>
              <Badge className="bg-success/10 text-success border-success/20 gap-1">
                <CheckCircle className="h-3 w-3" /> Verified Agency
              </Badge>
            </div>
            {(agency.city || agency.state) && (
              <p className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 text-primary" />
                {[agency.address_line1, agency.city, agency.state].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              {avgRating && (
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Star className="h-4 w-4 fill-warning text-warning" /> {avgRating}
                  <span className="font-normal text-muted-foreground">({reviews.length} reviews)</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4 text-primary" /> {services.length} service{services.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 mt-2 sm:mt-4">
            <Button className="gradient-primary border-0 rounded-full" onClick={handleRequestService}>
              <Send className="h-4 w-4 mr-1.5" /> Request Service
            </Button>
            {user && (
              <Button variant="outline" className="rounded-full" onClick={() => setShowReviewForm(!showReviewForm)}>
                <Star className="h-4 w-4 mr-1.5" /> Review
              </Button>
            )}
          </div>
        </div>

        {/* Contact Info Row */}
        <div className="flex flex-wrap gap-4 mb-10 text-sm text-muted-foreground">
          {agency.contact_phone && (
            <a href={`tel:${agency.contact_phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone className="h-4 w-4 text-primary" /> {agency.contact_phone}
            </a>
          )}
          {agency.contact_email && (
            <a href={`mailto:${agency.contact_email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Mail className="h-4 w-4 text-primary" /> {agency.contact_email}
            </a>
          )}
          {agency.website && (
            <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Globe className="h-4 w-4 text-primary" /> {agency.website}
            </a>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main content — Services */}
          <div className="lg:col-span-2 space-y-10">
            {/* Services */}
            {services.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Services Offered</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map(s => (
                    <Card key={s.id} className="border shadow-card hover:shadow-elevated transition-shadow rounded-xl overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display font-semibold text-foreground">{s.name}</h3>
                            <Badge variant="outline" className="text-xs mt-1">{typeLabel[s.service_type] || s.service_type}</Badge>
                          </div>
                          {(s.rating ?? 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-sm font-semibold">
                              <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {s.rating}
                            </span>
                          )}
                        </div>
                        {s.description && <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                        {s.conditions_served?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {s.conditions_served.slice(0, 4).map(c => (
                              <Badge key={c} variant="secondary" className="text-xs rounded-full">{c}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-2 border-t text-sm">
                          {s.price_hourly && <span className="font-bold text-foreground">₹{s.price_hourly}<span className="text-xs font-normal text-muted-foreground">/hr</span></span>}
                          {s.price_daily && <span className="text-muted-foreground">₹{s.price_daily}/day</span>}
                          {s.price_weekly && <span className="text-muted-foreground">₹{s.price_weekly}/wk</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Patient Reviews</h2>
                {avgRating && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(avgRating)) ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} />
                      ))}
                    </div>
                    <span className="font-semibold text-foreground">{avgRating}</span>
                    <span className="text-muted-foreground">({reviews.length})</span>
                  </div>
                )}
              </div>

              {showReviewForm && user && agency && (
                <div className="mb-6">
                  <ReviewForm targetId={agency.id} targetType="agency" onComplete={() => { setShowReviewForm(false); refreshReviews(); }} />
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} />
                          ))}
                        </div>
                        {r.title && <span className="text-sm font-medium text-foreground">{r.title}</span>}
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this agency!</p>
              )}
            </section>
          </div>

          {/* Sidebar — Request Form */}
          <div className="space-y-6">
            <Card className="border shadow-card rounded-xl sticky top-6">
              <CardContent className="p-6">
                {showRequestForm ? (
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-foreground text-lg">Request a Service</h3>
                    <div className="space-y-1.5">
                      <Label>Your Name *</Label>
                      <Input value={reqName} onChange={e => setReqName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input value={reqPhone} onChange={e => setReqPhone(e.target.value)} placeholder="+91 ..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Service Type *</Label>
                      <Select value={reqServiceType} onValueChange={setReqServiceType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {services.length > 0
                            ? services.map(s => <SelectItem key={s.id} value={s.service_type}>{s.name}</SelectItem>)
                            : Object.entries(typeLabel).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Preferred Shift</Label>
                      <Select value={reqShift} onValueChange={setReqShift}>
                        <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                          <SelectItem value="24hr">24 Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Preferred Start Date</Label>
                      <Input type="date" value={reqStartDate} onChange={e => setReqStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Patient Condition</Label>
                      <Input value={reqCondition} onChange={e => setReqCondition(e.target.value)} placeholder="e.g. Post-surgery care" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Describe Your Needs *</Label>
                      <Textarea value={reqDescription} onChange={e => setReqDescription(e.target.value)} placeholder="Describe the care you need..." rows={3} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={submitRequest} disabled={!reqName || !reqServiceType || !reqDescription || submitting} className="w-full gradient-primary border-0">
                        <Send className="h-4 w-4 mr-1.5" /> {submitting ? 'Submitting...' : 'Submit Request'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowRequestForm(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <Users className="h-10 w-10 text-primary mx-auto" />
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg">Need Care?</h3>
                      <p className="text-sm text-muted-foreground mt-1">Submit a request and {displayName} will get back to you with the best options.</p>
                    </div>
                    <Button className="w-full gradient-primary border-0 rounded-full" onClick={handleRequestService}>
                      <Send className="h-4 w-4 mr-1.5" /> Request a Service
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
