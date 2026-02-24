import { MembersTable } from '../components/MembersTable';
import { useGetAllMembers, useIsCallerAdmin } from '../hooks/useQueries';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: members, isLoading, error, refetch } = useGetAllMembers();

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Senarai Ahli PESRON</h2>
          <p className="text-muted-foreground">
            Paparan keseluruhan ahli yang telah berdaftar
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Muat Semula
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Ralat memuat data</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}

      <MembersTable members={members || []} isLoading={isLoading} />
    </div>
  );
}
