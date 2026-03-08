import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart, ShoppingBag, Store, Users, Shield, Clock, Star,
  ArrowRight, Stethoscope, Baby, UserCheck, Home, Activity,
  ChevronRight, Phone, Mail, MapPin
} from 'lucide-react';
import { BrowseServicesSection, ShopProductsSection, NearbyPharmaciesSection } from '@/components/landing/BrowseSections';

const serviceTypes = [
  { icon: Stethoscope, label: 'Home Nurses', desc: 'Qualified nurses for post-surgery, chronic care & more' },
  { icon: Heart, label: 'Specialized Care', desc: 'Cardiac, neuro, oncology, palliative specialists' },
  { icon: Users, label: 'Caregivers', desc: 'Compassionate daily care and companionship' },
  { icon: Baby, label: 'Baby & Child Care', desc: 'Experienced nannies and pediatric support' },
  { icon: UserCheck, label: 'Elder Care', desc: 'Dedicated companions and elderly support' },
  { icon: Home, label: 'Domestic Helpers', desc: 'Household support for patients and families' },
];

const modules = [
  {
    icon: Activity,
    title: 'Homecare Manpower',
    desc: 'Book verified nurses, caregivers, companions and specialists. Filter by condition, specialization, language & more.',
    color: 'hsl(217, 91%, 60%)',
    features: ['Book by specialization', 'Verified providers', 'Real-time tracking', 'Vitals logging'],
  },
  {
    icon: ShoppingBag,
    title: 'Medical E-Commerce',
    desc: 'Shop medical products, equipment and supplies from verified vendors. B2B and B2C procurement.',
    color: 'hsl(172, 66%, 50%)',
    features: ['Certified products', 'Bulk ordering', 'RFQ for hospitals', 'Track shipments'],
  },
  {
    icon: Store,
    title: 'Medical Store Connect',
    desc: 'Order medicines from nearby pharmacies. Upload prescriptions, get doorstep delivery.',
    color: 'hsl(38, 92%, 50%)',
    features: ['Nearby pharmacies', 'Prescription upload', 'Quick delivery', 'Reorder easily'],
  },
];

const stats = [
  { value: '500+', label: 'Verified Providers' },
  { value: '50+', label: 'Medical Stores' },
  { value: '10K+', label: 'Products' },
  { value: '25+', label: 'Specializations' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">CYLO</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#modules" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Platform</a>
            <a href="#providers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Providers</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button size="sm" className="gradient-primary border-0">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(217_91%_60%/0.15),_transparent_50%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Shield className="h-3.5 w-3.5" />
              India&apos;s Trusted Healthcare Marketplace
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Healthcare at Your
              <span className="block bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Fingertips
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/70">
              Book verified home nurses & caregivers, shop medical products, and order medicines from nearby stores — all from one platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/auth?tab=register">
                <Button size="lg" className="h-12 gap-2 rounded-xl bg-primary-foreground px-8 text-foreground hover:bg-primary-foreground/90">
                  Join as Patient / Family <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth?tab=register&type=business">
                <Button size="lg" variant="outline" className="h-12 rounded-xl border-primary-foreground/20 px-8 text-primary-foreground hover:bg-primary-foreground/10">
                  Register Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-foreground">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Homecare Services</h2>
            <p className="mt-3 text-muted-foreground">
              Find the right care professional for every need — verified, experienced, and available near you.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceTypes.map((s) => (
              <Card key={s.label} className="group cursor-pointer border bg-card shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{s.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Modules */}
      <section id="modules" className="bg-muted/50 py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">One Platform, Three Powerful Modules</h2>
            <p className="mt-3 text-muted-foreground">Everything healthcare — connected through a shared wallet, health records, and smart recommendations.</p>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {modules.map((m) => (
              <Card key={m.title} className="overflow-hidden border-0 bg-card shadow-elevated">
                <div className="h-1.5" style={{ background: m.color }} />
                <CardContent className="p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${m.color}15` }}>
                    <m.icon className="h-7 w-7" style={{ color: m.color }} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-foreground">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  <ul className="mt-5 space-y-2">
                    {m.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-3.5 w-3.5 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Providers / Businesses */}
      <section id="providers" className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Grow Your Healthcare Business</h2>
            <p className="mt-3 text-muted-foreground">Join as an agency, provider, vendor, pharmacy or hospital and get your own portal.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Homecare Agencies', desc: 'Manage your team, bookings, and revenue from one dashboard.', link: '/auth?tab=register&type=agency' },
              { title: 'Individual Providers', desc: 'Nurses, caregivers, and helpers — build your independent practice.', link: '/auth?tab=register&type=provider' },
              { title: 'Medical Vendors', desc: 'List products, manage inventory, participate in RFQs.', link: '/auth?tab=register&type=vendor' },
              { title: 'Medical Stores', desc: 'Reach nearby customers. Accept orders and prescriptions online.', link: '/auth?tab=register&type=store' },
              { title: 'Hospitals', desc: 'Bulk procurement, RFQs, discharge care coordination.', link: '/auth?tab=register&type=hospital' },
            ].map((b) => (
              <Link key={b.title} to={b.link}>
                <Card className="h-full cursor-pointer border bg-card shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5">
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground">{b.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Register now <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Services */}
      <BrowseServicesSection />

      {/* Shop Products */}
      <ShopProductsSection />

      {/* Nearby Pharmacies */}
      <NearbyPharmaciesSection />

      {/* CTA */}
      <section className="gradient-hero py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Ready to Transform Healthcare Access?</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/70">Join thousands of patients and healthcare businesses on CYLO.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/auth?tab=register">
              <Button size="lg" className="h-12 rounded-xl bg-primary-foreground px-8 text-foreground hover:bg-primary-foreground/90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-card py-16">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                  <Heart className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold text-foreground">CYLO</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">India's trusted multi-module healthcare marketplace platform.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground">Platform</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Homecare Services</li>
                <li>Medical Products</li>
                <li>Medical Stores</li>
                <li>For Hospitals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground">Contact</h4>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 800 123 4567</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@cylo.health</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kochi, Kerala, India</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
            © 2026 CYLO Healthcare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
