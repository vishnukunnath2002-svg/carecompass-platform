import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Availability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availDays, setAvailDays] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('caregiver_profiles').select('id, available_days, is_available').eq('user_id', user.id).single().then(({ data }) => {
      if (data) {
        setProfileId(data.id);
        setAvailDays(data.available_days || []);
        setIsAvailable(data.is_available ?? true);
      }
    });
  }, [user]);

  const toggleDay = async (day: string) => {
    const updated = availDays.includes(day) ? availDays.filter((d) => d !== day) : [...availDays, day];
    setAvailDays(updated);
    if (profileId) await supabase.from('caregiver_profiles').update({ available_days: updated }).eq('id', profileId);
  };

  const toggleAvailable = async (v: boolean) => {
    setIsAvailable(v);
    if (profileId) await supabase.from('caregiver_profiles').update({ is_available: v }).eq('id', profileId);
    toast({ title: v ? 'You are now available' : 'You are now unavailable' });
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Availability</h2>
        <p className="text-sm text-muted-foreground">Set your working days and availability status.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="font-medium">Available for Bookings</span>
            <Switch checked={isAvailable} onCheckedChange={toggleAvailable} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Working Days</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {days.map((day) => (
            <div key={day} className="flex items-center justify-between">
              <span className="text-sm">{day}</span>
              <Switch checked={availDays.includes(day)} onCheckedChange={() => toggleDay(day)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
