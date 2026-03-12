import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

export default function ContentManager() {
  const [configs, setConfigs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from('platform_config').select('*').order('key').then(({ data }) => {
      if (data) setConfigs(data);
    });
  }, []);

  const updateConfig = async (id: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      await supabase.from('platform_config').update({ value: parsed }).eq('id', id);
      toast({ title: 'Config updated' });
    } catch {
      toast({ title: 'Invalid JSON', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Content Manager</h2>
        <p className="text-sm text-muted-foreground">Manage platform configuration and content settings.</p>
      </div>
      {configs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Settings className="h-8 w-8 mx-auto mb-2" />No configuration entries found.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {configs.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">{c.key}</span>
                </div>
                {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                <Textarea defaultValue={JSON.stringify(c.value, null, 2)} className="font-mono text-xs" rows={3} onBlur={(e) => updateConfig(c.id, e.target.value)} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
