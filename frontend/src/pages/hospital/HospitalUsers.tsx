import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function HospitalUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('user_roles').select('*, profiles!user_roles_user_id_fkey(full_name, email)').in('role', ['hospital_admin', 'hospital_procurement', 'hospital_discharge', 'hospital_nursing']).then(({ data }) => {
      if (data) setUsers(data);
    });
    // Fallback
    supabase.from('user_roles').select('*').in('role', ['hospital_admin', 'hospital_procurement', 'hospital_discharge', 'hospital_nursing']).then(({ data }) => {
      if (data && users.length === 0) setUsers(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-sm text-muted-foreground">Manage hospital portal users and roles.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No hospital users found.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>User ID</TableHead><TableHead>Role</TableHead><TableHead>Since</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-sm">{u.user_id?.slice(0, 8)}...</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{u.role?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(u.created_at), 'dd MMM yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
