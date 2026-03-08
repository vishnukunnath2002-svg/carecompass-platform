import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import MultiStepForm from '@/components/registration/MultiStepForm';
import FeatureTour from '@/components/registration/FeatureTour';
import PlanSelector from '@/components/registration/PlanSelector';
import PaymentSimulation from '@/components/care/PaymentSimulation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePincodeAutoFill } from '@/hooks/usePincodeAutoFill';
import { Loader2 } from 'lucide-react';
const steps = [
  { title: 'Choose Plan', description: 'Select a subscription plan for your agency.' },
  { title: 'Payment', description: 'Complete payment to activate your plan.' },
  { title: 'Business Identity', description: 'Basic information about your agency.' },
  { title: 'Service Profile', description: 'What services does your agency offer?' },
  { title: 'Compliance & Documents', description: 'Upload required documents.' },
  { title: 'Tenant Setup', description: 'Configure your portal requirements.' },
];

export default function AgencyRegistration() {
  const [showTour, setShowTour] = useState(true);
  const [form, setForm] = useState({
    planId: '' as string | null,
    planPrice: 0,
    paymentDone: false,
    companyName: '', brandName: '', ownerName: '', phone: '', email: '', password: '',
    gst: '', regNumber: '', regAddress: '', opAddress: '', city: '', state: '', pincode: '', website: '',
    services: '', specializations: '', serviceAreas: '', staffCount: '', is247: false, shiftSupport: false, comboServices: false,
    tradeLicence: '', gstCert: '', regCert: '', pan: '', ownerIdProof: '', supportPhone: '',
    bankAccount: '', ifsc: '',
    staffLogins: '', modulesRequired: '', needBrandedPage: false, needSubdomain: false, notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const pincodeLookup = usePincodeAutoFill(form.pincode);

  useEffect(() => {
    if (pincodeLookup.city && pincodeLookup.state) {
      setForm(f => ({ ...f, city: pincodeLookup.city, state: pincodeLookup.state }));
    }
  }, [pincodeLookup.city, pincodeLookup.state]);

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  const handlePlanSelect = async (planId: string) => {
    update('planId', planId);
    // Fetch plan price
    const { data } = await supabase.from('subscription_plans').select('*').eq('id', planId).single();
    if (data) {
      setSelectedPlanDetails(data);
      setForm(f => ({ ...f, planId, planPrice: data.price_monthly || 0 }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await signUp(form.email, form.password, { full_name: form.ownerName, phone: form.phone, registration_type: 'agency' });
    if (error) {
      setIsSubmitting(false);
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        await supabase.functions.invoke('provision-tenant', {
          body: {
            user_id: user.id,
            plan_id: form.planId,
            tenant_name: form.companyName || form.brandName,
            tenant_type: 'agency',
            domain_slug: (form.brandName || form.companyName).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            contact_email: form.email,
            contact_phone: form.phone,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            gst_number: form.gst,
            registration_number: form.regNumber,
          },
        });
      } catch (e) {
        console.error('Tenant provisioning error:', e);
      }
    }

    setIsSubmitting(false);
    toast({ title: 'Application submitted!', description: 'Your agency portal is being set up. Check your email to verify your account.' });
    navigate('/auth');
  };

  if (showTour) {
    return <FeatureTour role="agency" onComplete={() => setShowTour(false)} />;
  }

  return (
    <MultiStepForm title="Homecare Agency Registration" steps={steps} onSubmit={handleSubmit} isSubmitting={isSubmitting}>
      {(step, next, prev) => (
        <div className="space-y-4">
          {step === 0 && (
            <PlanSelector selectedPlanId={form.planId} onSelect={handlePlanSelect} />
          )}
          {step === 1 && (
            <>
              {form.planPrice > 0 && !form.paymentDone ? (
                <PaymentSimulation
                  amount={form.planPrice}
                  onPaymentComplete={() => {
                    setForm(f => ({ ...f, paymentDone: true }));
                    toast({ title: 'Payment successful!', description: 'Your plan has been activated.' });
                  }}
                  onBack={prev}
                  loading={false}
                  receipt={`plan_${form.planId}`}
                  description={`Subscription: ${selectedPlanDetails?.name || 'Plan'}`}
                />
              ) : form.planPrice === 0 || (selectedPlanDetails?.is_free_trial) ? (
                <div className="text-center py-8">
                  <p className="font-display text-lg font-semibold text-foreground">Free Trial / No Payment Required</p>
                  <p className="text-sm text-muted-foreground mt-1">You can proceed directly to registration.</p>
                  <Button className="mt-4 gradient-primary border-0" onClick={next}>Continue</Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-display text-lg font-semibold text-success">✓ Payment Complete</p>
                  <p className="text-sm text-muted-foreground mt-1">Your plan is activated. Continue with registration.</p>
                  <Button className="mt-4 gradient-primary border-0" onClick={next}>Continue</Button>
                </div>
              )}
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Company Name *</Label><Input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Brand Name</Label><Input value={form.brandName} onChange={(e) => update('brandName', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Owner / Admin Name *</Label><Input value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
                <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={8} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>GST Number</Label><Input value={form.gst} onChange={(e) => update('gst', e.target.value)} /></div>
                <div className="space-y-2"><Label>Registration Number</Label><Input value={form.regNumber} onChange={(e) => update('regNumber', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Registered Address</Label><Input value={form.regAddress} onChange={(e) => update('regAddress', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <div className="relative">
                    <Input value={form.pincode} onChange={(e) => update('pincode', e.target.value)} placeholder="6-digit pincode" />
                    {pincodeLookup.loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  {pincodeLookup.error && <p className="text-xs text-destructive">{pincodeLookup.error}</p>}
                </div>
                <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => update('city', e.target.value)} readOnly={!!pincodeLookup.city} className={pincodeLookup.city ? 'bg-muted' : ''} /></div>
                <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={(e) => update('state', e.target.value)} readOnly={!!pincodeLookup.state} className={pincodeLookup.state ? 'bg-muted' : ''} /></div>
              </div>
              <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={(e) => update('website', e.target.value)} /></div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="space-y-2"><Label>Services Offered</Label><Textarea value={form.services} onChange={(e) => update('services', e.target.value)} placeholder="Home nursing, elder care, baby care..." /></div>
              <div className="space-y-2"><Label>Specialization Types</Label><Textarea value={form.specializations} onChange={(e) => update('specializations', e.target.value)} placeholder="Cardiac, post-surgery, neuro..." /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Service Areas</Label><Input value={form.serviceAreas} onChange={(e) => update('serviceAreas', e.target.value)} placeholder="Kochi, Trivandrum..." /></div>
                <div className="space-y-2"><Label>Staff Count</Label><Input type="number" value={form.staffCount} onChange={(e) => update('staffCount', e.target.value)} /></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Checkbox checked={form.is247} onCheckedChange={(v) => update('is247', v)} /><Label>24/7 Availability</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.shiftSupport} onCheckedChange={(v) => update('shiftSupport', v)} /><Label>Shift Support</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.comboServices} onCheckedChange={(v) => update('comboServices', v)} /><Label>Combo Services</Label></div>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-sm text-muted-foreground">Document upload will be available after account creation. Please have these ready.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Trade Licence No.</Label><Input value={form.tradeLicence} onChange={(e) => update('tradeLicence', e.target.value)} /></div>
                <div className="space-y-2"><Label>PAN</Label><Input value={form.pan} onChange={(e) => update('pan', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Support Phone</Label><Input value={form.supportPhone} onChange={(e) => update('supportPhone', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Bank Account Number</Label><Input value={form.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} /></div>
                <div className="space-y-2"><Label>IFSC Code</Label><Input value={form.ifsc} onChange={(e) => update('ifsc', e.target.value)} /></div>
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Staff Logins Needed</Label><Input type="number" value={form.staffLogins} onChange={(e) => update('staffLogins', e.target.value)} /></div>
                <div className="space-y-2"><Label>Modules Required</Label><Input value={form.modulesRequired} onChange={(e) => update('modulesRequired', e.target.value)} placeholder="Homecare, E-commerce..." /></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Checkbox checked={form.needBrandedPage} onCheckedChange={(v) => update('needBrandedPage', v)} /><Label>Need Branded Landing Page</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.needSubdomain} onCheckedChange={(v) => update('needSubdomain', v)} /><Label>Need Custom Subdomain</Label></div>
              </div>
              <div className="space-y-2"><Label>Additional Notes</Label><Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} /></div>
            </>
          )}
          {step !== 1 && (
            <div className="flex justify-between pt-4">
              {step > 0 ? <Button variant="outline" onClick={prev}>Previous</Button> : <div />}
              <Button onClick={next} className="gradient-primary border-0" disabled={isSubmitting || (step === 0 && !form.planId)}>
                {step === steps.length - 1 ? (isSubmitting ? 'Submitting...' : 'Submit Application') : 'Next'}
              </Button>
            </div>
          )}
        </div>
      )}
    </MultiStepForm>
  );
}
