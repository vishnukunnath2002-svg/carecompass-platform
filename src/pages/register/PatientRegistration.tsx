import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiStepForm from '@/components/registration/MultiStepForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePincodeAutoFill } from '@/hooks/usePincodeAutoFill';
import { Loader2 } from 'lucide-react';
const steps = [
  { title: 'Account', description: 'Create your login credentials.' },
  { title: 'Patient Profile', description: 'Tell us about the patient who needs care.' },
  { title: 'Address', description: 'Where should providers come?' },
  { title: 'Family Sharing', description: 'Optionally add family members.' },
];

export default function PatientRegistration() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '',
    patientName: '', age: '', gender: '', bloodGroup: '', conditions: '', allergies: '', medications: '', careNotes: '', emergencyName: '', emergencyPhone: '',
    address1: '', address2: '', city: '', state: '', pincode: '',
    familyName: '', familyRelation: '', familyPhone: '', familyEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await signUp(form.email, form.password, { full_name: form.fullName, phone: form.phone });
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!', description: 'Please check your email to verify.' });
      navigate('/auth');
    }
  };

  return (
    <MultiStepForm title="Patient / Family Registration" steps={steps} onSubmit={handleSubmit} isSubmitting={isSubmitting}>
      {(step, next, prev) => (
        <div className="space-y-4">
          {step === 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="John Doe" required /></div>
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 9876543210" /></div>
              </div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required /></div>
              <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 8 characters" required minLength={8} /></div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Patient Name *</Label><Input value={form.patientName} onChange={(e) => update('patientName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Blood Group</Label><Input value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)} placeholder="e.g. O+" /></div>
              </div>
              <div className="space-y-2"><Label>Medical Conditions</Label><Textarea value={form.conditions} onChange={(e) => update('conditions', e.target.value)} placeholder="Diabetes, hypertension..." /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Allergies</Label><Input value={form.allergies} onChange={(e) => update('allergies', e.target.value)} placeholder="Penicillin, dust..." /></div>
                <div className="space-y-2"><Label>Current Medications</Label><Input value={form.medications} onChange={(e) => update('medications', e.target.value)} placeholder="Metformin 500mg..." /></div>
              </div>
              <div className="space-y-2"><Label>Special Care Notes</Label><Textarea value={form.careNotes} onChange={(e) => update('careNotes', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Emergency Contact Name</Label><Input value={form.emergencyName} onChange={(e) => update('emergencyName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Emergency Contact Phone</Label><Input value={form.emergencyPhone} onChange={(e) => update('emergencyPhone', e.target.value)} /></div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="space-y-2"><Label>Address Line 1 *</Label><Input value={form.address1} onChange={(e) => update('address1', e.target.value)} /></div>
              <div className="space-y-2"><Label>Address Line 2</Label><Input value={form.address2} onChange={(e) => update('address2', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>City *</Label><Input value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
                <div className="space-y-2"><Label>State *</Label><Input value={form.state} onChange={(e) => update('state', e.target.value)} /></div>
                <div className="space-y-2"><Label>Pincode *</Label><Input value={form.pincode} onChange={(e) => update('pincode', e.target.value)} /></div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">Add a family member who can also manage this patient's care. This is optional.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Family Member Name</Label><Input value={form.familyName} onChange={(e) => update('familyName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Relation</Label><Input value={form.familyRelation} onChange={(e) => update('familyRelation', e.target.value)} placeholder="Spouse, Child, Parent..." /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Phone</Label><Input value={form.familyPhone} onChange={(e) => update('familyPhone', e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.familyEmail} onChange={(e) => update('familyEmail', e.target.value)} /></div>
              </div>
            </>
          )}
          <div className="flex justify-between pt-4">
            {step > 0 ? <Button variant="outline" onClick={prev}>Previous</Button> : <div />}
            <Button onClick={next} className="gradient-primary border-0" disabled={isSubmitting}>
              {step === steps.length - 1 ? (isSubmitting ? 'Creating...' : 'Create Account') : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </MultiStepForm>
  );
}
