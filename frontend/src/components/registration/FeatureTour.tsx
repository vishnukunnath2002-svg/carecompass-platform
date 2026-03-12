import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowLeft, ArrowRight, Users, CalendarDays, Star, ShoppingBag, Package, Pill, Truck, FileText, BarChart3, Shield, BadgeCheck, Wallet, Stethoscope, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type RoleType = 'agency' | 'provider' | 'vendor' | 'store';

interface Slide {
  title: string;
  description: string;
  icon: any;
  features: string[];
  gradient: string;
}

const tourSlides: Record<RoleType, Slide[]> = {
  agency: [
    {
      title: 'Manpower Marketplace',
      description: 'Manage your homecare workforce efficiently with smart booking allocation and staff tracking.',
      icon: Users,
      features: ['Staff onboarding & verification', 'Smart booking allocation', 'Real-time staff tracking', 'Reviews & rating management'],
      gradient: 'from-primary to-accent',
    },
    {
      title: 'Medical Equipment Procurement',
      description: 'Browse and purchase medical equipment from verified vendors at competitive prices.',
      icon: ShoppingBag,
      features: ['Browse vendor catalogues', 'Bulk ordering discounts', 'Order & shipment tracking', 'Inventory management'],
      gradient: 'from-accent to-success',
    },
    {
      title: 'Pharmacy Connect',
      description: 'Partner with nearby pharmacies to offer medication fulfillment to your patients.',
      icon: Pill,
      features: ['Pharmacy partnership management', 'Patient-to-pharmacy referrals', 'Prescription coordination', 'Referral analytics'],
      gradient: 'from-warning to-destructive',
    },
    {
      title: 'Analytics & Growth',
      description: 'Powerful insights to grow your agency with data-driven decisions.',
      icon: BarChart3,
      features: ['Revenue analytics', 'Staff performance metrics', 'Booking trends', 'Commission tracking'],
      gradient: 'from-primary to-info',
    },
  ],
  provider: [
    {
      title: 'Get Discovered',
      description: 'Create your professional profile and get matched with patients who need your skills.',
      icon: BadgeCheck,
      features: ['Professional profile page', 'Skill & specialization tags', 'Verification badges', 'Rating & reviews showcase'],
      gradient: 'from-accent to-success',
    },
    {
      title: 'Manage Bookings',
      description: 'Accept, track, and complete bookings with a streamlined workflow.',
      icon: CalendarDays,
      features: ['Real-time booking alerts', 'Schedule management', 'Patient vitals & notes', 'Shift tracking'],
      gradient: 'from-primary to-accent',
    },
    {
      title: 'Earn & Grow',
      description: 'Track your earnings, get timely payouts, and build your career.',
      icon: Wallet,
      features: ['Transparent earnings dashboard', 'Bank payout management', 'Training & certifications', 'Performance analytics'],
      gradient: 'from-warning to-destructive',
    },
  ],
  vendor: [
    {
      title: 'Product Catalogue',
      description: 'List your medical products and reach agencies, hospitals, and stores across the platform.',
      icon: Package,
      features: ['Unlimited product listings', 'Category & brand management', 'Bulk upload support', 'Pricing tiers (B2B/B2C)'],
      gradient: 'from-warning to-accent',
    },
    {
      title: 'Order Management',
      description: 'Process orders efficiently with dispatch tracking and return handling.',
      icon: Truck,
      features: ['Real-time order pipeline', 'Dispatch & tracking', 'Return management', 'Bulk order support'],
      gradient: 'from-primary to-accent',
    },
    {
      title: 'Analytics & Payouts',
      description: 'Track sales performance and receive timely payouts.',
      icon: BarChart3,
      features: ['Sales analytics', 'Inventory insights', 'Commission tracking', 'Automated payouts'],
      gradient: 'from-accent to-warning',
    },
  ],
  store: [
    {
      title: 'Inventory Management',
      description: 'Digitize your pharmacy inventory with smart stock tracking and alerts.',
      icon: Package,
      features: ['Digital inventory', 'Stock level alerts', 'Category management', 'Prescription tagging'],
      gradient: 'from-success to-accent',
    },
    {
      title: 'Online Orders',
      description: 'Receive and fulfill orders from patients in your catchment area.',
      icon: ShoppingBag,
      features: ['Catchment-based delivery', 'Prescription verification', 'Order tracking', 'Delivery management'],
      gradient: 'from-primary to-accent',
    },
    {
      title: 'Agency Partnerships',
      description: 'Partner with homecare agencies to receive patient referrals for medication needs.',
      icon: Stethoscope,
      features: ['Partnership requests', 'Referral tracking', 'Revenue from referrals', 'Coordinated care'],
      gradient: 'from-warning to-destructive',
    },
    {
      title: 'Growth Tools',
      description: 'Analytics, ratings, and tools to grow your pharmacy business.',
      icon: BarChart3,
      features: ['Sales analytics', 'Customer ratings', 'Payout tracking', 'Operating hours management'],
      gradient: 'from-accent to-primary',
    },
  ],
};

interface FeatureTourProps {
  role: RoleType;
  onComplete: () => void;
}

export default function FeatureTour({ role, onComplete }: FeatureTourProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = tourSlides[role];

  const next = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    else onComplete();
  };

  const prev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container flex h-14 items-center">
          <Link to="/register" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">CYLO</span>
          </Link>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Discover What CYLO Offers You
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore the features and tools available for your business
          </p>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Main slide card */}
        <Card className="border shadow-elevated overflow-hidden">
          <div className={cn('bg-gradient-to-r p-8 text-primary-foreground', slide.gradient)}>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">{slide.title}</h2>
                <p className="mt-1 text-sm opacity-90">{slide.description}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-8">
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Key Features
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {slide.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={prev} disabled={currentSlide === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} of {slides.length}
          </span>
          <Button onClick={next} className="gradient-primary border-0">
            {currentSlide === slides.length - 1 ? (
              'Get Started →'
            ) : (
              <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>

        {/* Skip button */}
        <div className="text-center mt-4">
          <Button variant="link" className="text-muted-foreground" onClick={onComplete}>
            Skip tour & start registration
          </Button>
        </div>
      </div>
    </div>
  );
}
