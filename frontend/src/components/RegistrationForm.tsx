import { useState, useEffect } from 'react';
import { useRegisterMember, useGetCurrentForm } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { FormField } from '../backend';

export function RegistrationForm() {
  const { data: currentForm, isLoading: formLoading } = useGetCurrentForm();
  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: '',
    email: '',
    phoneNumber: '',
    membershipType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMemberId, setSuccessMemberId] = useState<bigint | null>(null);

  const registerMutation = useRegisterMember();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate standard fields
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Nama penuh diperlukan';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'E-mel diperlukan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format e-mel tidak sah';
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Nombor telefon diperlukan';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Format nombor telefon tidak sah';
    }

    if (!formData.membershipType) {
      newErrors.membershipType = 'Jenis keahlian diperlukan';
    }

    // Validate custom fields
    if (currentForm?.fields) {
      currentForm.fields.forEach((field) => {
        const value = formData[field.fieldLabel];
        if (field.required && (!value || !value.trim())) {
          newErrors[field.fieldLabel] = `${field.fieldLabel} diperlukan`;
        }
        
        // Additional validation based on field type
        if (value && field.fieldType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.fieldLabel] = 'Format e-mel tidak sah';
        }
        
        if (value && field.fieldType === 'phone' && !/^[0-9+\-\s()]{8,}$/.test(value)) {
          newErrors[field.fieldLabel] = 'Format nombor telefon tidak sah';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Collect custom fields
      const customFields: Array<[string, string]> = [];
      if (currentForm?.fields) {
        currentForm.fields.forEach((field) => {
          const value = formData[field.fieldLabel];
          if (value) {
            customFields.push([field.fieldLabel, value]);
          }
        });
      }

      const memberId = await registerMutation.mutateAsync({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        membershipType: formData.membershipType,
        customFields,
      });

      setSuccessMemberId(memberId);
      
      // Reset form
      const resetData: Record<string, string> = {
        fullName: '',
        email: '',
        phoneNumber: '',
        membershipType: '',
      };
      if (currentForm?.fields) {
        currentForm.fields.forEach((field) => {
          resetData[field.fieldLabel] = '';
        });
      }
      setFormData(resetData);
      setErrors({});
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleRegisterAnother = () => {
    setSuccessMemberId(null);
  };

  const renderField = (field: FormField) => {
    const fieldId = field.fieldLabel.replace(/\s+/g, '-').toLowerCase();
    const value = formData[field.fieldLabel] || '';
    const error = errors[field.fieldLabel];

    switch (field.fieldType) {
      case 'text':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="text"
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'email':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="email"
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'phone':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={fieldId}
              type="tel"
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={fieldId}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.fieldLabel]: e.target.value })}
              className={error ? 'border-destructive' : ''}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'dropdown':
        return (
          <div key={fieldId} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setFormData({ ...formData, [field.fieldLabel]: val })}
            >
              <SelectTrigger className={error ? 'border-destructive' : ''}>
                <SelectValue placeholder={`Pilih ${field.fieldLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={fieldId} className="space-y-2">
            <Label>
              {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => setFormData({ ...formData, [field.fieldLabel]: val })}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${fieldId}-${option}`} />
                  <Label htmlFor={`${fieldId}-${option}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldId} className="space-y-2">
            <Label>
              {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${fieldId}-${option}`}
                    checked={value.split(',').includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value ? value.split(',') : [];
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option);
                      setFormData({ ...formData, [field.fieldLabel]: newValues.join(',') });
                    }}
                  />
                  <Label htmlFor={`${fieldId}-${option}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (formLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (successMemberId !== null) {
    return (
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Pendaftaran Berjaya!</CardTitle>
          <CardDescription className="text-base">
            Terima kasih kerana mendaftar sebagai ahli PESRON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/50 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">ID Ahli Anda</p>
            <p className="text-3xl font-bold text-primary">#{successMemberId.toString()}</p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Sila simpan ID ahli anda untuk rujukan masa hadapan
          </p>
          <Button
            onClick={handleRegisterAnother}
            className="w-full"
            size="lg"
          >
            Daftar Ahli Lain
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Maklumat Ahli</CardTitle>
        <CardDescription>
          Sila isi semua maklumat dengan lengkap dan tepat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Standard fields */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Nama Penuh <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Contoh: Ahmad bin Abdullah"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              E-mel <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Nombor Telefon <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="012-3456789"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className={errors.phoneNumber ? 'border-destructive' : ''}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="membershipType">
              Jenis Keahlian <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.membershipType}
              onValueChange={(value) => setFormData({ ...formData, membershipType: value })}
            >
              <SelectTrigger className={errors.membershipType ? 'border-destructive' : ''}>
                <SelectValue placeholder="Pilih jenis keahlian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="biasa">Ahli Biasa</SelectItem>
                <SelectItem value="bersekutu">Ahli Bersekutu</SelectItem>
                <SelectItem value="kehormat">Ahli Kehormat</SelectItem>
                <SelectItem value="seumur-hidup">Ahli Seumur Hidup</SelectItem>
              </SelectContent>
            </Select>
            {errors.membershipType && (
              <p className="text-sm text-destructive">{errors.membershipType}</p>
            )}
          </div>

          {/* Dynamic custom fields */}
          {currentForm?.fields && currentForm.fields.length > 0 && (
            <>
              {currentForm.fields.map((field) => renderField(field))}
            </>
          )}

          {registerMutation.isError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              <p className="font-medium">Ralat pendaftaran</p>
              <p className="text-sm mt-1">
                {registerMutation.error?.message || 'Sila cuba lagi'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Daftar Sekarang'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
