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
import { CalendarDays, Star, CheckCircle, ArrowLeft, ShoppingBag, Package, Store, MapPin } from 'lucide-react';
import PaymentSimulation from '@/components/care/PaymentSimulation';
import { useCart } from '@/contexts/CartContext';

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
  tenant_id: string | null;
  review_count: number | null;
  bio: string | null;
}

interface PatientProfile {
  id: string;
  patient_name: string;
}

interface Address {
  id: string;
  label: string | null;
  address_line1: string;
  city: string;
  pincode: string;
}

type Step = 'details' | 'payment' | 'confirmed';

export default function CreateBooking() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('provider');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('details');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(providerId || '');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingNumber, setBookingNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const queries = [
        supabase.from('caregiver_profiles').select('*').eq('verification_status', 'approved'),
        user ? supabase.from('patient_profiles').select('id, patient_name').eq('user_id', user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from('addresses').select('id, label, address_line1, city, pincode').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      ];
      const [provRes, patRes, addrRes] = await Promise.all(queries);
      setProviders((provRes.data as Provider[]) || []);
      setPatients((patRes.data as PatientProfile[]) || []);
      setAddresses((addrRes.data as Address[]) || []);

      if (providerId && provRes.data) {
        const found = (provRes.data as Provider[]).find(p => p.id === providerId);
        if (found) setSelectedProvider(found.id);
      }
    };
    fetchData();
  }, [user, providerId]);

  const selectedProviderObj = providers.find(p => p.id === selectedProvider);

  const calculateAmount = () => {
    if (!selectedProviderObj || !startDate) return 0;
    const days = endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)) : 1;
    if (shiftType === '24hr' && selectedProviderObj.daily_rate) return selectedProviderObj.daily_rate * days;
    if (selectedProviderObj.hourly_rate) {
      const hours = shiftType === '12hr' ? 12 : 8;
      return selectedProviderObj.hourly_rate * hours * days;
    }
    return 0;
  };

  const amount = calculateAmount();

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: 'Please log in', variant: 'destructive' }); return; }
    if (!selectedProvider || !startDate || !shiftType) { toast({ title: 'Please fill all required fields', variant: 'destructive' }); return; }
    setStep('payment');
  };

  const handlePaymentComplete = async (paymentMethod?: string) => {
    setLoading(true);
    const { data, error } = await supabase.from('bookings').insert({
      customer_id: user!.id,
      provider_id: selectedProviderObj?.user_id || null,
      tenant_id: selectedProviderObj?.tenant_id || null,
      start_date: startDate,
      end_date: endDate || startDate,
      shift_type: shiftType,
      service_type: serviceType || selectedProviderObj?.provider_type,
      patient_profile_id: selectedPatient || null,
      patient_condition: patientCondition || null,
      address_id: selectedAddress || null,
      notes,
      total_amount: amount,
      status: 'confirmed',
      payment_status: 'paid',
    } as any).select().single();

    if (!error && data) {
      // Create invoice
      await supabase.from('invoices').insert({
        user_id: user!.id,
        reference_id: data.id,
        type: 'booking',
        amount: amount,
        tax: Math.round(amount * 0.18),
        total: Math.round(amount * 1.18),
      } as any);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: user!.id,
        title: 'Booking Confirmed',
        message: `Your booking ${data.booking_number} has been confirmed. Total: ₹${amount.toLocaleString('en-IN')}`,
        type: 'booking',
        link: '/patient/bookings',
      });

      // Record wallet debit if wallet payment
      if (paymentMethod === 'wallet') {
        await supabase.from('wallet_transactions').insert({
          user_id: user!.id,
          type: 'debit',
          source: 'booking',
          amount: Math.round(amount * 1.18),
          description: `Payment for booking ${data.booking_number}`,
          reference_type: 'booking',
          reference_id: data.id,
        } as any);
      }

      setBookingId(data.id);
      setBookingNumber(data.booking_number);
    }

    setLoading(false);
    if (error) {
      toast({ title: 'Booking failed', description: error.message, variant: 'destructive' });
      setStep('details');
    } else {
      setStep('confirmed');
    }
  };

  const providerTypeLabel = (type: string) => {
    const map: Record<string, string> = { nurse: 'Nurse', caregiver: 'Caregiver', companion: 'Companion', nanny: 'Nanny', helper: 'Helper', physiotherapist: 'Physiotherapist' };
    return map[type] || type;
  };

  // Product recommendations based on patient condition
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    if (step !== 'confirmed' || !patientCondition) return;
    const conditionKeywords = patientCondition.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);
    if (conditionKeywords.length === 0) return;
    supabase.from('products').select('*').eq('is_active', true).limit(50).then(({ data }) => {
      if (!data) return;
      const scored = data.map(p => {
        const text = `${p.name} ${p.description || ''} ${p.brand || ''}`.toLowerCase();
        const score = conditionKeywords.reduce((s: number, kw: string) => s + (text.includes(kw) ? 1 : 0), 0);
        return { ...p, score };
      }).filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
      setRecommendations(scored);
    });
  }, [step, patientCondition]);

  if (step === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-success/10 p-6 mb-6">
          <CheckCircle className="h-14 w-14 text-success" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Booking Confirmed!</h2>
        <p className="text-muted-foreground mt-2">Booking #{bookingNumber}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
          Your care provider has been notified and will confirm availability shortly. You'll receive updates via notifications.
        </p>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => navigate('/patient/bookings')}>View My Bookings</Button>
          <Button className="gradient-primary border-0" onClick={() => navigate('/patient/find-care')}>Book More Care</Button>
        </div>

        {/* Cross-module: Product Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-10 w-full max-w-2xl">
            <h3 className="font-display text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Recommended Products
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Based on the patient condition you described.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendations.map((p) => (
                <Card key={p.id} className="border shadow-card">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                      {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                      <p className="font-bold text-foreground text-sm mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      addItem({ productId: p.id, name: p.name, price: p.price, mrp: p.mrp, brand: p.brand, tenantId: p.tenant_id, isPrescriptionRequired: !!p.is_prescription_required, source: 'vendor' });
                    }}>
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="mt-3" onClick={() => navigate('/patient/shop')}>Browse All Products →</Button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setStep('details')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h2 className="font-display text-xl font-bold text-foreground">Complete Payment</h2>
        </div>
        <PaymentSimulation amount={amount} onPaymentComplete={handlePaymentComplete} onBack={() => setStep('details')} loading={loading} />
      </div>
    );
  }

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

      <form onSubmit={handleProceedToPayment} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Selection */}
          <Card className="border shadow-card">
            <CardHeader><CardTitle className="text-lg">Select Provider</CardTitle></CardHeader>
            <CardContent>
              {providers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No verified providers available.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {providers.map((p) => (
                    <div key={p.id} onClick={() => setSelectedProvider(p.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${selectedProvider === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-semibold text-foreground">{providerTypeLabel(p.provider_type)}</span>
                            <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" /> Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{p.qualification} · {p.years_experience} yrs</p>
                          {p.specializations && p.specializations.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {p.specializations.slice(0, 3).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {p.rating != null && p.rating > 0 && (
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
            <CardHeader><CardTitle className="text-lg">Booking Details</CardTitle></CardHeader>
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
                      {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.patient_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {addresses.length > 0 && (
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                    <SelectTrigger><SelectValue placeholder="Select address (optional)" /></SelectTrigger>
                    <SelectContent>
                      {addresses.map((a) => <SelectItem key={a.id} value={a.id}>{a.label || 'Address'} — {a.address_line1}, {a.city}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Patient Condition</Label>
                <Input placeholder="e.g. Post-surgery recovery, Diabetes management" value={patientCondition} onChange={(e) => setPatientCondition(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Any special requirements or instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card className="border shadow-card sticky top-20">
            <CardHeader><CardTitle className="text-lg">Booking Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {selectedProviderObj ? (
                <>
                  <div className="text-sm"><span className="text-muted-foreground">Provider: </span><span className="font-medium text-foreground">{providerTypeLabel(selectedProviderObj.provider_type)}</span></div>
                  {shiftType && <div className="text-sm"><span className="text-muted-foreground">Shift: </span><span className="font-medium text-foreground">{shiftType}</span></div>}
                  {startDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Dates: </span>
                      <span className="font-medium text-foreground">
                        {new Date(startDate).toLocaleDateString('en-IN')}
                        {endDate && ` — ${new Date(endDate).toLocaleDateString('en-IN')}`}
                      </span>
                    </div>
                  )}
                  {patientCondition && <div className="text-sm"><span className="text-muted-foreground">Condition: </span><span className="font-medium text-foreground">{patientCondition}</span></div>}
                  <div className="border-t pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span className="text-foreground">₹{Math.round(amount * 0.18).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t">
                      <span className="text-foreground">Total</span>
                      <span className="font-display text-xl font-bold text-foreground">₹{Math.round(amount * 1.18).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a provider to see pricing.</p>
              )}
              <Button type="submit" className="w-full gradient-primary border-0" disabled={!selectedProvider || !startDate || !shiftType}>
                <CalendarDays className="mr-2 h-4 w-4" /> Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
