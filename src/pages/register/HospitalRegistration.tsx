import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiStepForm from '@/components/registration/MultiStepForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePincodeAutoFill } from '@/hooks/usePincodeAutoFill';
import { Loader2 } from 'lucide-react';
const steps = [
  { title: 'Institution Details', description: 'Hospital information.' },
  { title: 'Account Type', description: 'What modules do you need?' },
  { title: 'Commercial Setup', description: 'Billing and payment preferences.' },
];

export default function HospitalRegistration() {
  const [form, setForm] = useState({
    hospitalName: '', gst: '', regCert: '', contactName: '', contactRole: '', phone: '', email: '', password: '',
    address: '', city: '', state: '', pincode: '',
    procurement: true, dischargeCoord: false, nursingManager: false,
    usersNeeded: '', monthlyEstimate: '', bulkOrdering: false, rfq: false, dischargeCare: false,
    billingAddress: '', accountsEmail: '', paymentPreference: '', creditRequest: false, poFormat: '', invoiceContact: '',
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
    setIsSubmitting(true);
    const { error } = await signUp(form.email, form.password, { full_name: form.contactName, phone: form.phone, registration_type: 'hospital' });
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Application submitted!', description: 'Our team will review and set up your hospital portal.' });
      navigate('/auth');
    }
  };

  return (
    <MultiStepForm title="Hospital Registration" steps={steps} onSubmit={handleSubmit} isSubmitting={isSubmitting}>
      {(step, next, prev) => (
        <div className="space-y-4">
          {step === 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Hospital Name *</Label><Input value={form.hospitalName} onChange={(e) => update('hospitalName', e.target.value)} /></div>
                <div className="space-y-2"><Label>GST Number</Label><Input value={form.gst} onChange={(e) => update('gst', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Registration Certificate No.</Label><Input value={form.regCert} onChange={(e) => update('regCert', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Contact Person *</Label><Input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Contact Role</Label><Input value={form.contactRole} onChange={(e) => update('contactRole', e.target.value)} placeholder="Procurement Head, Admin..." /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={8} /></div>
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
            </>
          )}
          {step === 1 && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Checkbox checked={form.procurement} onCheckedChange={(v) => update('procurement', v)} /><Label>Procurement Account</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.dischargeCoord} onCheckedChange={(v) => update('dischargeCoord', v)} /><Label>Discharge Coordination</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.nursingManager} onCheckedChange={(v) => update('nursingManager', v)} /><Label>Nursing Manager Account</Label></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Number of Users Needed</Label><Input type="number" value={form.usersNeeded} onChange={(e) => update('usersNeeded', e.target.value)} /></div>
                <div className="space-y-2"><Label>Monthly Order Estimate</Label><Input value={form.monthlyEstimate} onChange={(e) => update('monthlyEstimate', e.target.value)} placeholder="₹5-10 Lakhs" /></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Checkbox checked={form.bulkOrdering} onCheckedChange={(v) => update('bulkOrdering', v)} /><Label>Interested in Bulk Ordering</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.rfq} onCheckedChange={(v) => update('rfq', v)} /><Label>Interested in RFQ</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.dischargeCare} onCheckedChange={(v) => update('dischargeCare', v)} /><Label>Interested in Discharge Care</Label></div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="space-y-2"><Label>Billing Address</Label><Input value={form.billingAddress} onChange={(e) => update('billingAddress', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Accounts Email</Label><Input type="email" value={form.accountsEmail} onChange={(e) => update('accountsEmail', e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Payment Preference</Label>
                  <Select value={form.paymentPreference} onValueChange={(v) => update('paymentPreference', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2"><Checkbox checked={form.creditRequest} onCheckedChange={(v) => update('creditRequest', v)} /><Label>Request Credit Terms</Label></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>PO Format Preference</Label><Input value={form.poFormat} onChange={(e) => update('poFormat', e.target.value)} placeholder="PDF, Excel..." /></div>
                <div className="space-y-2"><Label>Invoice Contact</Label><Input value={form.invoiceContact} onChange={(e) => update('invoiceContact', e.target.value)} /></div>
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
