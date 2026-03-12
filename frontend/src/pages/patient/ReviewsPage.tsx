import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setReviews(data);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Reviews</h2>
        <p className="text-sm text-muted-foreground">Reviews you've written for providers and products.</p>
      </div>
      {reviews.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">You haven't written any reviews yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="flex items-center gap-1 rounded-lg bg-warning/10 px-2 py-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-bold text-sm">{r.rating}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{r.title || r.target_type}</p>
                  {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{format(new Date(r.created_at), 'dd MMM yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
