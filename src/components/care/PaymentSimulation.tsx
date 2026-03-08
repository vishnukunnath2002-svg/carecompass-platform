import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Banknote, Shield, CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  amount: number;
  onPaymentComplete: (method?: string) => void;
  onBack: () => void;
  loading: boolean;
}

export default function PaymentSimulation({ amount, onPaymentComplete, onBack, loading }: Props) {
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProcessing(false);
    setCompleted(true);
    // Short delay to show success state
    await new Promise(resolve => setTimeout(resolve, 1000));
    onPaymentComplete(method);
  };

  if (completed) {
    return (
      <Card className="border shadow-card">
        <CardContent className="flex flex-col items-center py-12">
          <div className="rounded-full bg-success/10 p-4 mb-4">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Payment Successful</h3>
          <p className="text-sm text-muted-foreground mt-1">₹{amount.toLocaleString('en-IN')} paid via {method.toUpperCase()}</p>
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

        <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
          <div className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${method === 'upi' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'}`}>
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">UPI</p>
                <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm</p>
              </div>
            </Label>
          </div>
          <div className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${method === 'card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'}`}>
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Credit / Debit Card</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Rupay</p>
              </div>
            </Label>
          </div>
          <div className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${method === 'wallet' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/30'}`}>
            <RadioGroupItem value="wallet" id="wallet" />
            <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
              <Banknote className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">CYLO Wallet</p>
                <p className="text-xs text-muted-foreground">Pay from wallet balance</p>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Shield className="h-3.5 w-3.5" /> This is a simulated payment for demo purposes
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onBack} disabled={processing}>
            Back
          </Button>
          <Button className="flex-1 gradient-primary border-0" onClick={handlePay} disabled={processing || loading}>
            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Pay ₹${amount.toLocaleString('en-IN')}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
