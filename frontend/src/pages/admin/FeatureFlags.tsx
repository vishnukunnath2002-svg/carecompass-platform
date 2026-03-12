import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Flag } from 'lucide-react';

export default function FeatureFlags() {
  const [flags, setFlags] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('feature_flags').select('*').order('name').then(({ data }) => {
      if (data) setFlags(data);
    });
  }, []);

  const toggleFlag = async (id: string, enabled: boolean) => {
    await supabase.from('feature_flags').update({ is_enabled: enabled }).eq('id', id);
    setFlags((prev) => prev.map((f) => f.id === id ? { ...f, is_enabled: enabled } : f));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Feature Flags</h2>
        <p className="text-sm text-muted-foreground">Toggle platform features on or off.</p>
      </div>
      {flags.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Flag className="h-8 w-8 mx-auto mb-2" />No feature flags configured.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <Card key={f.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{f.name}</p>
                  {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
                </div>
                <Switch checked={f.is_enabled} onCheckedChange={(v) => toggleFlag(f.id, v)} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
