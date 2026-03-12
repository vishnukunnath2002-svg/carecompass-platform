import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  booking_number: string;
  patient_profile_id: string | null;
}

interface Props {
  bookings: Booking[];
  onSuccess: () => void;
}

export default function VitalsEntryForm({ bookings, onSuccess }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSat, setOxygenSat] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBooking) return;
    setLoading(true);

    const booking = bookings.find(b => b.id === selectedBooking);

    const { error } = await supabase.from('vitals_logs').insert({
      booking_id: selectedBooking,
      provider_id: user.id,
      patient_profile_id: booking?.patient_profile_id || null,
      blood_pressure_systolic: bpSystolic ? parseInt(bpSystolic) : null,
      blood_pressure_diastolic: bpDiastolic ? parseInt(bpDiastolic) : null,
      pulse_rate: pulseRate ? parseInt(pulseRate) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      oxygen_saturation: oxygenSat ? parseFloat(oxygenSat) : null,
      blood_sugar: bloodSugar ? parseFloat(bloodSugar) : null,
      weight: weight ? parseFloat(weight) : null,
      notes: notes || null,
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Failed to record vitals', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Vitals recorded', description: 'Patient vitals saved successfully.' });
      // Reset form
      setBpSystolic(''); setBpDiastolic(''); setPulseRate(''); setTemperature('');
      setOxygenSat(''); setBloodSugar(''); setWeight(''); setNotes('');
      onSuccess();
    }
  };

  return (
    <Card className="border shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Record Vitals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Booking *</Label>
            <Select value={selectedBooking} onValueChange={setSelectedBooking} required>
              <SelectTrigger>
                <SelectValue placeholder="Select active booking" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.booking_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">BP Systolic (mmHg)</Label>
              <Input type="number" placeholder="120" value={bpSystolic} onChange={e => setBpSystolic(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">BP Diastolic (mmHg)</Label>
              <Input type="number" placeholder="80" value={bpDiastolic} onChange={e => setBpDiastolic(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pulse Rate (bpm)</Label>
              <Input type="number" placeholder="72" value={pulseRate} onChange={e => setPulseRate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Temperature (°F)</Label>
              <Input type="number" step="0.1" placeholder="98.6" value={temperature} onChange={e => setTemperature(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">SpO2 (%)</Label>
              <Input type="number" placeholder="98" value={oxygenSat} onChange={e => setOxygenSat(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Blood Sugar (mg/dL)</Label>
              <Input type="number" placeholder="100" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" step="0.1" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea placeholder="Observations, instructions..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          <Button type="submit" className="w-full gradient-primary border-0" disabled={loading || !selectedBooking}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Vitals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
