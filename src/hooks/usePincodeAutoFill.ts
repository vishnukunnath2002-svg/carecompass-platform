import { useEffect, useState, useRef } from 'react';

interface PincodeResult {
  city: string;
  state: string;
  district: string;
  loading: boolean;
  error: string | null;
}

export function usePincodeAutoFill(pincode: string): PincodeResult {
  const [result, setResult] = useState<PincodeResult>({ city: '', state: '', district: '', loading: false, error: null });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const cleaned = pincode?.replace(/\D/g, '') || '';
    if (cleaned.length !== 6) {
      setResult(r => ({ ...r, loading: false, error: null }));
      return;
    }

    setResult(r => ({ ...r, loading: true, error: null }));

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setResult({
            city: po.Block !== 'NA' ? po.Block : po.Division,
            state: po.State,
            district: po.District,
            loading: false,
            error: null,
          });
        } else {
          setResult({ city: '', state: '', district: '', loading: false, error: 'Invalid pincode' });
        }
      } catch {
        setResult({ city: '', state: '', district: '', loading: false, error: 'Failed to fetch' });
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [pincode]);

  return result;
}
