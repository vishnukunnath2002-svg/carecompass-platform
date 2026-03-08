import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react';

const docs = [
  { name: 'Government ID (Aadhaar/PAN)', status: 'verified', icon: FileText },
  { name: 'Nursing Registration Certificate', status: 'verified', icon: FileText },
  { name: 'Qualification Certificate', status: 'verified', icon: FileText },
  { name: 'Police Verification', status: 'pending', icon: Clock },
  { name: 'COVID Vaccination Certificate', status: 'not_uploaded', icon: Upload },
];

export default function ProviderDocuments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Documents</h2>
        <p className="text-sm text-muted-foreground">Upload and manage your verification documents.</p>
      </div>
      <div className="space-y-3">
        {docs.map((d) => (
          <Card key={d.name}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <d.icon className={`h-5 w-5 ${d.status === 'verified' ? 'text-success' : d.status === 'pending' ? 'text-warning' : 'text-muted-foreground'}`} />
                <span className="font-medium text-sm">{d.name}</span>
              </div>
              {d.status === 'verified' ? (
                <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>
              ) : d.status === 'pending' ? (
                <Badge variant="secondary">Under Review</Badge>
              ) : (
                <Button size="sm" variant="outline"><Upload className="mr-1 h-4 w-4" />Upload</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
