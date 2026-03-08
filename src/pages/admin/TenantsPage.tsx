import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  type: string;
  status: string;
  contact_email: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

const statusConfig: Record<string, { icon: any; className: string }> = {
  active: { icon: CheckCircle, className: 'bg-success/10 text-success' },
  pending: { icon: Clock, className: 'bg-warning/10 text-warning' },
  suspended: { icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTenants((data as Tenant[]) || []);
        setLoading(false);
      });
  }, []);

  const filtered = tenants.filter((t) =>
    !searchTerm ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { agency: 'Agency', vendor: 'Vendor', medical_store: 'Store', hospital: 'Hospital' };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Tenant Management</h2>
          <p className="text-sm text-muted-foreground">Manage all agencies, vendors, stores, and hospitals.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tenants..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No tenants found.</TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => {
                  const sc = statusConfig[t.status] || statusConfig.pending;
                  return (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.contact_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabel(t.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={sc.className + ' capitalize'}>{t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {[t.city, t.state].filter(Boolean).join(', ') || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(t.created_at).toLocaleDateString('en-IN')}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
