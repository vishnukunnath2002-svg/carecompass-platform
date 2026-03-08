import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import MultiStepForm from '@/components/registration/MultiStepForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { title: 'Store Profile', description: 'Basic store information.' },
  { title: 'Documents', description: 'Licence and verification.' },
  { title: 'Operations', description: 'Delivery and catchment setup.' },
  { title: 'Inventory Starter', description: 'Add initial products.' },
];

export default function StoreRegistration() {
  const [form, setForm] = useState({
    storeName: '', ownerName: '', phone: '', email: '', password: '', storeAddress: '', gst: '', drugLicence: '',
    drugLicenceCert: '', ownerIdProof: '',
    catchmentPincodes: '', catchmentRadius: '', operatingHours: '', deliveryAvailable: true, ownDeliveryStaff: false,
    minOrderValue: '', deliveryFee: '', emergencyPhone: '',
    starterProducts: [{ name: '', brand: '', qty: '', price: '', category: '', prescriptionRequired: false }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  const addProduct = () => {
    setForm({ ...form, starterProducts: [...form.starterProducts, { name: '', brand: '', qty: '', price: '', category: '', prescriptionRequired: false }] });
  };

  const updateProduct = (index: number, key: string, value: any) => {
    const products = [...form.starterProducts];
    products[index] = { ...products[index], [key]: value };
    setForm({ ...form, starterProducts: products });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await signUp(form.email, form.password, { full_name: form.ownerName, phone: form.phone, registration_type: 'medical_store' });
    setIsSubmitting(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Application submitted!', description: 'We will verify and activate your store.' });
      navigate('/auth');
    }
  };

  return (
    <MultiStepForm title="Medical Store Registration" steps={steps} onSubmit={handleSubmit} isSubmitting={isSubmitting}>
      {(step, next, prev) => (
        <div className="space-y-4">
          {step === 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Store Name *</Label><Input value={form.storeName} onChange={(e) => update('storeName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Owner Name *</Label><Input value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={8} /></div>
              <div className="space-y-2"><Label>Store Address *</Label><Input value={form.storeAddress} onChange={(e) => update('storeAddress', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Drug Licence Number</Label><Input value={form.drugLicence} onChange={(e) => update('drugLicence', e.target.value)} /></div>
                <div className="space-y-2"><Label>GST Number</Label><Input value={form.gst} onChange={(e) => update('gst', e.target.value)} /></div>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">Document uploads (photos, certificates) will be available after approval. Provide reference numbers.</p>
              <div className="space-y-2"><Label>Drug Licence Certificate No.</Label><Input value={form.drugLicenceCert} onChange={(e) => update('drugLicenceCert', e.target.value)} /></div>
              <div className="space-y-2"><Label>Owner ID Proof (Aadhaar/PAN)</Label><Input value={form.ownerIdProof} onChange={(e) => update('ownerIdProof', e.target.value)} /></div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Catchment Pincodes</Label><Input value={form.catchmentPincodes} onChange={(e) => update('catchmentPincodes', e.target.value)} placeholder="682001, 682002..." /></div>
                <div className="space-y-2"><Label>Catchment Radius (km)</Label><Input type="number" value={form.catchmentRadius} onChange={(e) => update('catchmentRadius', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Operating Hours</Label><Input value={form.operatingHours} onChange={(e) => update('operatingHours', e.target.value)} placeholder="Mon-Sat: 8 AM - 10 PM" /></div>
              <div className="space-y-3">
                <div className="flex items-center gap-2"><Checkbox checked={form.deliveryAvailable} onCheckedChange={(v) => update('deliveryAvailable', v)} /><Label>Delivery Available</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.ownDeliveryStaff} onCheckedChange={(v) => update('ownDeliveryStaff', v)} /><Label>Own Delivery Staff</Label></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Minimum Order Value (₹)</Label><Input type="number" value={form.minOrderValue} onChange={(e) => update('minOrderValue', e.target.value)} /></div>
                <div className="space-y-2"><Label>Delivery Fee (₹)</Label><Input type="number" value={form.deliveryFee} onChange={(e) => update('deliveryFee', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Emergency Contact</Label><Input value={form.emergencyPhone} onChange={(e) => update('emergencyPhone', e.target.value)} /></div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">Add a few products to get started. You can add more after approval.</p>
              {form.starterProducts.map((p, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="text-sm font-medium text-foreground">Product {i + 1}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Product Name" value={p.name} onChange={(e) => updateProduct(i, 'name', e.target.value)} />
                    <Input placeholder="Brand" value={p.brand} onChange={(e) => updateProduct(i, 'brand', e.target.value)} />
                    <Input placeholder="Quantity" type="number" value={p.qty} onChange={(e) => updateProduct(i, 'qty', e.target.value)} />
                    <Input placeholder="Price (₹)" type="number" value={p.price} onChange={(e) => updateProduct(i, 'price', e.target.value)} />
                    <Input placeholder="Category" value={p.category} onChange={(e) => updateProduct(i, 'category', e.target.value)} />
                    <div className="flex items-center gap-2"><Checkbox checked={p.prescriptionRequired} onCheckedChange={(v) => updateProduct(i, 'prescriptionRequired', v)} /><Label className="text-sm">Prescription Required</Label></div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addProduct}>+ Add Another Product</Button>
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
