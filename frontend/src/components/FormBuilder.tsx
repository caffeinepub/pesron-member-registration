import { useState } from 'react';
import { useGetCurrentForm, useUploadForm } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import type { FormField, RegistrationForm } from '../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FormBuilder() {
  const { data: currentForm, isLoading } = useGetCurrentForm();
  const uploadFormMutation = useUploadForm();
  
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<Partial<FormField>>({
    fieldLabel: '',
    fieldType: 'text',
    required: false,
    options: undefined,
  });

  // Load current form when available
  useState(() => {
    if (currentForm?.fields) {
      setFields(currentForm.fields);
    }
  });

  const addField = () => {
    if (!editingField.fieldLabel || !editingField.fieldType) {
      return;
    }

    const newField: FormField = {
      fieldLabel: editingField.fieldLabel,
      fieldType: editingField.fieldType,
      required: editingField.required || false,
      options: editingField.options,
    };

    setFields([...fields, newField]);
    setEditingField({
      fieldLabel: '',
      fieldType: 'text',
      required: false,
      options: undefined,
    });
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSaveForm = async () => {
    const form: RegistrationForm = { fields };
    try {
      await uploadFormMutation.mutateAsync(form);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const needsOptions = editingField.fieldType === 'dropdown' || 
                       editingField.fieldType === 'radio' || 
                       editingField.fieldType === 'checkbox';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pembina Borang Pendaftaran</CardTitle>
        <CardDescription>
          Cipta dan urus medan borang pendaftaran ahli
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Pembina</TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Pratonton
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            {/* Add Field Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-accent/5">
              <h3 className="font-semibold text-lg">Tambah Medan Baru</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldLabel">Label Medan</Label>
                  <Input
                    id="fieldLabel"
                    placeholder="Contoh: Alamat"
                    value={editingField.fieldLabel}
                    onChange={(e) => setEditingField({ ...editingField, fieldLabel: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldType">Jenis Medan</Label>
                  <Select
                    value={editingField.fieldType}
                    onValueChange={(value) => setEditingField({ ...editingField, fieldType: value, options: undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Teks</SelectItem>
                      <SelectItem value="email">E-mel</SelectItem>
                      <SelectItem value="phone">Telefon</SelectItem>
                      <SelectItem value="textarea">Teks Panjang</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="radio">Radio Button</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {needsOptions && (
                <div className="space-y-2">
                  <Label htmlFor="options">Pilihan (satu per baris)</Label>
                  <textarea
                    id="options"
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                    placeholder="Pilihan 1&#10;Pilihan 2&#10;Pilihan 3"
                    value={editingField.options?.join('\n') || ''}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(o => o.trim());
                      setEditingField({ ...editingField, options: options.length > 0 ? options : undefined });
                    }}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={editingField.required}
                  onCheckedChange={(checked) => setEditingField({ ...editingField, required: checked as boolean })}
                />
                <Label htmlFor="required" className="cursor-pointer">
                  Medan wajib diisi
                </Label>
              </div>

              <Button onClick={addField} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Medan
              </Button>
            </div>

            <Separator />

            {/* Fields List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Medan Borang ({fields.length})</h3>
              
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tiada medan tambahan. Tambah medan baru di atas.
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{field.fieldLabel}</h4>
                              {field.required && (
                                <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                                  Wajib
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Jenis: {field.fieldType}
                            </p>
                            {field.options && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Pilihan: {field.options.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveField(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveField(index, 'down')}
                              disabled={index === fields.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeField(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <Separator />

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveForm}
                disabled={uploadFormMutation.isPending}
                className="flex-1"
                size="lg"
              >
                {uploadFormMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Borang'
                )}
              </Button>
            </div>

            {uploadFormMutation.isSuccess && (
              <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg">
                <p className="font-medium">Borang berjaya disimpan!</p>
              </div>
            )}

            {uploadFormMutation.isError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
                <p className="font-medium">Ralat menyimpan borang</p>
                <p className="text-sm mt-1">{uploadFormMutation.error?.message}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="p-6 border rounded-lg bg-accent/5">
              <h3 className="font-semibold text-lg mb-4">Pratonton Borang</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Ini adalah pratonton bagaimana borang akan kelihatan kepada pengguna
              </p>
              
              <div className="space-y-6 max-w-2xl">
                {/* Standard fields preview */}
                <div className="space-y-2">
                  <Label>Nama Penuh <span className="text-destructive">*</span></Label>
                  <Input placeholder="Contoh: Ahmad bin Abdullah" disabled />
                </div>

                <div className="space-y-2">
                  <Label>E-mel <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="contoh@email.com" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Nombor Telefon <span className="text-destructive">*</span></Label>
                  <Input type="tel" placeholder="012-3456789" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Jenis Keahlian <span className="text-destructive">*</span></Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis keahlian" />
                    </SelectTrigger>
                  </Select>
                </div>

                {/* Custom fields preview */}
                {fields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <Label>
                      {field.fieldLabel} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {field.fieldType === 'textarea' ? (
                      <textarea className="w-full px-3 py-2 border rounded-md" rows={4} disabled />
                    ) : field.fieldType === 'dropdown' ? (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder={`Pilih ${field.fieldLabel.toLowerCase()}`} />
                        </SelectTrigger>
                      </Select>
                    ) : (
                      <Input type={field.fieldType} disabled />
                    )}
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Tiada medan tambahan ditambah lagi
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
