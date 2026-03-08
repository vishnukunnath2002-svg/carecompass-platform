import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Phone, Mail, Globe, CheckCircle, Users, Clock, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  status: string;
}

interface AgencyService {
  id: string;
  name: string;
  service_type: string;
  price_hourly: number | null;
  price_daily: number | null;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  user_id: string;
}

interface Props {
  agency: AgencyTenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeLabel: Record<string, string> = {
  nurse: 'Home Nurse', caregiver: 'Caregiver', companion: 'Companion',
  nanny: 'Baby Care', helper: 'Helper', physiotherapist: 'Physiotherapist',
};

export default function AgencyProfileDialog({ agency, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState<AgencyService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Request form state
  const [reqServiceType, setReqServiceType] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqCondition, setReqCondition] = useState('');
  const [reqStartDate, setReqStartDate] = useState('');
  const [reqShift, setReqShift] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqName, setReqName] = useState('');

  useEffect(() => {
    if (!agency || !open) return;
    // Fetch services and reviews in parallel
    Promise.all([
      supabase.from('agency_services').select('id, name, service_type, price_hourly, price_daily')
        .eq('tenant_id', agency.id).eq('is_active', true),
      supabase.from('reviews').select('id, rating, title, comment, created_at, user_id')
        .eq('target_type', 'agency').eq('target_id', agency.id).order('created_at', { ascending: false }).limit(10),
    ]).then(([sRes, rRes]) => {
      if (sRes.data) setServices(sRes.data);
      if (rRes.data) setReviews(rRes.data);
    });
  }, [agency, open]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleRequestService = () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent('/')}`);
      onOpenChange(false);
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
      resetForm();
    }
  };

  const resetForm = () => {
    setReqServiceType('');
    setReqDescription('');
    setReqCondition('');
    setReqStartDate('');
    setReqShift('');
    setReqPhone('');
    setReqName('');
  };

  if (!agency) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {agency.logo_url ? (
              <img src={agency.logo_url} alt={agency.name} className="h-16 w-16 rounded-xl object-cover border" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-xl">{agency.brand_name || agency.name}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge className="bg-success/10 text-success border-success/20 text-xs gap-1">
                  <CheckCircle className="h-3 w-3" /> Verified Agency
                </Badge>
                {avgRating && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Star className="h-3 w-3 fill-warning text-warning" /> {avgRating} ({reviews.length} reviews)
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contact Info */}
          <div className="grid gap-2 text-sm">
            {(agency.city || agency.state) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {[agency.address_line1, agency.city, agency.state].filter(Boolean).join(', ')}
              </div>
            )}
            {agency.contact_phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" /> {agency.contact_phone}
              </div>
            )}
            {agency.contact_email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" /> {agency.contact_email}
              </div>
            )}
            {agency.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4 text-primary" />
                <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{agency.website}</a>
              </div>
            )}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Services Offered</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {services.map(s => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm text-foreground">{s.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">{typeLabel[s.service_type] || s.service_type}</Badge>
                    </div>
                    <div className="text-right text-sm">
                      {s.price_hourly && <p className="font-semibold text-foreground">₹{s.price_hourly}/hr</p>}
                      {s.price_daily && <p className="text-xs text-muted-foreground">₹{s.price_daily}/day</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Recent Reviews</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {reviews.map(r => (
                  <div key={r.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} />
                        ))}
                      </div>
                      {r.title && <span className="text-sm font-medium text-foreground">{r.title}</span>}
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Service Form */}
          {showRequestForm ? (
            <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
              <h3 className="font-display font-semibold text-foreground">Request a Service</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Your Name *</Label>
                  <Input value={reqName} onChange={e => setReqName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={reqPhone} onChange={e => setReqPhone(e.target.value)} placeholder="+91 ..." />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
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
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Preferred Start Date</Label>
                  <Input type="date" value={reqStartDate} onChange={e => setReqStartDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Patient Condition</Label>
                  <Input value={reqCondition} onChange={e => setReqCondition(e.target.value)} placeholder="e.g. Post-surgery care" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Describe Your Needs *</Label>
                <Textarea value={reqDescription} onChange={e => setReqDescription(e.target.value)} placeholder="Please describe the care you need, any specific requirements, schedule preferences..." rows={3} />
              </div>
              <div className="flex gap-2">
                <Button onClick={submitRequest} disabled={!reqName || !reqServiceType || !reqDescription || submitting} className="gradient-primary border-0">
                  <Send className="h-4 w-4 mr-1.5" /> {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button variant="outline" onClick={() => setShowRequestForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button className="flex-1 gradient-primary border-0" onClick={handleRequestService}>
                <Send className="h-4 w-4 mr-1.5" /> Request a Service
              </Button>
              {user && (
                <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                  <Star className="h-4 w-4 mr-1.5" /> Write Review
                </Button>
              )}
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && user && agency && (
            <ReviewForm targetId={agency.id} targetType="agency" onComplete={() => {
              setShowReviewForm(false);
              // Refresh reviews
              supabase.from('reviews').select('id, rating, title, comment, created_at, user_id')
                .eq('target_type', 'agency').eq('target_id', agency.id).order('created_at', { ascending: false }).limit(10)
                .then(({ data }) => { if (data) setReviews(data); });
            }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
