import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Store, Truck, Package, AlertTriangle, Star, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | null;
  payment_status: string | null;
  tracking_number: string | null;
  created_at: string;
  notes: string | null;
}

interface StoreOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | null;
  payment_status: string | null;
  created_at: string;
  store_id: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  processing: 'bg-info/10 text-info',
  shipped: 'bg-accent/10 text-accent',
  ready: 'bg-accent/10 text-accent',
  dispatched: 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function MyOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispute dialog
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeRef, setDisputeRef] = useState<{ id: string; number: string; type: string }>({ id: '', number: '', type: '' });
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeType, setDisputeType] = useState('return');

  // Review dialog
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; type: string }>({ id: '', type: '' });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchOrders = async () => {
    if (!user) return;
    const [vendorRes, storeRes] = await Promise.all([
      supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
      supabase.from('store_orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }),
    ]);
    setVendorOrders((vendorRes.data as Order[]) || []);
    setStoreOrders((storeRes.data as StoreOrder[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const openDispute = (id: string, number: string, type: string) => {
    setDisputeRef({ id, number, type });
    setDisputeSubject('');
    setDisputeDesc('');
    setDisputeType('return');
    setDisputeOpen(true);
  };

  const submitDispute = async () => {
    if (!user || !disputeSubject.trim()) return;
    const { error } = await supabase.from('disputes').insert({
      user_id: user.id,
      reference_id: disputeRef.id,
      dispute_type: disputeType,
      subject: disputeSubject,
      description: disputeDesc,
    });
    if (error) toast({ title: 'Failed to submit', description: error.message, variant: 'destructive' });
    else toast({ title: 'Dispute submitted', description: `Your ${disputeType} request for ${disputeRef.number} has been submitted.` });
    setDisputeOpen(false);
  };

  const openReview = (id: string, type: string) => {
    setReviewTarget({ id, type });
    setReviewRating(5);
    setReviewComment('');
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!user) return;
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      target_id: reviewTarget.id,
      target_type: reviewTarget.type,
      rating: reviewRating,
      comment: reviewComment || null,
    });
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
    setReviewOpen(false);
  };

  const OrderCard = ({ order, type }: { order: Order | StoreOrder; type: 'vendor' | 'store' }) => {
    const isDelivered = order.status === 'delivered';
    const tracking = type === 'vendor' ? (order as Order).tracking_number : null;

    return (
      <Card className="border shadow-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type === 'vendor' ? <Package className="h-4 w-4 text-muted-foreground" /> : <Store className="h-4 w-4 text-muted-foreground" />}
              <span className="font-display font-semibold text-foreground">{order.order_number}</span>
            </div>
            <Badge className={`${statusColors[order.status || 'pending']} capitalize`}>{order.status}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Amount: <strong className="text-foreground">₹{(order.total_amount || 0).toLocaleString('en-IN')}</strong></span>
            <span>Payment: <Badge variant="outline" className="text-xs capitalize">{order.payment_status || 'pending'}</Badge></span>
            <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          {tracking && (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Tracking:</span>
              <span className="font-mono text-foreground">{tracking}</span>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            {isDelivered && (
              <>
                <Button size="sm" variant="outline" onClick={() => openReview(order.id, type === 'vendor' ? 'product_order' : 'store_order')}>
                  <Star className="mr-1.5 h-3.5 w-3.5" /> Review
                </Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => openDispute(order.id, order.order_number, type)}>
                  <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Return / Dispute
                </Button>
              </>
            )}
            {!isDelivered && order.status !== 'cancelled' && (
              <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => openDispute(order.id, order.order_number, type)}>
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Raise Issue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <div className="py-12 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">My Orders</h2>
        <p className="text-sm text-muted-foreground">Track your product and store orders.</p>
      </div>

      <Tabs defaultValue="vendor">
        <TabsList>
          <TabsTrigger value="vendor">Product Orders ({vendorOrders.length})</TabsTrigger>
          <TabsTrigger value="store">Store Orders ({storeOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="vendor" className="space-y-3 mt-4">
          {loading ? <p className="text-muted-foreground text-sm">Loading...</p>
            : vendorOrders.length === 0 ? <EmptyState icon={ShoppingBag} text="No product orders yet." />
            : vendorOrders.map(o => <OrderCard key={o.id} order={o} type="vendor" />)}
        </TabsContent>
        <TabsContent value="store" className="space-y-3 mt-4">
          {loading ? <p className="text-muted-foreground text-sm">Loading...</p>
            : storeOrders.length === 0 ? <EmptyState icon={Store} text="No store orders yet." />
            : storeOrders.map(o => <OrderCard key={o.id} order={o} type="store" />)}
        </TabsContent>
      </Tabs>

      {/* Dispute Dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Dispute — {disputeRef.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={disputeType} onValueChange={setDisputeType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="quality">Quality Issue</SelectItem>
                  <SelectItem value="delivery">Delivery Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input placeholder="Brief subject" value={disputeSubject} onChange={(e) => setDisputeSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe your issue..." value={disputeDesc} onChange={(e) => setDisputeDesc(e.target.value)} rows={3} />
            </div>
            <Button className="w-full" onClick={submitDispute} disabled={!disputeSubject.trim()}>Submit Dispute</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)} className="focus:outline-none">
                    <Star className={`h-6 w-6 transition-colors ${s <= reviewRating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} />
            </div>
            <Button className="w-full" onClick={submitReview}>
              <CheckCircle className="mr-2 h-4 w-4" /> Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
