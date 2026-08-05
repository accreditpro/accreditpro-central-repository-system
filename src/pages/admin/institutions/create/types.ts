import { z } from 'zod';

export const basicInfoSchema = z.object({
  name: z.string().min(3, 'Institution name must be at least 3 characters'),
  code: z.string().min(3, 'Code must be at least 3 characters').max(10, 'Code must be at most 10 characters')
    .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase letters, numbers, or hyphens'),
  category: z.string().min(1, 'Category is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (10 digits starting with 6-9)'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  logo: z.string().optional(),
});

export const addressSchema = z.object({
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional().or(z.literal('')),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(2, 'District is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

export const adminUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
});

export const createInstitutionSchema = z.object({
  basicInfo: basicInfoSchema,
  address: addressSchema,
  admin: adminUserSchema,
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type AdminUserFormData = z.infer<typeof adminUserSchema>;
export type CreateInstitutionFormData = z.infer<typeof createInstitutionSchema>;

export interface StepConfig {
  id: number;
  title: string;
  description: string;
}

export const STEPS: StepConfig[] = [
  { id: 1, title: 'Basic Info', description: 'Institution details' },
  { id: 2, title: 'Address', description: 'Location details' },
  { id: 3, title: 'Admin', description: 'Institution admin' },
  { id: 4, title: 'Review', description: 'Review & submit' },
];

export const INSTITUTION_CATEGORIES = [
  'Engineering College',
  'Medical College',
  'Arts & Science College',
  'Management Institute',
  'Law College',
  'Education College',
  'Pharmacy College',
];

// Map wizard category labels to the InstitutionCategory union used by the platform
import { InstitutionCategory } from '@/types/institution.types';

export const CATEGORY_MAP: Record<string, InstitutionCategory> = {
  'Engineering College': 'Engineering',
  'Medical College': 'Medical',
  'Arts & Science College': 'Arts & Science',
  'Management Institute': 'Management',
  'Law College': 'Law',
  'Education College': 'Education',
  'Pharmacy College': 'Pharmacy',
};

export const CATEGORY_LABEL_MAP: Record<InstitutionCategory, string> = {
  Engineering: 'Engineering College',
  Medical: 'Medical College',
  'Arts & Science': 'Arts & Science College',
  Management: 'Management Institute',
  Law: 'Law College',
  Education: 'Education College',
  Pharmacy: 'Pharmacy College',
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
];