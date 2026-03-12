import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Users, Building2, Stethoscope, ShoppingBag, Store, ArrowLeft } from 'lucide-react';

const registrationTypes = [
  { id: 'patient', label: 'Patient / Family', desc: 'Book care, order medicines, shop medical products.', icon: Users, path: '/register/patient', color: 'bg-info' },
  { id: 'agency', label: 'Homecare Agency / Firm', desc: 'Register your healthcare agency to manage staff and bookings.', icon: Building2, path: '/register/agency', color: 'bg-primary' },
  { id: 'provider', label: 'Individual Provider', desc: 'Nurses, caregivers, companions — join as an independent provider.', icon: Stethoscope, path: '/register/provider', color: 'bg-accent' },
  { id: 'business', label: 'Business Partner', desc: 'Medical vendors, suppliers, or pharmacy stores.', icon: ShoppingBag, path: '/register/business', color: 'bg-warning' },
  { id: 'hospital', label: 'Hospital', desc: 'Institutional procurement, RFQs, and discharge care.', icon: Hospital, path: '/register/hospital', color: 'bg-destructive' },
];

const businessSubTypes = [
  { id: 'vendor', label: 'Medical Vendor / Supplier', desc: 'Sell medical products and equipment.', path: '/register/vendor' },
  { id: 'store', label: 'Medical Store / Pharmacy', desc: 'Serve nearby customers with medicines and supplies.', path: '/register/store' },
];

export default function RegisterSelect() {
  const [showBusinessSub, setShowBusinessSub] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container flex h-14 items-center">
          <Link to="/auth" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">CYLO</span>
          </Link>
        </div>
      </div>

      <div className="container max-w-2xl py-12">
        {!showBusinessSub ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground">Join CYLO</h1>
              <p className="mt-2 text-muted-foreground">Choose your account type to get started.</p>
            </div>
            <div className="space-y-3">
              {registrationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => type.id === 'business' ? setShowBusinessSub(true) : navigate(type.path)}
                  className="flex w-full items-center gap-4 rounded-xl border bg-card p-5 text-left shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${type.color}`}>
                    <type.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-foreground">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <Button variant="ghost" size="sm" onClick={() => setShowBusinessSub(false)} className="mb-4">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <h1 className="font-display text-3xl font-bold text-foreground">Business Partner Type</h1>
              <p className="mt-2 text-muted-foreground">What type of business are you registering?</p>
            </div>
            <div className="space-y-3">
              {businessSubTypes.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => navigate(sub.path)}
                  className="flex w-full items-center gap-4 rounded-xl border bg-card p-5 text-left shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning">
                    {sub.id === 'vendor' ? <ShoppingBag className="h-6 w-6 text-primary-foreground" /> : <Store className="h-6 w-6 text-primary-foreground" />}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-foreground">{sub.label}</div>
                    <div className="text-sm text-muted-foreground">{sub.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
