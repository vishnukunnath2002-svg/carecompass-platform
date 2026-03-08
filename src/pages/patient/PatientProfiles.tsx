import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus } from 'lucide-react';

export default function PatientProfiles() {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Patient Profiles</h2>
          <p className="text-sm text-muted-foreground">Manage profiles for family members receiving care.</p>
        </div>
        <Button className="gradient-primary border-0"><Plus className="mr-2 h-4 w-4" />Add Profile</Button>
      </div>
      {profiles.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No profiles yet. Add a patient profile to get started.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Card key={p.id} className="hover:shadow-elevated transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" /> {p.patient_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex gap-2">
                  {p.age && <Badge variant="outline">Age: {p.age}</Badge>}
                  {p.gender && <Badge variant="outline">{p.gender}</Badge>}
                  {p.blood_group && <Badge variant="secondary">{p.blood_group}</Badge>}
                </div>
                {p.emergency_contact_name && (
                  <p className="text-muted-foreground">Emergency: {p.emergency_contact_name} ({p.emergency_contact_phone})</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
