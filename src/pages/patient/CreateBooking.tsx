import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Star, CheckCircle, ArrowLeft } from 'lucide-react';

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
  weekly_rate: number | null;
  rating: number | null;
  review_count: number | null;
  bio: string | null;
}

interface PatientProfile {
  id: string;
  patient_name: string;
}

export default function CreateBooking() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('provider');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(providerId || '');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [provRes, patRes] = await Promise.all([
        supabase.from('caregiver_profiles').select('*').eq('verification_status', 'approved'),
        user ? supabase.from('patient_profiles').select('id, patient_name').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      ]);
      setProviders((provRes.data as Provider[]) || []);
      setPatients((patRes.data as PatientProfile[]) || []);

      if (providerId && provRes.data) {
        const found = (provRes.data as Provider[]).find(p => p.id === providerId);
        if (found) {
          setProvider(found);
          setSelectedProvider(found.id);
        }
      }
    };
    fetchData();
  }, [user, providerId]);

  const selectedProviderObj = providers.find(p => p.id === selectedProvider);

  const calculateAmount = () => {
    if (!selectedProviderObj || !startDate) return 0;
    if (shiftType === '24hr' && selectedProviderObj.daily_rate) {
      const days = endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 1;
      return selectedProviderObj.daily_rate * days;
    }
    if (selectedProviderObj.hourly_rate) {
      const hours = shiftType === '12hr' ? 12 : 8;
      const days = endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 1;
      return selectedProviderObj.hourly_rate * hours * days;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Please log in', variant: 'destructive' });
      return;
    }
    if (!selectedProvider || !startDate || !shiftType) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const amount = calculateAmount();
    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      provider_id: selectedProviderObj?.user_id || null,
      tenant_id: selectedProviderObj?.tenant_id || null,
      start_date: startDate,
      end_date: endDate || startDate,
      shift_type: shiftType,
      service_type: serviceType || selectedProviderObj?.provider_type,
      patient_profile_id: selectedPatient || null,
      notes,
      total_amount: amount,
      status: 'pending',
      payment_status: 'pending',
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: 'Booking failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking created!', description: 'Your booking has been placed successfully.' });
      navigate('/patient/bookings');
    }
  };

  const providerTypeLabel = (type: string) => {
    const map: Record<string, string> = { nurse: 'Nurse', caregiver: 'Caregiver', companion: 'Companion', nanny: 'Nanny', helper: 'Helper', physiotherapist: 'Physiotherapist' };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Book Care</h2>
          <p className="text-sm text-muted-foreground">Select a provider and schedule your booking.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Selection */}
          <Card className="border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Select Provider</CardTitle>
            </CardHeader>
            <CardContent>
              {providers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No verified providers available.</p>
              ) : (
                <div className="space-y-3">
                  {providers.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProvider(p.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${selectedProvider === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-semibold text-foreground">{providerTypeLabel(p.provider_type)}</span>
                            <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" /> Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{p.qualification} · {p.years_experience} yrs</p>
                        </div>
                        <div className="text-right">
                          {p.rating && (
                            <div className="flex items-center gap-1 text-sm text-warning">
                              <Star className="h-3.5 w-3.5 fill-warning" /> {p.rating}
                            </div>
                          )}
                          {p.hourly_rate && <p className="text-xs text-muted-foreground">₹{p.hourly_rate}/hr</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Shift Type *</Label>
                  <Select value={shiftType} onValueChange={setShiftType} required>
                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8hr">8 Hour Shift</SelectItem>
                      <SelectItem value="12hr">12 Hour Shift</SelectItem>
                      <SelectItem value="24hr">24 Hour / Live-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home-nursing">Home Nursing</SelectItem>
                      <SelectItem value="elder-care">Elder Care</SelectItem>
                      <SelectItem value="baby-care">Baby & Child Care</SelectItem>
                      <SelectItem value="post-surgery">Post-Surgery Care</SelectItem>
                      <SelectItem value="palliative">Palliative Care</SelectItem>
                      <SelectItem value="companion">Companion Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {patients.length > 0 && (
                <div className="space-y-2">
                  <Label>Patient Profile</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger><SelectValue placeholder="Select patient (optional)" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.patient_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Any special requirements or instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="border shadow-card sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProviderObj ? (
                <>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Provider: </span>
                    <span className="font-medium text-foreground">{providerTypeLabel(selectedProviderObj.provider_type)}</span>
                  </div>
                  {shiftType && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Shift: </span>
                      <span className="font-medium text-foreground">{shiftType}</span>
                    </div>
                  )}
                  {startDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Dates: </span>
                      <span className="font-medium text-foreground">
                        {new Date(startDate).toLocaleDateString('en-IN')}
                        {endDate && ` — ${new Date(endDate).toLocaleDateString('en-IN')}`}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-foreground">Estimated Total</span>
                      <span className="font-display text-xl font-bold text-foreground">₹{calculateAmount().toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a provider to see pricing.</p>
              )}

              <Button type="submit" className="w-full gradient-primary border-0" disabled={loading || !selectedProvider || !startDate || !shiftType}>
                <CalendarDays className="mr-2 h-4 w-4" />
                {loading ? 'Placing Booking...' : 'Place Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
