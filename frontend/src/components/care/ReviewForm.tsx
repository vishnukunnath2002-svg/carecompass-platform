import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Props {
  targetId: string;
  targetType: string;
  onComplete: () => void;
}

export default function ReviewForm({ targetId, targetType, onComplete }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      target_id: targetId,
      target_type: targetType,
      rating,
      title: title || null,
      comment: comment || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error submitting review', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Review submitted!' });
      onComplete();
    }
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <p className="font-display font-semibold text-foreground">Rate this service</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)} className="p-0.5">
            <Star className={`h-6 w-6 transition-colors ${n <= (hovered || rating) ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>}
      </div>
      <div className="space-y-2">
        <Label>Title (optional)</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Great service!" />
      </div>
      <div className="space-y-2">
        <Label>Comment (optional)</Label>
        <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Tell us about your experience..." rows={3} />
      </div>
      <Button onClick={handleSubmit} disabled={rating === 0 || submitting} className="gradient-primary border-0">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </div>
  );
}
