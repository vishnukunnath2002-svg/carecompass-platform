import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Shield, Building2, Stethoscope, ShoppingBag, Store, Users, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/authService';

const demoAccounts = [
  { role: 'Super Admin', email: 'admin@cylo.demo', password: 'demo1234', icon: Shield, color: 'bg-foreground', path: '/admin' },
  { role: 'Agency Admin', email: 'agency@cylo.demo', password: 'demo1234', icon: Building2, color: 'bg-primary', path: '/agency' },
  { role: 'Nurse (Provider)', email: 'nurse@cylo.demo', password: 'demo1234', icon: Stethoscope, color: 'bg-accent', path: '/provider' },
  { role: 'Vendor', email: 'vendor@cylo.demo', password: 'demo1234', icon: ShoppingBag, color: 'bg-warning', path: '/vendor' },
  { role: 'Medical Store', email: 'store@cylo.demo', password: 'demo1234', icon: Store, color: 'bg-success', path: '/store' },
  { role: 'Hospital', email: 'hospital@cylo.demo', password: 'demo1234', icon: Hospital, color: 'bg-destructive', path: '/hospital' },
  { role: 'Patient / Family', email: 'patient@cylo.demo', password: 'demo1234', icon: Users, color: 'bg-info', path: '/patient' },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const redirectParam = searchParams.get('redirect');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      setLoading(false);
      if (redirectParam) {
        navigate(redirectParam);
      } else {
        const user = authService.getCachedUser();
        const path = user ? authService.getRedirectPath(user) : '/patient';
        navigate(path);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      toast({ title: 'Registration failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!', description: 'You can now sign in.' });
    }
  };

  const handleDemoLogin = async (account: typeof demoAccounts[0]) => {
    setLoading(true);
    // Removed Supabase edge function seeding; assuming Django DB is already seeded via fixtures
    const { error } = await signIn(account.email, account.password);
    setLoading(false);
    if (error) {
      toast({ title: 'Demo login failed', description: error.message, variant: 'destructive' });
    } else {
      const user = authService.getCachedUser();
      const path = user ? authService.getRedirectPath(user) : account.path;
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container flex h-14 items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">CYLO</span>
          </Link>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-md">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <Card className="border shadow-card">
                  <CardHeader>
                    <CardTitle className="font-display">Welcome back</CardTitle>
                    <CardDescription>Sign in to your CYLO account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full gradient-primary border-0" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <Card className="border shadow-card">
                  <CardHeader>
                    <CardTitle className="font-display">Join CYLO</CardTitle>
                    <CardDescription>Select your role to begin the guided registration</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ScrollArea className="h-[340px] pr-3">
                    <div className="space-y-3">
                    {[
                      { label: 'Patient / Family', desc: 'Book care, order medicines, shop products', icon: Users, color: 'bg-info', path: '/register/patient' },
                      { label: 'Homecare Agency', desc: 'Manage staff, bookings & healthcare services', icon: Building2, color: 'bg-primary', path: '/register/agency' },
                      { label: 'Individual Provider', desc: 'Nurse, caregiver or companion', icon: Stethoscope, color: 'bg-accent', path: '/register/provider' },
                      { label: 'Medical Vendor', desc: 'Sell medical equipment & supplies', icon: ShoppingBag, color: 'bg-warning', path: '/register/vendor' },
                      { label: 'Medical Store', desc: 'Pharmacy & local medicine delivery', icon: Store, color: 'bg-success', path: '/register/store' },
                      { label: 'Hospital', desc: 'Procurement, RFQs & discharge care', icon: Hospital, color: 'bg-destructive', path: '/register/hospital' },
                    ].map((role) => (
                      <button
                        key={role.path}
                        onClick={() => navigate(role.path)}
                        className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:shadow-elevated hover:-translate-y-0.5"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${role.color}`}>
                          <role.icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-sm font-semibold text-foreground">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.desc}</div>
                        </div>
                      </button>
                    ))}
                    </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Quick Demo Access</h2>
              <p className="mt-1 text-sm text-muted-foreground">Click any card below to instantly explore that portal with demo data.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleDemoLogin(account)}
                  disabled={loading}
                  className="group flex items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${account.color}`}>
                    <account.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm font-semibold text-foreground">{account.role}</div>
                    <div className="truncate text-xs text-muted-foreground">{account.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
