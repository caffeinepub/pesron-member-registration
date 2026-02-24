import { Member } from '../backend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

interface MembersTableProps {
  members: Member[];
  isLoading: boolean;
}

export function MembersTable({ members, isLoading }: MembersTableProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('ms-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMembershipTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'biasa': 'Ahli Biasa',
      'bersekutu': 'Ahli Bersekutu',
      'kehormat': 'Ahli Kehormat',
      'seumur-hidup': 'Ahli Seumur Hidup',
    };
    return labels[type] || type;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'active') return 'default';
    if (status === 'pending') return 'secondary';
    return 'outline';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Aktif',
      'pending': 'Menunggu',
      'inactive': 'Tidak Aktif',
    };
    return labels[status] || status;
  };

  // Get all unique custom field labels from all members
  const customFieldLabels = Array.from(
    new Set(
      members.flatMap((member) => member.customFields.map(([label]) => label))
    )
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Memuatkan data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tiada Ahli Berdaftar
            </h3>
            <p className="text-muted-foreground">
              Belum ada ahli yang mendaftar. Mulakan pendaftaran sekarang!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort members by registration date (newest first)
  const sortedMembers = [...members].sort((a, b) => 
    Number(b.registrationDate - a.registrationDate)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Jumlah Ahli: {members.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Nama Penuh</TableHead>
                  <TableHead className="font-semibold">E-mel</TableHead>
                  <TableHead className="font-semibold">Telefon</TableHead>
                  <TableHead className="font-semibold">Jenis Keahlian</TableHead>
                  {customFieldLabels.map((label) => (
                    <TableHead key={label} className="font-semibold">
                      {label}
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold">Tarikh Daftar</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => {
                  const customFieldsMap = new Map(member.customFields);
                  
                  return (
                    <TableRow key={member.id.toString()} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        #{member.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.phoneNumber}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getMembershipTypeLabel(member.membershipType)}
                        </span>
                      </TableCell>
                      {customFieldLabels.map((label) => (
                        <TableCell key={label} className="text-muted-foreground">
                          {customFieldsMap.get(label) || '-'}
                        </TableCell>
                      ))}
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(member.registrationDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(member.status)}>
                          {getStatusLabel(member.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
