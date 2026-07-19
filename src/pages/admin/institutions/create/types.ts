import { z } from 'zod';

export const basicInfoSchema = z.object({
  name: z.string().min(3, 'Institution name must be at least 3 characters'),
  code: z.string().min(3, 'Code must be at least 3 characters').max(10, 'Code must be at most 10 characters')
    .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase letters, numbers, or hyphens'),
  category: z.string().min(1, 'Category is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (10 digits starting with 6-9)'),
  website: z.string().url('Invalid URL').or(z.literal('')).default(''),
  logo: z.string().default(''),
});

export const addressSchema = z.object({
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().default(''),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(2, 'District is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

export const academicConfigSchema = z.object({
  programs: z.array(z.string()).min(1, 'At least one program is required'),
  departments: z.array(z.string()).min(1, 'At least one department is required'),
});

export const academicYearsSchema = z.object({
  academicYears: z.array(z.string()).min(1, 'At least one academic year is required'),
});

export const adminUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  autoGeneratePassword: z.boolean().default(true),
});

export const iqacCoordinatorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  autoGeneratePassword: z.boolean().default(true),
});

export const principalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  autoGeneratePassword: z.boolean().default(true),
});

export const createInstitutionSchema = z.object({
  basicInfo: basicInfoSchema,
  address: addressSchema,
  academicConfig: academicConfigSchema,
  academicYears: academicYearsSchema,
  admin: adminUserSchema,
  iqacCoordinator: iqacCoordinatorSchema,
  principal: principalSchema,
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type AcademicConfigFormData = z.infer<typeof academicConfigSchema>;
export type AcademicYearsFormData = z.infer<typeof academicYearsSchema>;
export type AdminUserFormData = z.infer<typeof adminUserSchema>;
export type IqacCoordinatorFormData = z.infer<typeof iqacCoordinatorSchema>;
export type PrincipalFormData = z.infer<typeof principalSchema>;
export type CreateInstitutionFormData = z.infer<typeof createInstitutionSchema>;

export interface StepConfig {
  id: number;
  title: string;
  description: string;
}

export const STEPS: StepConfig[] = [
  { id: 1, title: 'Basic Info', description: 'Institution details' },
  { id: 2, title: 'Address', description: 'Location details' },
  { id: 3, title: 'Academic', description: 'Programs & departments' },
  { id: 4, title: 'Years', description: 'Academic years' },
  { id: 5, title: 'Admin', description: 'Institution admin' },
  { id: 6, title: 'IQAC', description: 'IQAC coordinator' },
  { id: 7, title: 'Principal', description: 'Principal details' },
  { id: 8, title: 'Review', description: 'Review & submit' },
];

export const DEFAULT_PROGRAMS = ['B.Tech', 'M.Tech'];
export const DEFAULT_DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AI & ML', 'Data Science'];
export const DEFAULT_ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27'];

export const INSTITUTION_CATEGORIES = [
  'Engineering College',
  'Medical College',
  'Arts & Science College',
  'Management Institute',
  'Law College',
  'Education College',
  'Pharmacy College',
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
];