import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Circle, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FieldCheck {
  label: string;
  filled: boolean;
  link: string;
}

export default function ProfileCompletion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checks, setChecks] = useState<FieldCheck[]>([]);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: profile }, { data: caregiver }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('caregiver_profiles').select('*').eq('user_id', user.id).single(),
      ]);

      const docs = (caregiver?.documents as Record<string, any>) || {};
      const hasDoc = (key: string) => docs[key]?.url && docs[key].url.length > 0;

      const fields: FieldCheck[] = [
        { label: 'Full Name', filled: !!profile?.full_name, link: '/provider/profile' },
        { label: 'Phone Number', filled: !!profile?.phone, link: '/provider/profile' },
        { label: 'Bio', filled: !!caregiver?.bio, link: '/provider/profile' },
        { label: 'Qualification', filled: !!caregiver?.qualification, link: '/provider/profile' },
        { label: 'Years of Experience', filled: (caregiver?.years_experience ?? 0) > 0, link: '/provider/profile' },
        { label: 'Languages', filled: (caregiver?.languages?.length ?? 0) > 0, link: '/provider/profile' },
        { label: 'Specializations', filled: (caregiver?.specializations?.length ?? 0) > 0, link: '/provider/profile' },
        { label: 'Hourly Rate', filled: !!caregiver?.hourly_rate, link: '/provider/profile' },
        { label: 'Availability Set', filled: (caregiver?.available_days?.length ?? 0) > 0, link: '/provider/availability' },
        { label: 'ID Proof Uploaded', filled: hasDoc('id_proof'), link: '/provider/documents' },
        { label: 'Qualification Certificate', filled: hasDoc('qualification_cert'), link: '/provider/documents' },
        { label: 'Photo Uploaded', filled: hasDoc('photo'), link: '/provider/documents' },
      ];

      setChecks(fields);
      const filled = fields.filter(f => f.filled).length;
      setPercentage(Math.round((filled / fields.length) * 100));
    };
    load();
  }, [user]);

  if (checks.length === 0) return null;

  const incomplete = checks.filter(c => !c.filled);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-5 w-5 text-primary" />
          Profile Completion — {percentage}%
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={percentage} className="h-3" />
        {percentage === 100 ? (
          <p className="text-sm text-success font-medium">🎉 Your profile is complete!</p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Complete these to get more bookings:</p>
            {incomplete.slice(0, 4).map((c) => (
              <button
                key={c.label}
                onClick={() => navigate(c.link)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left"
              >
                <Circle className="h-3.5 w-3.5 text-warning" />
                {c.label}
              </button>
            ))}
            {incomplete.length > 4 && (
              <p className="text-xs text-muted-foreground pl-5">+{incomplete.length - 4} more</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
