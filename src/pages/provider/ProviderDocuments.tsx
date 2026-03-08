import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DocType {
  key: string;
  name: string;
}

const docTypes: DocType[] = [
  { key: 'government_id', name: 'Government ID (Aadhaar/PAN)' },
  { key: 'nursing_certificate', name: 'Nursing Registration Certificate' },
  { key: 'qualification_certificate', name: 'Qualification Certificate' },
  { key: 'covid_vaccination', name: 'COVID Vaccination Certificate' },
  { key: 'experience_letter', name: 'Experience Letter' },
];

interface DocRecord {
  url: string;
  status: string;
  uploaded_at: string;
  file_name: string;
}

export default function ProviderDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Record<string, DocRecord>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!user) return;
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('caregiver_profiles')
      .select('documents')
      .eq('user_id', user.id)
      .single();

    if (data?.documents && typeof data.documents === 'object' && !Array.isArray(data.documents)) {
      setDocuments(data.documents as Record<string, DocRecord>);
    }
    setLoading(false);
  };

  const handleUpload = async (docKey: string, file: File) => {
    if (!user) return;
    setUploading(docKey);

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${docKey}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('provider-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('provider-documents')
      .getPublicUrl(filePath);

    const newDoc: DocRecord = {
      url: urlData.publicUrl,
      status: 'pending',
      uploaded_at: new Date().toISOString(),
      file_name: file.name,
    };

    const updatedDocs = { ...documents, [docKey]: newDoc };

    const { error: updateError } = await supabase
      .from('caregiver_profiles')
      .update({ documents: updatedDocs })
      .eq('user_id', user.id);

    if (updateError) {
      toast({ title: 'Failed to save', description: updateError.message, variant: 'destructive' });
    } else {
      setDocuments(updatedDocs);
      toast({ title: 'Document uploaded', description: 'Your document is under review.' });
    }
    setUploading(null);
  };

  const getStatus = (docKey: string) => {
    const doc = documents[docKey];
    if (!doc) return 'not_uploaded';
    return doc.status || 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Documents</h2>
        <p className="text-sm text-muted-foreground">Upload and manage your verification documents.</p>
      </div>
      <div className="space-y-3">
        {docTypes.map((d) => {
          const status = getStatus(d.key);
          const doc = documents[d.key];
          const isUploading = uploading === d.key;

          return (
            <Card key={d.key}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {status === 'verified' || status === 'approved' ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-success" />
                  ) : status === 'pending' ? (
                    <Clock className="h-5 w-5 shrink-0 text-warning" />
                  ) : (
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <span className="font-medium text-sm block">{d.name}</span>
                    {doc?.file_name && (
                      <span className="text-xs text-muted-foreground truncate block">{doc.file_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {status === 'verified' || status === 'approved' ? (
                    <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>
                  ) : status === 'pending' ? (
                    <>
                      <Badge variant="secondary">Under Review</Badge>
                      <Button size="sm" variant="ghost" onClick={() => fileInputRefs.current[d.key]?.click()} disabled={isUploading}>
                        Re-upload
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => fileInputRefs.current[d.key]?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[d.key] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(d.key, file);
                      e.target.value = '';
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
