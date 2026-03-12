import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Droplets, AlertTriangle, Pill, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function HealthRecords() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('patient_profiles').select('*').eq('user_id', user.id),
      supabase.from('prescriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('vitals_logs').select('*').order('recorded_at', { ascending: false }).limit(10),
    ]).then(([profRes, presRes, vitRes]) => {
      if (profRes.data) setProfiles(profRes.data);
      if (presRes.data) setPrescriptions(presRes.data);
      if (vitRes.data) setVitals(vitRes.data);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Health Records</h2>
        <p className="text-sm text-muted-foreground">Medical information, prescriptions, and vitals history.</p>
      </div>

      {/* Patient Profiles */}
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
                <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" /><span className="text-muted-foreground">Blood Group:</span><Badge variant="outline">{p.blood_group || 'N/A'}</Badge></div>
                <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-warning mt-0.5" /><span className="text-muted-foreground">Allergies:</span><span>{p.allergies?.join(', ') || 'None'}</span></div>
                <div className="flex items-start gap-2"><Pill className="h-4 w-4 text-accent mt-0.5" /><span className="text-muted-foreground">Medications:</span><span>{p.current_medications?.join(', ') || 'None'}</span></div>
                {p.medical_conditions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">{p.medical_conditions.map((c: string) => <Badge key={c} variant="secondary">{c}</Badge>)}</div>
                )}
                {p.special_care_notes && <p className="text-muted-foreground italic border-t pt-2">{p.special_care_notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Prescriptions */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" /> Prescriptions</CardTitle></CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No prescriptions uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {prescriptions.map(rx => (
                <div key={rx.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{rx.doctor_name || 'Prescription'} {rx.hospital_name && `— ${rx.hospital_name}`}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(rx.created_at), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rx.is_verified ? 'default' : 'secondary'}>{rx.is_verified ? 'Verified' : 'Pending'}</Badge>
                    {rx.file_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={rx.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Vitals */}
      {vitals.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Vitals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vitals.slice(0, 5).map(v => (
                <div key={v.id} className="flex items-center gap-4 rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground whitespace-nowrap">{format(new Date(v.recorded_at), 'dd MMM, hh:mm a')}</span>
                  {v.blood_pressure_systolic && <Badge variant="outline">BP: {v.blood_pressure_systolic}/{v.blood_pressure_diastolic}</Badge>}
                  {v.pulse_rate && <Badge variant="outline">Pulse: {v.pulse_rate}</Badge>}
                  {v.temperature && <Badge variant="outline">Temp: {v.temperature}°F</Badge>}
                  {v.oxygen_saturation && <Badge variant="outline">SpO2: {v.oxygen_saturation}%</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
