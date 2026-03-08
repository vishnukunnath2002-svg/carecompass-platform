import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import MultiStepForm from '@/components/registration/MultiStepForm';
import FeatureTour from '@/components/registration/FeatureTour';
import PlanSelector from '@/components/registration/PlanSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const steps = [
  { title: 'Choose Plan', description: 'Select a subscription plan.' },
  { title: 'Provider Type', description: 'What type of care do you provide?' },
  { title: 'Personal Details', description: 'Your personal information.' },
  { title: 'Professional Details', description: 'Qualifications and experience.' },
  { title: 'Verification', description: 'ID and certification documents.' },
  { title: 'Work Setup', description: 'Availability and pricing.' },
];

const providerTypes = [
  { value: 'home_nurse', label: 'Home Nurse' },
  { value: 'specialized_nurse', label: 'Specialized Nurse' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'baby_care', label: 'Baby Care / Nanny' },
  { value: 'companion', label: 'Companion' },
  { value: 'bystander', label: 'Bystander' },
  { value: 'domestic_helper', label: 'Domestic Helper' },
];

export default function ProviderRegistration() {
  const [showTour, setShowTour] = useState(true);
  const [form, setForm] = useState({
    planId: '' as string | null,
    providerType: '', fullName: '', phone: '', email: '', password: '', gender: '',
    dob: '', address: '', city: '', state: '', pincode: '', languages: '', workingAreas: '',
    qualification: '', regNumber: '', experience: '', skills: '', specializations: '',
    bankAccount: '', ifsc: '',
    aadhaarFront: '', aadhaarBack: '', panVoter: '', policeVerification: '', references: '',
    nursingCert: '',
    availableDays: '', availableHours: '', travelRadius: '', recurring: false,
    hourlyRate: '', dailyRate: '', weeklyRate: '', emergencyContact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await signUp(form.email, form.password, { full_name: form.fullName, phone: form.phone, registration_type: 'provider', provider_type: form.providerType });
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
            tenant_name: form.fullName,
            tenant_type: 'provider',
            domain_slug: form.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            contact_email: form.email,
            contact_phone: form.phone,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        });
      } catch (e) {
        console.error('Tenant provisioning error:', e);
      }
    }

    setIsSubmitting(false);
    toast({ title: 'Application submitted!', description: 'We will verify your documents and activate your profile.' });
    navigate('/auth');
  };

  if (showTour) {
    return <FeatureTour role="provider" onComplete={() => setShowTour(false)} />;
  }

  return (
    <MultiStepForm title="Individual Provider Registration" steps={steps} onSubmit={handleSubmit} isSubmitting={isSubmitting}>
      {(step, next, prev) => (
        <div className="space-y-4">
          {step === 0 && (
            <PlanSelector selectedPlanId={form.planId} onSelect={(id) => update('planId', id)} />
          )}
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {providerTypes.map((t) => (
                <button key={t.value} onClick={() => update('providerType', t.value)}
                  className={`rounded-xl border p-4 text-left transition-all ${form.providerType === t.value ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'bg-card hover:shadow-card'}`}>
                  <span className="font-display font-semibold text-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
                <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={8} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
                <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={(e) => update('state', e.target.value)} /></div>
                <div className="space-y-2"><Label>Pincode</Label><Input value={form.pincode} onChange={(e) => update('pincode', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Languages Spoken</Label><Input value={form.languages} onChange={(e) => update('languages', e.target.value)} placeholder="English, Malayalam, Hindi..." /></div>
                <div className="space-y-2"><Label>Preferred Working Areas</Label><Input value={form.workingAreas} onChange={(e) => update('workingAreas', e.target.value)} placeholder="Kochi, Ernakulam..." /></div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Qualification</Label><Input value={form.qualification} onChange={(e) => update('qualification', e.target.value)} placeholder="GNM, BSc Nursing..." /></div>
                <div className="space-y-2"><Label>Registration Number</Label><Input value={form.regNumber} onChange={(e) => update('regNumber', e.target.value)} placeholder="Nursing council reg. no." /></div>
              </div>
              <div className="space-y-2"><Label>Years of Experience</Label><Input type="number" value={form.experience} onChange={(e) => update('experience', e.target.value)} /></div>
              <div className="space-y-2"><Label>Skills</Label><Textarea value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="IV administration, wound care..." /></div>
              <div className="space-y-2"><Label>Specializations</Label><Textarea value={form.specializations} onChange={(e) => update('specializations', e.target.value)} placeholder="Cardiac, post-surgery, pediatric..." /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Bank Account Number</Label><Input value={form.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} /></div>
                <div className="space-y-2"><Label>IFSC Code</Label><Input value={form.ifsc} onChange={(e) => update('ifsc', e.target.value)} /></div>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-sm text-muted-foreground">Document uploads will be available after account creation.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Aadhaar Number</Label><Input value={form.aadhaarFront} onChange={(e) => update('aadhaarFront', e.target.value)} /></div>
                <div className="space-y-2"><Label>PAN / Voter ID</Label><Input value={form.panVoter} onChange={(e) => update('panVoter', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Police Verification Certificate No.</Label><Input value={form.policeVerification} onChange={(e) => update('policeVerification', e.target.value)} /></div>
              <div className="space-y-2"><Label>Reference Contacts</Label><Textarea value={form.references} onChange={(e) => update('references', e.target.value)} placeholder="Name - Phone - Relation" /></div>
              <div className="space-y-2"><Label>Nursing Certificate / Certification No.</Label><Input value={form.nursingCert} onChange={(e) => update('nursingCert', e.target.value)} /></div>
            </>
          )}
          {step === 5 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Available Days</Label><Input value={form.availableDays} onChange={(e) => update('availableDays', e.target.value)} placeholder="Mon-Fri, Weekends..." /></div>
                <div className="space-y-2"><Label>Available Hours</Label><Input value={form.availableHours} onChange={(e) => update('availableHours', e.target.value)} placeholder="8 AM - 8 PM" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Travel Radius (km)</Label><Input type="number" value={form.travelRadius} onChange={(e) => update('travelRadius', e.target.value)} /></div>
                <div className="flex items-center gap-2 pt-6"><Checkbox checked={form.recurring} onCheckedChange={(v) => update('recurring', v)} /><Label>Accept Recurring Jobs</Label></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Hourly Rate (₹)</Label><Input type="number" value={form.hourlyRate} onChange={(e) => update('hourlyRate', e.target.value)} /></div>
                <div className="space-y-2"><Label>Daily Rate (₹)</Label><Input type="number" value={form.dailyRate} onChange={(e) => update('dailyRate', e.target.value)} /></div>
                <div className="space-y-2"><Label>Weekly Rate (₹)</Label><Input type="number" value={form.weeklyRate} onChange={(e) => update('weeklyRate', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Emergency Contact</Label><Input value={form.emergencyContact} onChange={(e) => update('emergencyContact', e.target.value)} placeholder="Name - Phone" /></div>
            </>
          )}
          <div className="flex justify-between pt-4">
            {step > 0 ? <Button variant="outline" onClick={prev}>Previous</Button> : <div />}
            <Button onClick={next} className="gradient-primary border-0" disabled={isSubmitting}>
              {step === steps.length - 1 ? (isSubmitting ? 'Submitting...' : 'Submit Application') : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </MultiStepForm>
  );
}
