import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  amount: number;
  onPaymentComplete: (method?: string) => void;
  onBack: () => void;
  loading: boolean;
  receipt?: string;
  description?: string;
}

export default function PaymentSimulation({ amount, onPaymentComplete, onBack, loading, receipt, description }: Props) {
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { toast } = useToast();

  const handleRazorpay = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount, receipt: receipt || `rcpt_${Date.now()}`, notes: { description: description || 'Payment' } },
      });

      if (error || !data?.order_id) {
        throw new Error(error?.message || data?.error || 'Failed to create order');
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'CYLO Healthcare',
        description: description || 'Payment',
        order_id: data.order_id,
        handler: async (response: any) => {
          setCompleted(true);
          await new Promise(resolve => setTimeout(resolve, 800));
          onPaymentComplete('razorpay');
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast({ title: 'Payment failed', description: resp.error?.description || 'Please try again.', variant: 'destructive' });
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: 'Payment error', description: err.message, variant: 'destructive' });
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <Card className="border shadow-card">
        <CardContent className="flex flex-col items-center py-12">
          <div className="rounded-full bg-success/10 p-4 mb-4">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Payment Successful</h3>
          <p className="text-sm text-muted-foreground mt-1">₹{amount.toLocaleString('en-IN')} paid via Razorpay</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">Amount to pay</p>
          <p className="font-display text-3xl font-bold text-foreground mt-1">₹{amount.toLocaleString('en-IN')}</p>
        </div>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Shield className="h-3.5 w-3.5" /> Secured by Razorpay. Supports UPI, Cards, Netbanking & Wallets.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack} disabled={processing}>
            Back
          </Button>
          <Button className="flex-1 gradient-primary border-0" onClick={handleRazorpay} disabled={processing || loading}>
            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay ₹${amount.toLocaleString('en-IN')}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
