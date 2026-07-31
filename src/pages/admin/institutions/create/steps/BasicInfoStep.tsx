import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Building2, Mail, Phone, Globe, Upload, ImageIcon, X } from 'lucide-react';
import { INSTITUTION_CATEGORIES } from '../types';
import { CreateInstitutionFormData } from '../types';
import { Button } from '@/components/ui/button';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export const BasicInfoStep = () => {
  const form = useFormContext<CreateInstitutionFormData>();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      form.setValue('basicInfo.logo', result);
      setShowUploadDialog(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const removeLogo = () => {
    setLogoPreview(null);
    form.setValue('basicInfo.logo', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <p className="text-sm text-muted-foreground">Enter the institution&apos;s basic details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Institution Name */}
        <FormField
          control={form.control}
          name="basicInfo.name"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="flex items-center gap-2 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Institution Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., National Institute of Technology"
                  {...field}
                  className="h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Institution Code */}
        <FormField
          control={form.control}
          name="basicInfo.code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                Institution Code <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., NIT-001"
                  {...field}
                  className="h-9 uppercase"
                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="basicInfo.category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INSTITUTION_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="basicInfo.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="admin@institution.edu"
                  type="email"
                  {...field}
                  className="h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="basicInfo.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="9876543210" {...field} className="h-9" maxLength={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website */}
        <FormField
          control={form.control}
          name="basicInfo.website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Website
              </FormLabel>
              <FormControl>
                <Input placeholder="https://www.institution.edu" {...field} className="h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo Upload */}
        <FormField
          control={form.control}
          name="basicInfo.logo"
          render={() => (
            <FormItem>
              <FormLabel className="text-sm">Logo</FormLabel>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-12 w-12 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadDialog(true)}
                  className="h-8 text-xs"
                >
                  <Upload className="h-3 w-3 mr-1.5" />
                  Upload Logo
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Upload Logo Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Logo</DialogTitle>
            <DialogDescription>Drag and drop an image or click to browse files</DialogDescription>
          </DialogHeader>

          <div
            className={cn(
              'mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className={cn(
                'mb-3 flex h-12 w-12 items-center justify-center rounded-full',
                isDragging ? 'bg-primary/10' : 'bg-muted'
              )}
            >
              <Upload
                className={cn('h-5 w-5', isDragging ? 'text-primary' : 'text-muted-foreground')}
              />
            </div>
            <p className="text-sm font-medium text-center">
              {isDragging ? 'Drop your image here' : 'Drag & drop your logo here'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              or click to browse files
            </p>
            <p className="text-[10px] text-muted-foreground mt-3">
              Supports: PNG, JPG, SVG (max 2MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUploadDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
