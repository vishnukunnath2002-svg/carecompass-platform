import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

export default function ProviderReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // Reviews target the caregiver_profile id, not user id — fetch profile first
    const fetchReviews = async () => {
      const { data: profile } = await supabase.from('caregiver_profiles').select('id').eq('user_id', user.id).limit(1).single();
      if (!profile) return;
      const { data } = await supabase.from('reviews').select('*').eq('target_id', profile.id).order('created_at', { ascending: false });
      if (data) setReviews(data);
    };
    fetchReviews();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Reviews</h2>
        <p className="text-sm text-muted-foreground">Reviews from patients and families.</p>
      </div>
      {reviews.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Star className="h-8 w-8 mx-auto mb-2" />No reviews yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex items-center gap-1 rounded-lg bg-warning/10 px-2 py-1">
                  <Star className="h-4 w-4 fill-warning text-warning" /><span className="font-bold text-sm">{r.rating}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{r.comment || 'No comment'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(r.created_at), 'dd MMM yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
