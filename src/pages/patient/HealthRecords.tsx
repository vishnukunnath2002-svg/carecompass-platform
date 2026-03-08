import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Droplets, AlertTriangle, Pill } from 'lucide-react';

export default function HealthRecords() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('patient_profiles').select('*').eq('user_id', user.id).then(({ data }) => {
      if (data) setProfiles(data);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Health Records</h2>
        <p className="text-sm text-muted-foreground">Medical information for your patient profiles.</p>
      </div>
      {profiles.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No patient profiles found. Add a profile first.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-destructive" /> {p.patient_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Blood Group:</span>
                  <Badge variant="outline">{p.blood_group || 'N/A'}</Badge>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <span className="text-muted-foreground">Allergies:</span>
                  <span>{p.allergies?.join(', ') || 'None'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Pill className="h-4 w-4 text-accent mt-0.5" />
                  <span className="text-muted-foreground">Medications:</span>
                  <span>{p.current_medications?.join(', ') || 'None'}</span>
                </div>
                {p.medical_conditions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.medical_conditions.map((c: string) => (
                      <Badge key={c} variant="secondary">{c}</Badge>
                    ))}
                  </div>
                )}
                {p.special_care_notes && (
                  <p className="text-muted-foreground italic border-t pt-2">{p.special_care_notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
