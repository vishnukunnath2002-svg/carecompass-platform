import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Clock, MapPin, Award, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Provider {
  id: string;
  user_id: string;
  provider_type: string;
  qualification: string | null;
  years_experience: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  hourly_rate: number | null;
  daily_rate: number | null;
  weekly_rate: number | null;
  rating: number | null;
  review_count: number | null;
  bio: string | null;
  is_available: boolean | null;
  skills: string[] | null;
}

interface Props {
  provider: Provider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const providerTypeLabel = (type: string) => {
  const map: Record<string, string> = { nurse: 'Nurse', caregiver: 'Caregiver', companion: 'Companion', nanny: 'Nanny', helper: 'Helper', physiotherapist: 'Physiotherapist' };
  return map[type] || type;
};

export default function ProviderProfileDialog({ provider, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {providerTypeLabel(provider.provider_type)}
            <Badge variant="secondary" className="bg-success/10 text-success text-xs">
              <CheckCircle className="mr-1 h-3 w-3" /> Verified
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Rating & Experience */}
          <div className="flex items-center gap-4">
            {provider.rating != null && provider.rating > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-warning">
                <Star className="h-4 w-4 fill-warning" /> {provider.rating}
                <span className="text-muted-foreground">({provider.review_count} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Award className="h-4 w-4" /> {provider.qualification || 'N/A'}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> {provider.years_experience || 0} yrs experience
            </div>
          </div>

          {/* Bio */}
          {provider.bio && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">About</h4>
              <p className="text-sm text-muted-foreground">{provider.bio}</p>
            </div>
          )}

          {/* Specializations */}
          {provider.specializations && provider.specializations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Specializations</h4>
              <div className="flex flex-wrap gap-1.5">
                {provider.specializations.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {provider.skills && provider.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {provider.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {provider.languages && provider.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Languages className="h-4 w-4" />
              {provider.languages.join(', ')}
            </div>
          )}

          {/* Rates */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Pricing</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              {provider.hourly_rate && (
                <div>
                  <div className="text-lg font-bold text-foreground">₹{provider.hourly_rate}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
              )}
              {provider.daily_rate && (
                <div>
                  <div className="text-lg font-bold text-foreground">₹{provider.daily_rate}</div>
                  <div className="text-xs text-muted-foreground">per day</div>
                </div>
              )}
              {provider.weekly_rate && (
                <div>
                  <div className="text-lg font-bold text-foreground">₹{provider.weekly_rate}</div>
                  <div className="text-xs text-muted-foreground">per week</div>
                </div>
              )}
            </div>
          </div>

          <Button
            className="w-full gradient-primary border-0"
            onClick={() => {
              onOpenChange(false);
              navigate(`/patient/book?provider=${provider.id}`);
            }}
          >
            Book This Provider
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
