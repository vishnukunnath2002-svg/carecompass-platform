import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

export default function ProviderProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [caregiver, setCaregiver] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => { if (data) setProfile(data); });
    supabase.from('caregiver_profiles').select('*').eq('user_id', user.id).single().then(({ data }) => { if (data) setCaregiver(data); });
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone }).eq('id', profile.id);
    if (caregiver) {
      await supabase.from('caregiver_profiles').update({ bio: caregiver.bio }).eq('id', caregiver.id);
    }
    setSaving(false);
    toast({ title: 'Profile updated' });
  };

  if (!profile) return <div className="py-12 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Profile</h2>
        <p className="text-sm text-muted-foreground">Your professional profile information.</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Full Name</Label><Input value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={profile.email || ''} disabled className="bg-muted" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          {caregiver && (
            <>
              <div className="space-y-2"><Label>Bio</Label><Textarea value={caregiver.bio || ''} onChange={(e) => setCaregiver({ ...caregiver, bio: e.target.value })} placeholder="Brief professional bio..." /></div>
              <div className="flex gap-2">
                <Badge variant="outline">{caregiver.provider_type?.replace('_', ' ')}</Badge>
                <Badge variant={caregiver.verification_status === 'approved' ? 'default' : 'secondary'}>{caregiver.verification_status}</Badge>
              </div>
            </>
          )}
          <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary border-0">{saving ? 'Saving...' : 'Save Changes'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
