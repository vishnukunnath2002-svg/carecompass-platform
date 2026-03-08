import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '@/components/ui/multi-select';
import MultiStepForm from '@/components/registration/MultiStepForm';
import FeatureTour from '@/components/registration/FeatureTour';
import { usePincodeAutoFill } from '@/hooks/usePincodeAutoFill';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const steps = [
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
  { value: 'other', label: 'Other' },
];

const languageOptions = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'odia', label: 'Odia' },
  { value: 'assamese', label: 'Assamese' },
];

const cityOptions = [
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'pune', label: 'Pune' },
  { value: 'ahmedabad', label: 'Ahmedabad' },
  { value: 'kochi', label: 'Kochi' },
  { value: 'trivandrum', label: 'Trivandrum' },
  { value: 'kozhikode', label: 'Kozhikode' },
  { value: 'thrissur', label: 'Thrissur' },
  { value: 'jaipur', label: 'Jaipur' },
  { value: 'lucknow', label: 'Lucknow' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'bhopal', label: 'Bhopal' },
  { value: 'indore', label: 'Indore' },
  { value: 'nagpur', label: 'Nagpur' },
  { value: 'coimbatore', label: 'Coimbatore' },
  { value: 'goa', label: 'Goa' },
  { value: 'surat', label: 'Surat' },
  { value: 'visakhapatnam', label: 'Visakhapatnam' },
  { value: 'mysuru', label: 'Mysuru' },
  { value: 'mangalore', label: 'Mangalore' },
  { value: 'ernakulam', label: 'Ernakulam' },
];

export default function ProviderRegistration() {
  const [showTour, setShowTour] = useState(true);
  const [form, setForm] = useState({
    providerType: '', fullName: '', phone: '', email: '', password: '', confirmPassword: '', gender: '',
    dob: '', address: '', city: '', state: '', pincode: '', languages: [] as string[], workingAreas: [] as string[],
    qualification: '', regNumber: '', experience: '', skills: '', specializations: '',
    bankAccount: '', ifsc: '',
    aadhaarFront: '', aadhaarBack: '', panVoter: '', references: '',
    nursingCert: '',
    availableDays: '', availableHours: '', travelRadius: '', recurring: false,
    hourlyRate: '', dailyRate: '', weeklyRate: '', emergencyContact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
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
            plan_id: null,
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
            <div className="grid gap-3 sm:grid-cols-2">
              {providerTypes.map((t) => (
                <button key={t.value} onClick={() => update('providerType', t.value)}
                  className={`rounded-xl border p-4 text-left transition-all ${form.providerType === t.value ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'bg-card hover:shadow-card'}`}>
                  <span className="font-display font-semibold text-foreground">{t.label}</span>
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
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
                <div className="space-y-2"><Label>Confirm Password *</Label><Input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} minLength={8} /></div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <MultiSelect options={languageOptions} selected={form.languages} onChange={(v) => update('languages', v)} placeholder="Select languages..." />
                </div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
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
              <div className="space-y-2">
                <Label>Preferred Job Locations</Label>
                <MultiSelect options={cityOptions} selected={form.workingAreas} onChange={(v) => update('workingAreas', v)} placeholder="Select preferred cities..." />
              </div>
            </>
          )}
          {step === 2 && (
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
          {step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">Document uploads will be available after account creation. You can upload certificates from your dashboard.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Aadhaar Number</Label><Input value={form.aadhaarFront} onChange={(e) => update('aadhaarFront', e.target.value)} /></div>
                <div className="space-y-2"><Label>PAN / Voter ID</Label><Input value={form.panVoter} onChange={(e) => update('panVoter', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Reference Contacts</Label><Textarea value={form.references} onChange={(e) => update('references', e.target.value)} placeholder="Name - Phone - Relation" /></div>
              <div className="space-y-2"><Label>Nursing Certificate / Certification No.</Label><Input value={form.nursingCert} onChange={(e) => update('nursingCert', e.target.value)} /></div>
            </>
          )}
          {step === 4 && (
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
