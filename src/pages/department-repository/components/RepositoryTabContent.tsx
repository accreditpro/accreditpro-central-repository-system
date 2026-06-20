import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RepositoryTabConfig } from '../types';
import {
  repositorySummaries,
  evidenceDocuments,
  workflowSteps,
  mockValidationResult,
  uploadHistory,
  masterData,
  coordinatorContext,
} from '../repository-configs';
import { CSVUploadDialog } from './CSVUploadDialog';
import {
  Download,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  Replace,
  DownloadCloud,
  Shield,
  Pencil,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';

interface RepositoryTabContentProps {
  tabConfig: RepositoryTabConfig;
  repositoryId: string;
}

// Generate mock table data based on tab config fields
const generateMockData = (tabConfig: RepositoryTabConfig): Record<string, string>[] => {
  const { id, fields } = tabConfig;
  if (fields.length === 0) return [];

  const mockDataMap: Record<string, Record<string, string>[]> = {
    'curriculum': [
      { 'Program': 'B.Tech CSE AI R22', 'Academic Regulation': 'R22', 'Total Credits': '160', 'Open Electives Available': '4', 'Professional Electives Available': '6', 'Value Added Courses Available': '3', 'Internship Included': 'Yes', 'Project Work Included': 'Yes', 'Industry Courses Included': 'Yes', 'Revision Date': '2022-06-15' },
      { 'Program': 'B.Tech CSE Data Science R22', 'Academic Regulation': 'R22', 'Total Credits': '160', 'Open Electives Available': '4', 'Professional Electives Available': '5', 'Value Added Courses Available': '3', 'Internship Included': 'Yes', 'Project Work Included': 'Yes', 'Industry Courses Included': 'Yes', 'Revision Date': '2022-06-15' },
      { 'Program': 'B.Tech CSE Cyber Security R22', 'Academic Regulation': 'R22', 'Total Credits': '160', 'Open Electives Available': '3', 'Professional Electives Available': '6', 'Value Added Courses Available': '2', 'Internship Included': 'Yes', 'Project Work Included': 'Yes', 'Industry Courses Included': 'No', 'Revision Date': '2022-06-15' },
      { 'Program': 'M.Tech CSE AI R22', 'Academic Regulation': 'R22', 'Total Credits': '72', 'Open Electives Available': '2', 'Professional Electives Available': '4', 'Value Added Courses Available': '1', 'Internship Included': 'Yes', 'Project Work Included': 'Yes', 'Industry Courses Included': 'Yes', 'Revision Date': '2022-07-01' },
      { 'Program': 'M.Tech CSE Data Science R20', 'Academic Regulation': 'R20', 'Total Credits': '72', 'Open Electives Available': '2', 'Professional Electives Available': '3', 'Value Added Courses Available': '1', 'Internship Included': 'Yes', 'Project Work Included': 'Yes', 'Industry Courses Included': 'No', 'Revision Date': '2020-07-01' },
    ],
    'courses': [
      { 'Course Code': 'CS501', 'Course Name': 'Machine Learning', 'Program': 'B.Tech CSE AI R22', 'Semester': '5', 'Course Type': 'Theory + Lab', 'Credits': '4', 'Theory Hours': '3', 'Lab Hours': '2', 'Status': 'Active' },
      { 'Course Code': 'CS502', 'Course Name': 'Deep Learning', 'Program': 'B.Tech CSE AI R22', 'Semester': '5', 'Course Type': 'Theory + Lab', 'Credits': '4', 'Theory Hours': '3', 'Lab Hours': '2', 'Status': 'Active' },
      { 'Course Code': 'CS503', 'Course Name': 'Natural Language Processing', 'Program': 'B.Tech CSE AI R22', 'Semester': '6', 'Course Type': 'Theory', 'Credits': '3', 'Theory Hours': '3', 'Lab Hours': '0', 'Status': 'Active' },
      { 'Course Code': 'CS504', 'Course Name': 'Computer Vision', 'Program': 'B.Tech CSE AI R22', 'Semester': '6', 'Course Type': 'Theory + Lab', 'Credits': '4', 'Theory Hours': '3', 'Lab Hours': '2', 'Status': 'Active' },
      { 'Course Code': 'CS505', 'Course Name': 'Big Data Analytics', 'Program': 'B.Tech CSE Data Science R22', 'Semester': '5', 'Course Type': 'Theory + Lab', 'Credits': '4', 'Theory Hours': '3', 'Lab Hours': '2', 'Status': 'Active' },
      { 'Course Code': 'CS506', 'Course Name': 'Data Warehousing', 'Program': 'B.Tech CSE Data Science R22', 'Semester': '5', 'Course Type': 'Theory', 'Credits': '3', 'Theory Hours': '3', 'Lab Hours': '0', 'Status': 'Active' },
      { 'Course Code': 'CS507', 'Course Name': 'Cryptography & Network Security', 'Program': 'B.Tech CSE Cyber Security R22', 'Semester': '5', 'Course Type': 'Theory + Lab', 'Credits': '4', 'Theory Hours': '3', 'Lab Hours': '2', 'Status': 'Active' },
      { 'Course Code': 'CS508', 'Course Name': 'Ethical Hacking', 'Program': 'B.Tech CSE Cyber Security R22', 'Semester': '6', 'Course Type': 'Lab', 'Credits': '2', 'Theory Hours': '0', 'Lab Hours': '4', 'Status': 'Active' },
    ],
    'academic-calendar': [
      { 'Academic Year': '2025-26', 'Semester': 'I', 'Start Date': '2025-07-01', 'End Date': '2025-11-30', 'Instructional Days': '90', 'Mid Exam Dates': '2025-09-15 to 2025-09-20', 'End Exam Dates': '2025-11-20 to 2025-11-30' },
      { 'Academic Year': '2025-26', 'Semester': 'II', 'Start Date': '2025-12-15', 'End Date': '2026-04-30', 'Instructional Days': '90', 'Mid Exam Dates': '2026-02-15 to 2026-02-20', 'End Exam Dates': '2026-04-20 to 2026-04-30' },
      { 'Academic Year': '2024-25', 'Semester': 'I', 'Start Date': '2024-07-01', 'End Date': '2024-11-30', 'Instructional Days': '88', 'Mid Exam Dates': '2024-09-16 to 2024-09-21', 'End Exam Dates': '2024-11-18 to 2024-11-28' },
      { 'Academic Year': '2024-25', 'Semester': 'II', 'Start Date': '2024-12-16', 'End Date': '2025-04-30', 'Instructional Days': '90', 'Mid Exam Dates': '2025-02-17 to 2025-02-22', 'End Exam Dates': '2025-04-21 to 2025-04-30' },
    ],
    'value-added-courses': [
      { 'Course Name': 'Python for Data Science', 'Conducting Unit': 'CSE', 'Academic Year': '2025-26', 'Duration Hours': '40', 'Students Enrolled': '120', 'Certification Provided': 'Yes' },
      { 'Course Name': 'AWS Cloud Practitioner', 'Conducting Unit': 'CSE', 'Academic Year': '2025-26', 'Duration Hours': '30', 'Students Enrolled': '85', 'Certification Provided': 'Yes' },
      { 'Course Name': 'Full Stack Web Development', 'Conducting Unit': 'CSE', 'Academic Year': '2025-26', 'Duration Hours': '60', 'Students Enrolled': '95', 'Certification Provided': 'Yes' },
      { 'Course Name': 'Soft Skills & Communication', 'Conducting Unit': 'CSE', 'Academic Year': '2024-25', 'Duration Hours': '30', 'Students Enrolled': '200', 'Certification Provided': 'Yes' },
      { 'Course Name': 'IoT with Arduino', 'Conducting Unit': 'CSE', 'Academic Year': '2024-25', 'Duration Hours': '45', 'Students Enrolled': '60', 'Certification Provided': 'Yes' },
      { 'Course Name': 'Blockchain Fundamentals', 'Conducting Unit': 'CSE', 'Academic Year': '2024-25', 'Duration Hours': '35', 'Students Enrolled': '45', 'Certification Provided': 'No' },
    ],
    'moocs': [
      { 'Platform Name': 'NPTEL', 'Course Name': 'Deep Learning - IIT Madras', 'Academic Year': '2025-26', 'Students Enrolled': '85', 'Certifications Earned': '62' },
      { 'Platform Name': 'NPTEL', 'Course Name': 'Data Structures & Algorithms', 'Academic Year': '2025-26', 'Students Enrolled': '120', 'Certifications Earned': '95' },
      { 'Platform Name': 'SWAYAM', 'Course Name': 'Cloud Computing', 'Academic Year': '2025-26', 'Students Enrolled': '45', 'Certifications Earned': '32' },
      { 'Platform Name': 'Coursera', 'Course Name': 'Machine Learning Specialization', 'Academic Year': '2025-26', 'Students Enrolled': '60', 'Certifications Earned': '48' },
      { 'Platform Name': 'NPTEL', 'Course Name': 'Computer Networks', 'Academic Year': '2024-25', 'Students Enrolled': '95', 'Certifications Earned': '78' },
      { 'Platform Name': 'Udemy', 'Course Name': 'React.js Complete Guide', 'Academic Year': '2024-25', 'Students Enrolled': '40', 'Certifications Earned': '35' },
      { 'Platform Name': 'edX', 'Course Name': 'Cybersecurity Fundamentals', 'Academic Year': '2024-25', 'Students Enrolled': '55', 'Certifications Earned': '42' },
    ],
    'faculty-profiles': [
      { 'Employee ID': 'EMP001', 'Faculty Name': 'Dr. Rajesh Kumar', 'Gender': 'Male', 'Date of Birth': '1975-03-15', 'PAN Number': 'ABCPK1234A', 'Official Email': 'rajesh.kumar@institution.edu', 'Personal Email': 'rajesh.k@gmail.com', 'Mobile Number': '9876543210', 'Academic Unit': 'Computer Science & Engineering', 'Designation': 'Professor', 'Status': 'Active' },
      { 'Employee ID': 'EMP002', 'Faculty Name': 'Dr. Priya Sharma', 'Gender': 'Female', 'Date of Birth': '1980-07-22', 'PAN Number': 'DEFPS5678B', 'Official Email': 'priya.sharma@institution.edu', 'Personal Email': 'priya.s@gmail.com', 'Mobile Number': '9876543211', 'Academic Unit': 'Computer Science & Engineering', 'Designation': 'Associate Professor', 'Status': 'Active' },
      { 'Employee ID': 'EMP003', 'Faculty Name': 'Mr. Anil Reddy', 'Gender': 'Male', 'Date of Birth': '1985-11-08', 'PAN Number': 'GHIAR9012C', 'Official Email': 'anil.reddy@institution.edu', 'Personal Email': 'anil.r@gmail.com', 'Mobile Number': '9876543212', 'Academic Unit': 'Computer Science & Engineering', 'Designation': 'Assistant Professor', 'Status': 'Active' },
      { 'Employee ID': 'EMP004', 'Faculty Name': 'Dr. Sunita Patel', 'Gender': 'Female', 'Date of Birth': '1978-05-30', 'PAN Number': 'JKLSP3456D', 'Official Email': 'sunita.patel@institution.edu', 'Personal Email': 'sunita.p@gmail.com', 'Mobile Number': '9876543213', 'Academic Unit': 'Computer Science & Engineering', 'Designation': 'Professor', 'Status': 'Active' },
      { 'Employee ID': 'EMP005', 'Faculty Name': 'Dr. Vikram Singh', 'Gender': 'Male', 'Date of Birth': '1982-09-12', 'PAN Number': 'MNOVS7890E', 'Official Email': 'vikram.singh@institution.edu', 'Personal Email': 'vikram.s@gmail.com', 'Mobile Number': '9876543214', 'Academic Unit': 'Computer Science & Engineering', 'Designation': 'Associate Professor', 'Status': 'Active' },
      { 'Employee ID': 'EMP006', 'Faculty Name': 'Ms. Kavitha Nair', 'Gender': 'Female', 'Date of Birth': '1988-01-25', 'PAN Number': 'PQRKN2345F', 'Official Email': 'kavitha.nair@institution.edu', 'Personal Email': '', 'Mobile Number': '9876543215', 'Academic Unit': 'Computer Science & Engineering', 'Designation': 'Assistant Professor', 'Status': 'Active' },
      { 'Employee ID': 'EMP007', 'Faculty Name': 'Dr. Ramesh Gupta', 'Gender': 'Male', 'Date of Birth': '1970-12-05', 'PAN Number': 'STURG6789G', 'Official Email': 'ramesh.gupta@institution.edu', 'Personal Email': 'ramesh.g@gmail.com', 'Mobile Number': '9876543216', 'Academic Unit': 'Computer Science & Engineering', 'Designation': 'Professor', 'Status': 'Relieved' },
    ],
    'qualifications': [
      { 'Qualification Level': 'PhD', 'Degree': 'PhD in Computer Science', 'Specialization': 'Artificial Intelligence', 'University': 'IIT Madras', 'Year of Passing': '2005', 'PhD Status': 'Completed', 'PhD Awarded Date': '2005-06-15' },
      { 'Qualification Level': 'PG', 'Degree': 'M.Tech in Computer Science', 'Specialization': 'Machine Learning', 'University': 'NIT Warangal', 'Year of Passing': '2002', 'PhD Status': 'Not Applicable', 'PhD Awarded Date': '' },
      { 'Qualification Level': 'PhD', 'Degree': 'PhD in Information Technology', 'Specialization': 'Data Mining', 'University': 'JNTU Hyderabad', 'Year of Passing': '2010', 'PhD Status': 'Completed', 'PhD Awarded Date': '2010-09-20' },
      { 'Qualification Level': 'PG', 'Degree': 'M.Tech in Software Engineering', 'Specialization': 'Software Architecture', 'University': 'Anna University', 'Year of Passing': '2008', 'PhD Status': 'Pursuing', 'PhD Awarded Date': '' },
      { 'Qualification Level': 'PhD', 'Degree': 'PhD in Computer Engineering', 'Specialization': 'Cloud Computing', 'University': 'IISc Bangalore', 'Year of Passing': '2012', 'PhD Status': 'Completed', 'PhD Awarded Date': '2012-03-10' },
      { 'Qualification Level': 'UG', 'Degree': 'B.Tech in Computer Science', 'Specialization': 'Computer Science', 'University': 'Osmania University', 'Year of Passing': '2010', 'PhD Status': 'Not Applicable', 'PhD Awarded Date': '' },
      { 'Qualification Level': 'Post Doctoral', 'Degree': 'Post Doctoral Research', 'Specialization': 'Natural Language Processing', 'University': 'Stanford University', 'Year of Passing': '2008', 'PhD Status': 'Completed', 'PhD Awarded Date': '2005-12-01' },
    ],
    'employment-info': [
      { 'Employment Type': 'Regular', 'Faculty Category': 'Full-Time', 'Date of Joining Institution': '2006-07-01', 'Date of Joining Profession': '2001-08-15', 'Total Experience (Years)': '24', 'Industry Experience (Years)': '3', 'AICTE Faculty ID': 'AICTE-2006-001' },
      { 'Employment Type': 'Regular', 'Faculty Category': 'Full-Time', 'Date of Joining Institution': '2011-01-10', 'Date of Joining Profession': '2005-06-20', 'Total Experience (Years)': '20', 'Industry Experience (Years)': '5', 'AICTE Faculty ID': 'AICTE-2011-002' },
      { 'Employment Type': 'Contract', 'Faculty Category': 'Full-Time', 'Date of Joining Institution': '2018-07-15', 'Date of Joining Profession': '2012-08-01', 'Total Experience (Years)': '13', 'Industry Experience (Years)': '4', 'AICTE Faculty ID': '' },
      { 'Employment Type': 'Regular', 'Faculty Category': 'Full-Time', 'Date of Joining Institution': '2008-06-01', 'Date of Joining Profession': '2003-07-10', 'Total Experience (Years)': '22', 'Industry Experience (Years)': '2', 'AICTE Faculty ID': 'AICTE-2008-003' },
      { 'Employment Type': 'Regular', 'Faculty Category': 'Full-Time', 'Date of Joining Institution': '2013-08-20', 'Date of Joining Profession': '2008-09-01', 'Total Experience (Years)': '17', 'Industry Experience (Years)': '3', 'AICTE Faculty ID': 'AICTE-2013-004' },
      { 'Employment Type': 'Visiting', 'Faculty Category': 'Part-Time', 'Date of Joining Institution': '2020-01-05', 'Date of Joining Profession': '2015-06-15', 'Total Experience (Years)': '10', 'Industry Experience (Years)': '6', 'AICTE Faculty ID': '' },
      { 'Employment Type': 'Regular', 'Faculty Category': 'Full-Time', 'Date of Joining Institution': '2000-07-01', 'Date of Joining Profession': '1995-08-10', 'Total Experience (Years)': '30', 'Industry Experience (Years)': '5', 'AICTE Faculty ID': 'AICTE-2000-005' },
    ],
    'fdps': [
      { 'FDP Name': 'AI/ML in Education', 'Organizing Body': 'AICTE', 'Start Date': '2025-01-06', 'End Date': '2025-01-10', 'Duration Days': '5', 'Mode': 'Online', 'Certification Available': 'Yes' },
      { 'FDP Name': 'Outcome Based Education', 'Organizing Body': 'NBA', 'Start Date': '2024-11-18', 'End Date': '2024-11-22', 'Duration Days': '5', 'Mode': 'Offline', 'Certification Available': 'Yes' },
      { 'FDP Name': 'Research Methodology', 'Organizing Body': 'UGC', 'Start Date': '2024-09-02', 'End Date': '2024-09-06', 'Duration Days': '5', 'Mode': 'Online', 'Certification Available': 'Yes' },
      { 'FDP Name': 'Cloud Computing & DevOps', 'Organizing Body': 'NPTEL', 'Start Date': '2024-07-15', 'End Date': '2024-07-19', 'Duration Days': '5', 'Mode': 'Online', 'Certification Available': 'Yes' },
      { 'FDP Name': 'Pedagogy for Engineering', 'Organizing Body': 'NITTTR', 'Start Date': '2024-06-03', 'End Date': '2024-06-14', 'Duration Days': '12', 'Mode': 'Offline', 'Certification Available': 'Yes' },
      { 'FDP Name': 'Cybersecurity Awareness', 'Organizing Body': 'ISEA', 'Start Date': '2024-03-11', 'End Date': '2024-03-13', 'Duration Days': '3', 'Mode': 'Online', 'Certification Available': 'No' },
      { 'FDP Name': 'Data Science with Python', 'Organizing Body': 'IIT Bombay', 'Start Date': '2023-12-04', 'End Date': '2023-12-08', 'Duration Days': '5', 'Mode': 'Online', 'Certification Available': 'Yes' },
    ],
  };

  if (mockDataMap[id]) return mockDataMap[id];

  // Generate generic data for other tabs
  const rows: Record<string, string>[] = [];
  for (let i = 0; i < 5; i++) {
    const row: Record<string, string> = {};
    fields.forEach(field => {
      if (field.masterDataSource === 'programOfferings') row[field.csvColumn] = masterData.programOfferings[i % masterData.programOfferings.length];
      else if (field.masterDataSource === 'programs') row[field.csvColumn] = masterData.programs[i % masterData.programs.length];
      else if (field.masterDataSource === 'departments') row[field.csvColumn] = coordinatorContext.department;
      else if (field.masterDataSource === 'specializations') row[field.csvColumn] = masterData.specializations[i % masterData.specializations.length];
      else if (field.masterDataSource === 'academicYears') row[field.csvColumn] = masterData.academicYears[i % masterData.academicYears.length];
      else if (field.masterDataSource === 'regulations') row[field.csvColumn] = masterData.regulations[i % masterData.regulations.length];
      else if (field.masterDataSource === 'platforms') row[field.csvColumn] = masterData.platforms[i % masterData.platforms.length];
      else if (field.autoPopulate) row[field.csvColumn] = coordinatorContext.department;
      else if (field.type === 'number') row[field.csvColumn] = String(Math.floor(Math.random() * 100) + 1);
      else if (field.type === 'date') row[field.csvColumn] = '2025-01-15';
      else if (field.type === 'boolean') row[field.csvColumn] = i % 2 === 0 ? 'Yes' : 'No';
      else if (field.selectOptions) row[field.csvColumn] = field.selectOptions[i % field.selectOptions.length];
      else row[field.csvColumn] = `Sample ${field.label} ${i + 1}`;
    });
    rows.push(row);
  }
  return rows;
};

export const RepositoryTabContent = ({ tabConfig, repositoryId }: RepositoryTabContentProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [tableData, setTableData] = useState<Record<string, string>[]>(() => generateMockData(tabConfig));
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);

  const summary = repositorySummaries[tabConfig.id] || {
    recordsUploaded: 0, pendingValidation: 0, pendingVerification: 0,
    verified: 0, approved: 0, rejected: 0, lastUpdated: '-',
  };

  const tabEvidence = evidenceDocuments.filter(d =>
    d.category.toLowerCase().includes(tabConfig.label.toLowerCase().split(' ')[0]) ||
    tabConfig.id.includes('documents')
  );

  const tabUploads = uploadHistory.filter(u =>
    u.repository === repositoryId &&
    (u.tab.toLowerCase().includes(tabConfig.label.toLowerCase().split(' ')[0]) || tabConfig.id.includes('documents'))
  );

  const handleDownloadTemplate = () => {
    if (!tabConfig.templateFile) return;
    const headers = tabConfig.fields.map(f => f.csvColumn).join(',');
    const sampleRow = tabConfig.fields.map(f => {
      if (f.masterDataSource === 'programOfferings') return masterData.programOfferings[0];
      if (f.masterDataSource === 'programs') return masterData.programs[0];
      if (f.masterDataSource === 'departments') return coordinatorContext.department;
      if (f.masterDataSource === 'specializations') return masterData.specializations[0];
      if (f.masterDataSource === 'academicYears') return masterData.academicYears[0];
      if (f.masterDataSource === 'regulations') return masterData.regulations[0];
      if (f.masterDataSource === 'platforms') return masterData.platforms[0];
      if (f.autoPopulate) return coordinatorContext.department;
      return '';
    }).join(',');

    const csvContent = `${headers}\n${sampleRow}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tabConfig.id}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEditRow = (index: number) => {
    setEditingRow(index);
    setEditFormData({ ...tableData[index] });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingRow !== null) {
      const newData = [...tableData];
      newData[editingRow] = { ...editFormData };
      setTableData(newData);
      setShowEditDialog(false);
      setEditingRow(null);
    }
  };

  const handleDeleteRow = (index: number) => {
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
  };

  const handleCSVUploadComplete = useCallback((data: Record<string, string>[]) => {
    setTableData(prev => [...prev, ...data]);
    setShowUploadDialog(false);
  }, []);

  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val =>
      val.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getFieldInput = (field: { key: string; label: string; type: string; csvColumn: string; masterDataSource?: string; selectOptions?: string[]; autoPopulate?: boolean }) => {
    const value = editFormData[field.csvColumn] || '';

    if (field.masterDataSource) {
      const options = masterData[field.masterDataSource as keyof typeof masterData] as string[];
      return (
        <Select value={value} onValueChange={(v) => setEditFormData(prev => ({ ...prev, [field.csvColumn]: v }))}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.selectOptions) {
      return (
        <Select value={value} onValueChange={(v) => setEditFormData(prev => ({ ...prev, [field.csvColumn]: v }))}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.selectOptions.map(opt => (
              <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'boolean') {
      return (
        <Select value={value} onValueChange={(v) => setEditFormData(prev => ({ ...prev, [field.csvColumn]: v }))}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes" className="text-xs">Yes</SelectItem>
            <SelectItem value="No" className="text-xs">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        className="h-9 text-xs"
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(e) => setEditFormData(prev => ({ ...prev, [field.csvColumn]: e.target.value }))}
        disabled={field.autoPopulate}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {tableData.length} records
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tabConfig.templateFile && (
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
              </Button>
            )}
            {tabConfig.fields.length > 0 && (
              <Button size="sm" className="text-xs h-8" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-xs h-8">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Record
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {tabConfig.fields.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">{tabConfig.label} Data</CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredData.length} of {tableData.length} records
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-8 text-xs pl-8"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                    {tabConfig.fields.map(field => (
                      <TableHead key={field.key} className="text-[10px] font-semibold leading-tight min-w-[60px]">
                        {field.csvColumn}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </TableHead>
                    ))}
                    <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tabConfig.fields.length + 2} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FileText className="h-8 w-8 opacity-40" />
                          <p className="text-xs">No data available. Upload a CSV or add records manually.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, index) => (
                      <TableRow key={index} className="hover:bg-muted/20">
                        <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">{index + 1}</TableCell>
                        {tabConfig.fields.map(field => (
                          <TableCell key={field.key} className="text-[10px] p-1.5 truncate">
                            {field.type === 'boolean' ? (
                              <Badge variant="secondary" className={cn('text-[9px]',
                                row[field.csvColumn] === 'Yes' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-600'
                              )}>
                                {row[field.csvColumn]}
                              </Badge>
                            ) : field.masterDataSource ? (
                              <Badge variant="outline" className="text-[9px] font-normal">
                                {row[field.csvColumn]}
                              </Badge>
                            ) : (
                              row[field.csvColumn] || '-'
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center p-1.5">
                          <div className="flex items-center justify-center gap-0">
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleEditRow(index)}>
                              <Pencil className="h-3 w-3 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleDeleteRow(index)}>
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {tabConfig.fields.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Validation Results</CardTitle>
                <CardDescription className="text-xs">Latest validation report</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                <Download className="h-3 w-3 mr-1" /> Error Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-sm font-bold">{mockValidationResult.totalRows}</p>
                <p className="text-[9px] text-muted-foreground">Total Rows</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/5 text-center">
                <p className="text-sm font-bold text-emerald-600">{mockValidationResult.validRows}</p>
                <p className="text-[9px] text-muted-foreground">Valid</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/5 text-center">
                <p className="text-sm font-bold text-red-600">{mockValidationResult.invalidRows}</p>
                <p className="text-[9px] text-muted-foreground">Invalid</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/5 text-center">
                <p className="text-sm font-bold text-amber-600">{mockValidationResult.warnings}</p>
                <p className="text-[9px] text-muted-foreground">Warnings</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/5 text-center">
                <p className="text-sm font-bold text-red-600">{mockValidationResult.errors.filter(e => e.severity === 'error').length}</p>
                <p className="text-[9px] text-muted-foreground">Errors</p>
              </div>
            </div>

            {mockValidationResult.errors.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px]">Row</TableHead>
                      <TableHead className="text-[10px]">Column</TableHead>
                      <TableHead className="text-[10px]">Value</TableHead>
                      <TableHead className="text-[10px]">Message</TableHead>
                      <TableHead className="text-[10px]">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockValidationResult.errors.map((err, i) => (
                      <TableRow key={i} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-mono">{err.row}</TableCell>
                        <TableCell className="text-xs font-medium">{err.column}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{err.value || '(empty)'}</TableCell>
                        <TableCell className="text-xs">{err.message}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-[9px]', err.severity === 'error' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600')}>
                            {err.severity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evidence Repository */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Evidence Repository</CardTitle>
              <CardDescription className="text-xs">Supporting documents for {tabConfig.label}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px]">{tabEvidence.length} documents</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {tabConfig.requiredEvidence.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] text-muted-foreground mr-1">Required:</span>
              {tabConfig.requiredEvidence.map((ev) => (
                <Badge key={ev} variant="outline" className="text-[9px] px-1.5 py-0">{ev}</Badge>
              ))}
            </div>
          )}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px]">Document</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Version</TableHead>
                  <TableHead className="text-[10px]">Uploaded By</TableHead>
                  <TableHead className="text-[10px]">Date</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tabConfig.id.includes('documents') ? evidenceDocuments : tabEvidence.slice(0, 4)).map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium truncate max-w-[180px]">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{doc.category}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.version}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.uploadedBy}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.uploadedDate}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('text-[9px]',
                        doc.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                        doc.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                        doc.status === 'rejected' && 'bg-red-500/10 text-red-600',
                        doc.status === 'uploaded' && 'bg-blue-500/10 text-blue-600',
                      )}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Eye className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><DownloadCloud className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Replace className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Status */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Workflow Status</CardTitle>
          <CardDescription className="text-xs">Data Upload → Validation → Evidence Upload → HOD Review → IQAC Verification → Approved</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {workflowSteps.map((step, index, arr) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                    step.status === 'completed' && 'bg-emerald-500 border-emerald-500 text-white',
                    step.status === 'current' && 'border-indigo-500 bg-indigo-500/10 text-indigo-600',
                    step.status === 'pending' && 'border-muted-foreground/30 text-muted-foreground/40',
                  )}>
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : step.status === 'current' ? (
                      <Clock className="h-3.5 w-3.5" />
                    ) : (
                      <span className="text-[10px] font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    'text-[9px] mt-1 font-medium text-center',
                    step.status === 'current' ? 'text-indigo-600' : step.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                  {step.timestamp && (
                    <span className="text-[8px] text-muted-foreground">{step.timestamp.split(' ')[0]}</span>
                  )}
                  {step.actor && (
                    <span className="text-[8px] text-muted-foreground">{step.actor}</span>
                  )}
                </div>
                {index < arr.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-4 sm:w-8 rounded-full',
                    step.status === 'completed' ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-[10px] text-muted-foreground">
              <span className="font-medium">Note:</span> As Department Coordinator, you can Upload, Update, and Re-submit data.
              Verification and Approval are performed by HOD and IQAC respectively.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px]">File</TableHead>
                  <TableHead className="text-[10px]">Uploaded</TableHead>
                  <TableHead className="text-[10px]">Records</TableHead>
                  <TableHead className="text-[10px]">Valid/Invalid</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tabUploads.length > 0 ? tabUploads.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/20">
                    <TableCell className="text-xs font-medium">{record.fileName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{record.uploadedAt}</TableCell>
                    <TableCell className="text-xs">{record.recordsCount}</TableCell>
                    <TableCell className="text-xs">
                      <span className="text-emerald-600">{record.validRecords}</span>/{' '}
                      <span className="text-red-600">{record.invalidRecords}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('text-[9px]',
                        record.status === 'approved' && 'bg-emerald-500/10 text-emerald-600',
                        record.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                        record.status === 'rejected' && 'bg-red-500/10 text-red-600',
                      )}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-xs text-muted-foreground">
                      No upload history for this section yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Record</DialogTitle>
            <DialogDescription className="text-xs">
              Modify the record fields below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            {tabConfig.fields.map(field => (
              <div key={field.key} className="grid gap-1.5">
                <Label className="text-xs font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                {getFieldInput(field)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <CSVUploadDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        tabConfig={tabConfig}
        existingData={tableData}
        onUploadComplete={handleCSVUploadComplete}
      />
    </motion.div>
  );
};