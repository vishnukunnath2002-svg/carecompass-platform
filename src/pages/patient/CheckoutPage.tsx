import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CheckCircle, Loader2, Shield } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Step = 'cart' | 'payment' | 'confirmed';

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('cart');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  // Group items by source
  const vendorItems = items.filter(i => i.source === 'vendor');
  const storeItems = items.filter(i => i.source === 'store');

  const handlePlaceOrder = async () => {
    if (!user) { toast({ title: 'Please log in', variant: 'destructive' }); return; }
    setProcessing(true);

    // Simulate payment
    await new Promise(r => setTimeout(r, 2000));

    try {
      // Create vendor orders (grouped by tenant)
      const tenantGroups = new Map<string, typeof vendorItems>();
      vendorItems.forEach(item => {
        const group = tenantGroups.get(item.tenantId) || [];
        group.push(item);
        tenantGroups.set(item.tenantId, group);
      });

      let lastOrderNumber = '';

      for (const [tenantId, groupItems] of tenantGroups) {
        const orderSubtotal = groupItems.reduce((s, i) => s + i.price * i.quantity, 0);
        const orderTax = Math.round(orderSubtotal * 0.18);

        const { data: order, error } = await supabase.from('orders').insert({
          customer_id: user.id,
          tenant_id: tenantId,
          subtotal: orderSubtotal,
          tax: orderTax,
          total_amount: orderSubtotal + orderTax,
          payment_status: 'paid',
          payment_method: paymentMethod,
          status: 'confirmed',
          notes,
        } as any).select().single();

        if (error) throw error;
        lastOrderNumber = order.order_number;

        // Insert order items
        for (const item of groupItems) {
          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          } as any);
        }

        // Create invoice
        await supabase.from('invoices').insert({
          user_id: user.id,
          reference_id: order.id,
          type: 'product_order',
          amount: orderSubtotal,
          tax: orderTax,
          total: orderSubtotal + orderTax,
        } as any);
      }

      // Create store orders
      const storeGroups = new Map<string, typeof storeItems>();
      storeItems.forEach(item => {
        const key = item.storeId || item.tenantId;
        const group = storeGroups.get(key) || [];
        group.push(item);
        storeGroups.set(key, group);
      });

      for (const [storeId, groupItems] of storeGroups) {
        const orderSubtotal = groupItems.reduce((s, i) => s + i.price * i.quantity, 0);

        const { data: order, error } = await supabase.from('store_orders').insert({
          customer_id: user.id,
          store_id: storeId,
          subtotal: orderSubtotal,
          total_amount: orderSubtotal,
          payment_status: 'paid',
          status: 'confirmed',
          notes,
        } as any).select().single();

        if (error) throw error;
        if (!lastOrderNumber) lastOrderNumber = order.order_number;

        for (const item of groupItems) {
          await supabase.from('store_order_items').insert({
            store_order_id: order.id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          } as any);
        }
      }

      // Notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Order Confirmed',
        message: `Your order ${lastOrderNumber} has been placed. Total: ₹${total.toLocaleString('en-IN')}`,
        type: 'order',
        link: '/patient/invoices',
      });

      setOrderNumber(lastOrderNumber);
      clearCart();
      setStep('confirmed');
    } catch (err: any) {
      toast({ title: 'Order failed', description: err.message, variant: 'destructive' });
    }
    setProcessing(false);
  };

  if (step === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-success/10 p-6 mb-6">
          <CheckCircle className="h-14 w-14 text-success" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Order Placed!</h2>
        <p className="text-muted-foreground mt-2">Order #{orderNumber}</p>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">Your order is confirmed. You'll receive status updates via notifications.</p>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={() => navigate('/patient/invoices')}>View Invoices</Button>
          <Button className="gradient-primary border-0" onClick={() => navigate('/patient/shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ShoppingBag className="h-14 w-14 text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mt-1">Browse products and add items to get started.</p>
        <Button className="mt-6" onClick={() => navigate('/patient/shop')}>Shop Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {step === 'payment' ? 'Payment' : 'Cart & Checkout'}
        </h2>
      </div>

      {step === 'payment' ? (
        <div className="max-w-md mx-auto space-y-5">
          <Card className="border shadow-card">
            <CardContent className="p-5 space-y-4">
              <div className="rounded-xl border bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-display text-3xl font-bold text-foreground">₹{total.toLocaleString('en-IN')}</p>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                {[
                  { value: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
                  { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay' },
                  { value: 'wallet', label: 'CYLO Wallet', desc: 'Pay from wallet balance' },
                ].map(m => (
                  <div key={m.value} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${paymentMethod === m.value ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                    <RadioGroupItem value={m.value} id={m.value} />
                    <Label htmlFor={m.value} className="cursor-pointer flex-1">
                      <p className="font-medium text-foreground text-sm">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Simulated payment for demo
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('cart')} disabled={processing}>Back</Button>
                <Button className="flex-1 gradient-primary border-0" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay ₹${total.toLocaleString('en-IN')}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <Card key={item.id} className="border shadow-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{item.name}</h4>
                    {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-bold text-foreground">₹{item.price.toLocaleString('en-IN')}</span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-xs text-muted-foreground line-through">₹{item.mrp.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    {item.isPrescriptionRequired && <Badge variant="outline" className="text-xs border-destructive text-destructive mt-1">Rx</Badge>}
                    <Badge variant="secondary" className="text-xs mt-1 ml-1 capitalize">{item.source}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="space-y-2">
              <Label className="text-xs">Order Notes (optional)</Label>
              <Textarea placeholder="Any special instructions..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <div>
            <Card className="border shadow-card sticky top-20">
              <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Items ({items.reduce((s, i) => s + i.quantity, 0)})</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span className="font-display text-xl font-bold">₹{total.toLocaleString('en-IN')}</span></div>
                <Button className="w-full gradient-primary border-0 mt-2" onClick={() => setStep('payment')}>
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
