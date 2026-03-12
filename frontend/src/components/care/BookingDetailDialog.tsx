import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDays, Clock, User, Star, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  booking_number: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  shift_type: string | null;
  service_type: string | null;
  total_amount: number | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
  provider_id: string | null;
}

interface Props {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  active: 'bg-success/10 text-success',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function BookingDetailDialog({ booking, open, onOpenChange, onUpdate }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  const handleCancel = async () => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' as any })
      .eq('id', booking.id);
    if (error) {
      toast({ title: 'Failed to cancel', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Booking cancelled' });
      onUpdate();
      onOpenChange(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !booking.provider_id) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      target_id: booking.provider_id,
      target_type: 'provider',
      rating: reviewRating,
      comment: reviewComment,
      title: `Booking ${booking.booking_number}`,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Failed to submit review', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
      setShowReview(false);
      setReviewComment('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {booking.booking_number}
            <Badge className={statusColors[booking.status || 'pending'] + ' capitalize'}>{booking.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {booking.start_date && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Start</p>
                <p className="font-medium text-sm text-foreground">{format(new Date(booking.start_date), 'dd MMM yyyy')}</p>
              </div>
            )}
            {booking.end_date && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> End</p>
                <p className="font-medium text-sm text-foreground">{format(new Date(booking.end_date), 'dd MMM yyyy')}</p>
              </div>
            )}
            {booking.shift_type && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Shift</p>
                <p className="font-medium text-sm text-foreground">{booking.shift_type}</p>
              </div>
            )}
            {booking.service_type && (
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" /> Service</p>
                <p className="font-medium text-sm text-foreground">{booking.service_type}</p>
              </div>
            )}
          </div>

          {booking.notes && (
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{booking.notes}</p>
            </div>
          )}

          <div className="rounded-xl border bg-muted/30 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="font-display text-xl font-bold text-foreground">₹{(booking.total_amount || 0).toLocaleString('en-IN')}</p>
            </div>
            <Badge variant="outline" className="capitalize">{booking.payment_status}</Badge>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {booking.status === 'pending' && (
              <Button variant="destructive" className="w-full" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel Booking
              </Button>
            )}
            {booking.status === 'completed' && !showReview && (
              <Button className="w-full gradient-primary border-0" onClick={() => setShowReview(true)}>
                <Star className="mr-2 h-4 w-4" /> Write a Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReview && (
            <div className="space-y-3 rounded-xl border p-4">
              <h4 className="font-semibold text-sm text-foreground">Rate your experience</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} className="p-0.5">
                    <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Comment (optional)</Label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowReview(false)}>Cancel</Button>
                <Button size="sm" className="gradient-primary border-0" onClick={handleSubmitReview} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
