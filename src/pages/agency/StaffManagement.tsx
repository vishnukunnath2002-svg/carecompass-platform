import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

interface StaffMember {
  id: string;
  user_id: string;
  provider_type: string;
  qualification: string | null;
  years_experience: number | null;
  verification_status: string | null;
  is_available: boolean | null;
  rating: number | null;
  specializations: string[] | null;
}

const statusIcons: Record<string, { icon: any; className: string }> = {
  approved: { icon: CheckCircle, className: 'bg-success/10 text-success' },
  pending: { icon: Clock, className: 'bg-warning/10 text-warning' },
  rejected: { icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function StaffManagement() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all providers linked to this agency's tenant
    const fetchStaff = async () => {
      if (!user) return;
      const { data: roleData } = await supabase.from('user_roles').select('tenant_id').eq('user_id', user.id).limit(1).single();
      if (roleData?.tenant_id) {
        const { data } = await supabase.from('caregiver_profiles').select('*').eq('tenant_id', roleData.tenant_id);
        setStaff((data as StaffMember[]) || []);
      }
      setLoading(false);
    };
    fetchStaff();
  }, [user]);

  const filtered = staff.filter(s =>
    !searchTerm || s.provider_type.includes(searchTerm.toLowerCase()) || s.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Staff Management</h2>
        <p className="text-sm text-muted-foreground">Manage your agency's care providers.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search staff..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No staff found.</TableCell></TableRow>
              ) : filtered.map((s) => {
                const sc = statusIcons[s.verification_status || 'pending'] || statusIcons.pending;
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{typeLabel(s.provider_type)}</div>
                          <div className="text-xs text-muted-foreground">{s.qualification} · {s.years_experience} yrs</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{typeLabel(s.provider_type)}</Badge></TableCell>
                    <TableCell><Badge className={sc.className + ' capitalize'}>{s.verification_status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{s.rating || '—'}</TableCell>
                    <TableCell>
                      <Badge className={s.is_available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                        {s.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
