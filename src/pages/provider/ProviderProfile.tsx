import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';

const languageOptions = [
  'English', 'Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Kannada',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Odia', 'Assamese',
].map(l => ({ value: l, label: l }));

const specializationOptions = [
  'Elder Care', 'Post-Surgery Care', 'Palliative Care', 'Pediatric Care',
  'Diabetes Management', 'Physiotherapy', 'Wound Care', 'ICU Trained',
  'Ventilator Care', 'Tracheostomy Care', 'Stroke Rehabilitation',
  'Dementia Care', 'Cancer Care', 'Cardiac Care',
].map(s => ({ value: s, label: s }));

const defaultCaregiver = {
  bio: '',
  qualification: '',
  years_experience: '',
  languages: [] as string[],
  specializations: [] as string[],
  hourly_rate: '',
  provider_type: '',
  verification_status: 'pending',
};

export default function ProviderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight');
  const [profile, setProfile] = useState<any>(null);
  const [caregiver, setCaregiver] = useState<any>(defaultCaregiver);
  const [caregiverId, setCaregiverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const highlightRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('caregiver_profiles').select('*').eq('user_id', user.id).single(),
    ]).then(([{ data: p }, { data: c }]) => {
      if (p) setProfile(p);
      if (c) {
        setCaregiver({
          bio: c.bio || '',
          qualification: c.qualification || '',
          years_experience: c.years_experience ?? '',
          languages: c.languages || [],
          specializations: c.specializations || [],
          hourly_rate: c.hourly_rate ?? '',
          provider_type: c.provider_type || '',
          verification_status: c.verification_status || 'pending',
        });
        setCaregiverId(c.id);
      }
      setLoaded(true);
    });
  }, [user]);

  useEffect(() => {
    if (loaded && highlight && highlightRefs.current[highlight]) {
      setTimeout(() => {
        highlightRefs.current[highlight]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlight, loaded]);

  const handleSave = async () => {
    if (!profile || !user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone,
    }).eq('id', profile.id);

    const caregiverData = {
      bio: caregiver.bio || null,
      qualification: caregiver.qualification || null,
      years_experience: caregiver.years_experience ? Number(caregiver.years_experience) : null,
      languages: caregiver.languages.length > 0 ? caregiver.languages : null,
      specializations: caregiver.specializations.length > 0 ? caregiver.specializations : null,
      hourly_rate: caregiver.hourly_rate ? Number(caregiver.hourly_rate) : null,
    };

    if (caregiverId) {
      await supabase.from('caregiver_profiles').update(caregiverData).eq('id', caregiverId);
    } else {
      const { data } = await supabase.from('caregiver_profiles').insert({
        ...caregiverData,
        user_id: user.id,
        provider_type: 'nurse',
      }).select('id').single();
      if (data) setCaregiverId(data.id);
    }

    setSaving(false);
    toast({ title: 'Profile updated' });
  };

  if (!loaded) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  const isHighlighted = (key: string) => highlight === key;
  const fieldClass = (key: string) =>
    `space-y-2 rounded-lg p-2 -mx-2 transition-all duration-500 ${isHighlighted(key) ? 'bg-accent/50 ring-2 ring-primary/30' : ''}`;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Profile</h2>
        <p className="text-sm text-muted-foreground">Your professional profile information.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div ref={el => { highlightRefs.current['full_name'] = el; }} className={fieldClass('full_name')}>
            <Label>Full Name</Label>
            <Input value={profile?.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ''} disabled className="bg-muted" />
          </div>
          <div ref={el => { highlightRefs.current['phone'] = el; }} className={fieldClass('phone')}>
            <Label>Phone</Label>
            <Input value={profile?.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="e.g. 9876543210" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Professional Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div ref={el => { highlightRefs.current['bio'] = el; }} className={fieldClass('bio')}>
            <Label>Bio</Label>
            <Textarea value={caregiver.bio} onChange={(e) => setCaregiver({ ...caregiver, bio: e.target.value })} placeholder="Brief professional bio..." />
          </div>
          <div ref={el => { highlightRefs.current['qualification'] = el; }} className={fieldClass('qualification')}>
            <Label>Qualification</Label>
            <Input value={caregiver.qualification} onChange={(e) => setCaregiver({ ...caregiver, qualification: e.target.value })} placeholder="e.g. GNM, BSc Nursing" />
          </div>
          <div ref={el => { highlightRefs.current['years_experience'] = el; }} className={fieldClass('years_experience')}>
            <Label>Years of Experience</Label>
            <Input type="number" min={0} value={caregiver.years_experience} onChange={(e) => setCaregiver({ ...caregiver, years_experience: e.target.value })} placeholder="e.g. 3" />
          </div>
          <div ref={el => { highlightRefs.current['languages'] = el; }} className={fieldClass('languages')}>
            <Label>Languages</Label>
            <MultiSelect options={languageOptions} selected={caregiver.languages} onChange={(v) => setCaregiver({ ...caregiver, languages: v })} placeholder="Select languages..." />
          </div>
          <div ref={el => { highlightRefs.current['specializations'] = el; }} className={fieldClass('specializations')}>
            <Label>Specializations</Label>
            <MultiSelect options={specializationOptions} selected={caregiver.specializations} onChange={(v) => setCaregiver({ ...caregiver, specializations: v })} placeholder="Select specializations..." />
          </div>
          <div ref={el => { highlightRefs.current['hourly_rate'] = el; }} className={fieldClass('hourly_rate')}>
            <Label>Hourly Rate (₹)</Label>
            <Input type="number" min={0} value={caregiver.hourly_rate} onChange={(e) => setCaregiver({ ...caregiver, hourly_rate: e.target.value })} placeholder="e.g. 250" />
          </div>
          {caregiverId && (
            <div className="flex gap-2">
              <Badge variant="outline">{caregiver.provider_type?.replace('_', ' ')}</Badge>
              <Badge variant={caregiver.verification_status === 'approved' ? 'default' : 'secondary'}>{caregiver.verification_status}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary border-0">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
