import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import MultiStepForm from '@/components/registration/MultiStepForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { title: 'Company Details', description: 'Basic company information.' },
  { title: 'Compliance', description: 'Licences and certifications.' },
  { title: 'Payout Setup', description: 'Banking details for payouts.' },
  { title: 'Go Live', description: 'Product and delivery configuration.' },
];

export default function VendorRegistration() {
  const [form, setForm] = useState({
    companyName: '', businessType: '', contactName: '', phone: '', email: '', password: '', gst: '', address: '',
    drugLicence: '', mfgLicence: '', isoCert: '', letterhead: '',
    accountHolder: '', bankAccount: '', ifsc: '', billingEmail: '',
    categories: '', leadTime: '', moq: '', b2bSupport: false, rfqParticipation: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await signUp(form.email, form.password, { full_name: form.contactName, phone: form.phone, registration_type: 'vendor' });
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Application submitted!', description: 'We will review and activate your vendor account.' });
      navigate('/auth');
    }
  };

  return (
    <MultiStepForm title="Medical Vendor Registration" steps={steps} onSubmit={handleSubmit} isSubmitting={isSubmitting}>
      {(step, next, prev) => (
        <div className="space-y-4">
          {step === 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Company Name *</Label><Input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Business Type</Label><Input value={form.businessType} onChange={(e) => update('businessType', e.target.value)} placeholder="Manufacturer, Distributor..." /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Contact Person *</Label><Input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
                <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={8} /></div>
              </div>
              <div className="space-y-2"><Label>GST Number</Label><Input value={form.gst} onChange={(e) => update('gst', e.target.value)} /></div>
              <div className="space-y-2"><Label>Registered Address</Label><Textarea value={form.address} onChange={(e) => update('address', e.target.value)} /></div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">Provide licence/certificate numbers. Documents can be uploaded after approval.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Drug Licence No.</Label><Input value={form.drugLicence} onChange={(e) => update('drugLicence', e.target.value)} /></div>
                <div className="space-y-2"><Label>Manufacturing Licence No.</Label><Input value={form.mfgLicence} onChange={(e) => update('mfgLicence', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>ISO Certificate No.</Label><Input value={form.isoCert} onChange={(e) => update('isoCert', e.target.value)} /></div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="space-y-2"><Label>Account Holder Name</Label><Input value={form.accountHolder} onChange={(e) => update('accountHolder', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Bank Account Number</Label><Input value={form.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} /></div>
                <div className="space-y-2"><Label>IFSC Code</Label><Input value={form.ifsc} onChange={(e) => update('ifsc', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Billing Email</Label><Input type="email" value={form.billingEmail} onChange={(e) => update('billingEmail', e.target.value)} /></div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="space-y-2"><Label>Product Categories</Label><Textarea value={form.categories} onChange={(e) => update('categories', e.target.value)} placeholder="Medical devices, consumables, PPE..." /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Delivery Lead Time</Label><Input value={form.leadTime} onChange={(e) => update('leadTime', e.target.value)} placeholder="2-5 days" /></div>
                <div className="space-y-2"><Label>Minimum Order Qty</Label><Input type="number" value={form.moq} onChange={(e) => update('moq', e.target.value)} /></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Checkbox checked={form.b2bSupport} onCheckedChange={(v) => update('b2bSupport', v)} /><Label>B2B Support</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.rfqParticipation} onCheckedChange={(v) => update('rfqParticipation', v)} /><Label>Participate in RFQs</Label></div>
              </div>
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
