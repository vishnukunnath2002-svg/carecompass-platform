import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Clock, Award, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AgencyService {
  id: string;
  name: string;
  description: string | null;
  service_type: string;
  price_hourly: number | null;
  price_daily: number | null;
  price_weekly: number | null;
  conditions_served: string[];
  rating: number | null;
  review_count: number | null;
  assigned_staff: string[] | null;
  equipment_suggestions: string[] | null;
  tenant_id: string;
}

interface StaffMember {
  id: string;
  provider_type: string;
  qualification: string | null;
  years_experience: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  rating: number | null;
  bio: string | null;
}

interface EquipmentItem {
  id: string;
  name: string;
  price: number;
  brand: string | null;
}

const typeLabel: Record<string, string> = {
  nurse: 'Home Nurse', caregiver: 'Caregiver', companion: 'Companion',
  nanny: 'Baby Care / Nanny', helper: 'Helper', physiotherapist: 'Physiotherapist',
};

interface Props {
  service: AgencyService | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ServiceDetailDialog({ service, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    if (!service || !open) {
      setStaff([]);
      setEquipment([]);
      return;
    }

    if (service.assigned_staff && service.assigned_staff.length > 0) {
      supabase.from('caregiver_profiles')
        .select('id, provider_type, qualification, years_experience, specializations, languages, rating, bio')
        .in('id', service.assigned_staff)
        .then(({ data }) => setStaff((data as StaffMember[]) || []));
    } else {
      setStaff([]);
    }

    if (service.equipment_suggestions && service.equipment_suggestions.length > 0) {
      supabase.from('products')
        .select('id, name, price, brand')
        .in('id', service.equipment_suggestions)
        .then(({ data }) => setEquipment((data as EquipmentItem[]) || []));
    } else {
      setEquipment([]);
    }
  }, [service, open]);

  if (!service) return null;

  const handleBook = () => {
    onOpenChange(false);
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/patient/book?service=${service.id}`)}`);
    } else {
      navigate(`/patient/book?service=${service.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {service.name}
            <Badge variant="secondary" className="bg-success/10 text-success text-xs">
              <CheckCircle className="mr-1 h-3 w-3" /> Verified
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Type & Rating */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20">{typeLabel[service.service_type] || service.service_type}</Badge>
            {(service.rating ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-warning">
                <Star className="h-4 w-4 fill-warning" /> {service.rating}
                <span className="text-muted-foreground">({service.review_count} reviews)</span>
              </div>
            )}
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">About</h4>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          )}

          {/* Conditions */}
          {service.conditions_served?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Conditions Served</h4>
              <div className="flex flex-wrap gap-1.5">
                {service.conditions_served.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Pricing</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              {service.price_hourly && (
                <div>
                  <div className="text-lg font-bold text-foreground">₹{service.price_hourly}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
              )}
              {service.price_daily && (
                <div>
                  <div className="text-lg font-bold text-foreground">₹{service.price_daily}</div>
                  <div className="text-xs text-muted-foreground">per day</div>
                </div>
              )}
              {service.price_weekly && (
                <div>
                  <div className="text-lg font-bold text-foreground">₹{service.price_weekly}</div>
                  <div className="text-xs text-muted-foreground">per week</div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Staff */}
          {staff.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Assigned Staff ({staff.length})
              </h4>
              <div className="space-y-2">
                {staff.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm text-foreground">{typeLabel[s.provider_type] || s.provider_type}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {s.qualification} · {s.years_experience || 0} yrs exp
                        </span>
                      </div>
                      {(s.rating ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-warning">
                          <Star className="h-3 w-3 fill-warning" /> {s.rating}
                        </span>
                      )}
                    </div>
                    {s.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.bio}</p>}
                    {s.specializations && s.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.specializations.slice(0, 4).map((sp) => (
                          <Badge key={sp} variant="outline" className="text-[10px] px-1.5 py-0">{sp}</Badge>
                        ))}
                      </div>
                    )}
                    {s.languages && s.languages.length > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1">🗣 {s.languages.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Equipment */}
          {equipment.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Package className="h-4 w-4" /> Suggested Equipment ({equipment.length})
              </h4>
              <div className="grid gap-2 grid-cols-2">
                {equipment.map((eq) => (
                  <div key={eq.id} className="rounded-lg border p-2 text-sm">
                    <p className="font-medium text-foreground truncate">{eq.name}</p>
                    {eq.brand && <p className="text-xs text-muted-foreground">{eq.brand}</p>}
                    <p className="text-xs font-semibold text-primary mt-0.5">₹{eq.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button className="w-full gradient-primary border-0" onClick={handleBook}>
            Book This Service
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
