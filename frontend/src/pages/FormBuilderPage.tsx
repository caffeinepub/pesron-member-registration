import { FormBuilder } from '../components/FormBuilder';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function FormBuilderPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            Sila log masuk untuk mengakses halaman ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md" variant="destructive">
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            Anda tidak mempunyai kebenaran untuk mengakses halaman ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Urus Borang Pendaftaran</h2>
        <p className="text-muted-foreground">
          Cipta dan ubahsuai medan borang pendaftaran ahli
        </p>
      </div>

      <FormBuilder />
    </div>
  );
}
