import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  getAlumniDetails,
  createAlumniDetail,
  updateAlumniDetail,
  deleteAlumniDetail,
  uploadAlumniDetailsCsv,
  getEmploymentRecords,
  uploadEmploymentCsv,
  createEmploymentRecord,
  updateEmploymentRecord,
  deleteEmploymentRecord,
  getHigherEducationRecords,
  createHigherEducationRecord,
  uploadHigherEducationCsv,
  updateHigherEducationRecord,
  deleteHigherEducationRecord,
  getEngagementRecords,
  createEngagementRecord,
  updateEngagementRecord,
  deleteEngagementRecord,
  uploadEngagementCsv,
  getContributionRecords,
  createContributionRecord,
  updateContributionRecord,
  deleteContributionRecord,
  uploadContributionCsv,
  getMentorshipRecords,
  createMentorshipRecord,
  updateMentorshipRecord,
  deleteMentorshipRecord,
  uploadMentorshipCsv,
  getAchievementRecords,
  createAchievementRecord,
  updateAchievementRecord,
  deleteAchievementRecord,
  uploadAchievementCsv,
  getChapterRecords,
  createChapterRecord,
  updateChapterRecord,
  deleteChapterRecord,
  uploadChapterCsv,
  getEventRecords,
  createEventRecord,
  updateEventRecord,
  deleteEventRecord,
  uploadEventCsv,
  uploadEvidenceDocument,
  getEvidenceDocuments,
  deleteEvidenceDocument,
  getSectionName,
} from '@/services/alumni-repository.service';
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
  evidenceDocuments,
  masterData,
  coordinatorContext,
} from '../repository-configs';
import { CSVUploadDialog } from './CSVUploadDialog';
import { EvidencePreviewModal } from './EvidencePreviewModal';
import {
  Download,
  Upload,
  FileText,
  Eye,
  Replace,
  DownloadCloud,
  Pencil,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';

interface RepositoryTabContentProps {
  tabConfig: RepositoryTabConfig;
  repositoryId?: string;
  academicYear?: string;
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

// ─── Alumni-specific helpers ──────────────────────────────────────────────────

/** Map an API record (camelCase) to the table row format (CSV column names). */
const mapApiToRow = (
  record: Record<string, any>,
  fields: RepositoryTabConfig['fields']
): Record<string, string> => {
  const row: Record<string, string> = { _id: String(record.id ?? '') };
  fields.forEach((f) => {
    row[f.csvColumn] = record[f.key] != null ? String(record[f.key]) : '';
  });
  return row;
};

/** Map a table row (CSV column names) back to an API payload (camelCase). */
const mapRowToApi = (
  row: Record<string, string>,
  fields: RepositoryTabConfig['fields']
): Record<string, any> => {
  const payload: Record<string, any> = {};
  fields.forEach((f) => {
    if (row[f.csvColumn] !== undefined && row[f.csvColumn] !== '') {
      payload[f.key] = row[f.csvColumn];
    }
  });
  return payload;
};

export const RepositoryTabContent = ({ tabConfig, repositoryId, academicYear }: RepositoryTabContentProps) => {
  const { user } = useAuth();
  const departmentId = user?.departmentId || 101;
  const year = academicYear || '2025-26';

  // Determine if this is an API-integrated alumni tab
  const isAlumniDetails = repositoryId === 'alumni' && tabConfig.id === 'alumni-details';
  const isEmploymentCareer = repositoryId === 'alumni' && tabConfig.id === 'employment-career';
  const isHigherEducation = repositoryId === 'alumni' && tabConfig.id === 'higher-education';
  const isAlumniEngagement = repositoryId === 'alumni' && tabConfig.id === 'alumni-engagement';
  const isAlumniContributions = repositoryId === 'alumni' && tabConfig.id === 'alumni-contributions';
  const isAlumniMentorship = repositoryId === 'alumni' && tabConfig.id === 'alumni-mentorship';
  const isAlumniAchievements = repositoryId === 'alumni' && tabConfig.id === 'alumni-achievements';
  const isAlumniChapters = repositoryId === 'alumni' && tabConfig.id === 'alumni-chapters';
  const isAlumniEvents = repositoryId === 'alumni' && tabConfig.id === 'alumni-events';
  const isApiDriven = isAlumniDetails || isEmploymentCareer || isHigherEducation || isAlumniEngagement || isAlumniContributions || isAlumniMentorship || isAlumniAchievements || isAlumniChapters || isAlumniEvents;

  const sectionName = getSectionName(tabConfig.id);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [tableData, setTableData] = useState<Record<string, string>[]>(() =>
    isApiDriven ? [] : generateMockData(tabConfig)
  );
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Evidence Repository state
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [showUploadEvidenceDialog, setShowUploadEvidenceDialog] = useState(false);
  const [uploadEvidenceFile, setUploadEvidenceFile] = useState<File | null>(null);
  const [uploadEvidenceRecordId, setUploadEvidenceRecordId] = useState<string>('');
  const [uploadEvidenceDocType, setUploadEvidenceDocType] = useState<string>('');
  const [evidenceUploading, setEvidenceUploading] = useState(false);

  // Preview Dialog state
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  // ─── Fetch data from API ───────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!isApiDriven) return;
    setLoading(true);
    try {
      let response: any;
      if (isAlumniDetails) {
        response = await getAlumniDetails(year, departmentId);
      } else if (isEmploymentCareer) {
        response = await getEmploymentRecords(year, departmentId);
      } else if (isHigherEducation) {
        response = await getHigherEducationRecords(year, departmentId);
      } else if (isAlumniEngagement) {
        response = await getEngagementRecords(year, departmentId);
      } else if (isAlumniContributions) {
        response = await getContributionRecords(year, departmentId);
      } else if (isAlumniMentorship) {
        response = await getMentorshipRecords(year, departmentId);
      } else if (isAlumniAchievements) {
        response = await getAchievementRecords(year, departmentId);
      } else if (isAlumniChapters) {
        response = await getChapterRecords(year, departmentId);
      } else if (isAlumniEvents) {
        response = await getEventRecords(year, departmentId);
      }
      const rawData = response?.data ?? response;
      const records = rawData?.content ?? (Array.isArray(rawData) ? rawData : (Array.isArray(response) ? response : []));
      setTableData(records.map((r: any) => mapApiToRow(r, tabConfig.fields)));
    } catch {
      // API not available yet — keep empty table, no error toast
    } finally {
      setLoading(false);
    }
  }, [isApiDriven, isAlumniDetails, isEmploymentCareer, isHigherEducation, isAlumniEngagement, isAlumniContributions, isAlumniMentorship, isAlumniAchievements, isAlumniChapters, isAlumniEvents, year, departmentId, tabConfig.fields]);

  // ─── Fetch Evidence Documents from API ──────────────────────────────────────
  const fetchEvidence = useCallback(async () => {
    setEvidenceLoading(true);
    try {
      const res = await getEvidenceDocuments({
        departmentId,
        academicYear: year,
        sectionName,
      });
      const rawData = res?.data ?? res;
      const docs = rawData?.content ?? (Array.isArray(rawData) ? rawData : []);
      setEvidenceList(docs);
    } catch {
      setEvidenceList([]);
    } finally {
      setEvidenceLoading(false);
    }
  }, [departmentId, year, sectionName]);

  useEffect(() => {
    fetchData();
    fetchEvidence();
  }, [fetchData, fetchEvidence]);

  const handleUploadEvidence = async () => {
    if (!uploadEvidenceFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!uploadEvidenceRecordId) {
      toast.error('Please select an associated record');
      return;
    }

    setEvidenceUploading(true);
    try {
      await uploadEvidenceDocument({
        departmentId,
        uploadedBy: user?.id || 1,
        file: uploadEvidenceFile,
        academicYear: year,
        sectionName,
        recordId: uploadEvidenceRecordId,
        documentType: uploadEvidenceDocType || (tabConfig.requiredEvidence[0] || 'General Evidence'),
      });
      toast.success('Evidence document uploaded successfully');
      setShowUploadEvidenceDialog(false);
      setUploadEvidenceFile(null);
      setUploadEvidenceRecordId('');
      setUploadEvidenceDocType('');
      fetchEvidence();
    } catch {
      toast.error('Failed to upload evidence document');
    } finally {
      setEvidenceUploading(false);
    }
  };

  const handleDeleteEvidence = async (docId: number | string) => {
    try {
      await deleteEvidenceDocument(docId, departmentId);
      toast.success('Evidence document deleted successfully');
      fetchEvidence();
    } catch {
      toast.error('Failed to delete evidence document');
    }
  };

  const tabEvidence = evidenceDocuments.filter(d =>
    d.category.toLowerCase().includes(tabConfig.label.toLowerCase().split(' ')[0]) ||
    tabConfig.id.includes('documents')
  );

  const handleDownloadTemplate = () => {
    // For API-driven tabs: export current table data as CSV
    if (isApiDriven) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      tableData.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tabConfig.id}_${year}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

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

  const handleSaveEdit = async () => {
    if (editingRow === null) return;

    if (isAlumniDetails) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      setLoading(true);
      try {
        await updateAlumniDetail(recordId, year, departmentId, payload);
        toast.success('Record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isEmploymentCareer) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      if (payload.currentPackage !== undefined && payload.currentPackage !== '') {
        payload.currentPackage = Number(payload.currentPackage);
      }
      setLoading(true);
      try {
        await updateEmploymentRecord(recordId, year, departmentId, payload);
        toast.success('Employment record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update employment record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isHigherEducation) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      setLoading(true);
      try {
        await updateHigherEducationRecord(recordId, year, departmentId, payload);
        toast.success('Higher education record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update higher education record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isAlumniEngagement) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      if (payload.contributionHours !== undefined && payload.contributionHours !== '') {
        payload.contributionHours = Number(payload.contributionHours);
      }
      setLoading(true);
      try {
        await updateEngagementRecord(recordId, year, departmentId, payload);
        toast.success('Engagement record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update engagement record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isAlumniContributions) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      if (payload.contributionValue !== undefined && payload.contributionValue !== '') {
        payload.contributionValue = Number(payload.contributionValue);
      }
      setLoading(true);
      try {
        await updateContributionRecord(recordId, year, departmentId, payload);
        toast.success('Contribution record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update contribution record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isAlumniMentorship) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      if (payload.numberOfMentees !== undefined && payload.numberOfMentees !== '') {
        payload.numberOfMentees = Number(payload.numberOfMentees);
      }
      setLoading(true);
      try {
        await updateMentorshipRecord(recordId, year, departmentId, payload);
        toast.success('Mentorship record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update mentorship record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isAlumniAchievements) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      setLoading(true);
      try {
        await updateAchievementRecord(recordId, year, departmentId, payload);
        toast.success('Achievement record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update achievement record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isAlumniChapters) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      setLoading(true);
      try {
        await updateChapterRecord(recordId, year, departmentId, payload);
        toast.success('Chapter record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update chapter record');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isAlumniEvents) {
      const row = editFormData;
      const recordId = row._id;
      const payload = mapRowToApi(row, tabConfig.fields);
      if (payload.participantsCount !== undefined && payload.participantsCount !== '') {
        payload.participantsCount = Number(payload.participantsCount);
      }
      setLoading(true);
      try {
        await updateEventRecord(recordId, year, departmentId, payload);
        toast.success('Event record updated successfully');
        setShowEditDialog(false);
        setEditingRow(null);
        fetchData();
      } catch {
        toast.error('Failed to update event record');
      } finally {
        setLoading(false);
      }
      return;
    }

    const newData = [...tableData];
    newData[editingRow] = { ...editFormData };
    setTableData(newData);
    setShowEditDialog(false);
    setEditingRow(null);
  };

  const handleDeleteRow = async (index: number) => {
    if (isAlumniDetails) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteAlumniDetail(recordId, year, departmentId);
        toast.success('Record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isEmploymentCareer) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteEmploymentRecord(recordId, year, departmentId);
        toast.success('Employment record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete employment record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isHigherEducation) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteHigherEducationRecord(recordId, year, departmentId);
        toast.success('Higher education record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete higher education record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniEngagement) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteEngagementRecord(recordId, year, departmentId);
        toast.success('Engagement record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete engagement record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniContributions) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteContributionRecord(recordId, year, departmentId);
        toast.success('Contribution record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete contribution record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniMentorship) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteMentorshipRecord(recordId, year, departmentId);
        toast.success('Mentorship record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete mentorship record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniAchievements) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteAchievementRecord(recordId, year, departmentId);
        toast.success('Achievement record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete achievement record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniChapters) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteChapterRecord(recordId, year, departmentId);
        toast.success('Chapter record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete chapter record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniEvents) {
      const recordId = tableData[index]._id;
      if (!recordId) return;
      setLoading(true);
      try {
        await deleteEventRecord(recordId, year, departmentId);
        toast.success('Event record deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete event record');
      } finally {
        setLoading(false);
      }
      return;
    }
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
  };

  const handleCreateRow = async () => {
    if (isAlumniDetails) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      setLoading(true);
      try {
        await createAlumniDetail(year, departmentId, payload);
        toast.success('Record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isEmploymentCareer) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      if (payload.currentPackage !== undefined && payload.currentPackage !== '') {
        payload.currentPackage = Number(payload.currentPackage);
      }
      setLoading(true);
      try {
        await createEmploymentRecord(year, departmentId, payload);
        toast.success('Employment record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create employment record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isHigherEducation) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      setLoading(true);
      try {
        await createHigherEducationRecord(year, departmentId, payload);
        toast.success('Higher education record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create higher education record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniEngagement) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      if (payload.contributionHours !== undefined && payload.contributionHours !== '') {
        payload.contributionHours = Number(payload.contributionHours);
      }
      setLoading(true);
      try {
        await createEngagementRecord(year, departmentId, payload);
        toast.success('Engagement record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create engagement record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniContributions) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      if (payload.contributionValue !== undefined && payload.contributionValue !== '') {
        payload.contributionValue = Number(payload.contributionValue);
      }
      setLoading(true);
      try {
        await createContributionRecord(year, departmentId, payload);
        toast.success('Contribution record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create contribution record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniMentorship) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      if (payload.numberOfMentees !== undefined && payload.numberOfMentees !== '') {
        payload.numberOfMentees = Number(payload.numberOfMentees);
      }
      setLoading(true);
      try {
        await createMentorshipRecord(year, departmentId, payload);
        toast.success('Mentorship record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create mentorship record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniAchievements) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      setLoading(true);
      try {
        await createAchievementRecord(year, departmentId, payload);
        toast.success('Achievement record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create achievement record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniChapters) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      setLoading(true);
      try {
        await createChapterRecord(year, departmentId, payload);
        toast.success('Chapter record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create chapter record');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (isAlumniEvents) {
      const payload = mapRowToApi(createFormData, tabConfig.fields);
      if (payload.participantsCount !== undefined && payload.participantsCount !== '') {
        payload.participantsCount = Number(payload.participantsCount);
      }
      setLoading(true);
      try {
        await createEventRecord(year, departmentId, payload);
        toast.success('Event record created successfully');
        setShowCreateDialog(false);
        setCreateFormData({});
        fetchData();
      } catch {
        toast.error('Failed to create event record');
      } finally {
        setLoading(false);
      }
      return;
    }
    // Non-API tabs: add to local state
    setTableData(prev => [{ ...createFormData }, ...prev]);
    setShowCreateDialog(false);
    setCreateFormData({});
  };

  const handleCSVUploadComplete = useCallback(async (data: Record<string, string>[], evidenceFiles?: Record<string, File>) => {
    if (isAlumniDetails) {
      // The CSVUploadDialog gives us parsed rows — we create a CSV blob and upload via API
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'alumni_upload.csv', { type: 'text/csv' });
      try {
        await uploadAlumniDetailsCsv(departmentId, csvFile, { academicYear: year, replaceExisting: true });
        toast.success('CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload CSV');
      }
    } else if (isEmploymentCareer) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'employment_upload.csv', { type: 'text/csv' });
      try {
        await uploadEmploymentCsv(departmentId, csvFile, year);
        toast.success('Employment CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Employment CSV');
      }
    } else if (isHigherEducation) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'higher_education_upload.csv', { type: 'text/csv' });
      try {
        await uploadHigherEducationCsv(departmentId, csvFile, year);
        toast.success('Higher Education CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Higher Education CSV');
      }
    } else if (isAlumniEngagement) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'engagement_upload.csv', { type: 'text/csv' });
      try {
        await uploadEngagementCsv(departmentId, csvFile, year);
        toast.success('Engagement CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Engagement CSV');
      }
    } else if (isAlumniContributions) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'contributions_upload.csv', { type: 'text/csv' });
      try {
        await uploadContributionCsv(departmentId, csvFile, year);
        toast.success('Contribution CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Contribution CSV');
      }
    } else if (isAlumniMentorship) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'mentorship_upload.csv', { type: 'text/csv' });
      try {
        await uploadMentorshipCsv(departmentId, csvFile, year);
        toast.success('Mentorship CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Mentorship CSV');
      }
    } else if (isAlumniAchievements) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'achievements_upload.csv', { type: 'text/csv' });
      try {
        await uploadAchievementCsv(departmentId, csvFile, year);
        toast.success('Achievement CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Achievement CSV');
      }
    } else if (isAlumniChapters) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'chapters_upload.csv', { type: 'text/csv' });
      try {
        await uploadChapterCsv(departmentId, csvFile, year);
        toast.success('Chapter CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Chapter CSV');
      }
    } else if (isAlumniEvents) {
      const headers = tabConfig.fields.map(f => f.csvColumn);
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(h => {
          const val = row[h] || '';
          return val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], 'events_upload.csv', { type: 'text/csv' });
      try {
        await uploadEventCsv(departmentId, csvFile, year);
        toast.success('Event CSV uploaded successfully');
        fetchData();
      } catch {
        toast.error('Failed to upload Event CSV');
      }
    } else {
      setTableData(prev => [...prev, ...data]);
    }

    if (evidenceFiles && Object.keys(evidenceFiles).length > 0) {
      for (const [docType, file] of Object.entries(evidenceFiles)) {
        try {
          await uploadEvidenceDocument({
            departmentId,
            uploadedBy: user?.id || 1,
            file,
            academicYear: year,
            sectionName,
            recordId: 1,
            documentType: docType,
          });
        } catch {
          // ignore evidence upload error
        }
      }
      fetchEvidence();
    }
    setShowUploadDialog(false);
  }, [isAlumniDetails, isEmploymentCareer, isHigherEducation, isAlumniEngagement, isAlumniContributions, isAlumniMentorship, isAlumniAchievements, isAlumniChapters, isAlumniEvents, departmentId, year, tabConfig.fields, fetchData, fetchEvidence, sectionName, user?.id]);

  const filteredData = tableData.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val =>
      val.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getFieldInput = (field: { key: string; label: string; type: string; csvColumn: string; masterDataSource?: string; selectOptions?: string[]; autoPopulate?: boolean }, isCreate = false) => {
    const formData = isCreate ? createFormData : editFormData;
    const setFormData = isCreate ? setCreateFormData : setEditFormData;
    const value = formData[field.csvColumn] || '';

    if (field.masterDataSource) {
      const options = masterData[field.masterDataSource as keyof typeof masterData] as string[];
      return (
        <Select value={value} onValueChange={(v) => setFormData(prev => ({ ...prev, [field.csvColumn]: v }))}>
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
        <Select value={value} onValueChange={(v) => setFormData(prev => ({ ...prev, [field.csvColumn]: v }))}>
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
        <Select value={value} onValueChange={(v) => setFormData(prev => ({ ...prev, [field.csvColumn]: v }))}>
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
        onChange={(e) => setFormData(prev => ({ ...prev, [field.csvColumn]: e.target.value }))}
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
            {(tabConfig.templateFile || isApiDriven) && (
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> {isApiDriven ? 'Export CSV' : 'Download Template'}
              </Button>
            )}
            {tabConfig.fields.length > 0 && (
              <Button size="sm" className="text-xs h-8" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
              </Button>
            )}
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => { setCreateFormData({}); setShowCreateDialog(true); }}>
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

      {/* Evidence Repository */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Evidence Repository</CardTitle>
              <CardDescription className="text-xs">Supporting documents for {tabConfig.label}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowUploadEvidenceDialog(true)}>
                <Upload className="h-3 w-3 mr-1" /> Upload Document
              </Button>
              <Badge variant="secondary" className="text-[10px]">{evidenceList.length} documents</Badge>
            </div>
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
                  <TableHead className="text-[10px]">Document Name</TableHead>
                  <TableHead className="text-[10px]">Document Type</TableHead>
                  <TableHead className="text-[10px]">Record ID</TableHead>
                  <TableHead className="text-[10px]">Uploaded By</TableHead>
                  <TableHead className="text-[10px]">Date</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidenceList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground text-xs">
                      No evidence documents uploaded yet for this section. Click "Upload Document" to add supporting evidence.
                    </TableCell>
                  </TableRow>
                ) : (
                  evidenceList.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[180px]">{doc.documentName || doc.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px]">{doc.documentType || 'General'}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">#{doc.recordId || '-'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedBy || 'Admin'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedAt ? doc.uploadedAt.split('T')[0] : doc.createdAt ? doc.createdAt.split('T')[0] : '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-[9px]',
                          doc.verificationStatus === 'VERIFIED' && 'bg-emerald-500/10 text-emerald-600',
                          doc.verificationStatus === 'PENDING' && 'bg-amber-500/10 text-amber-600',
                          doc.verificationStatus === 'REJECTED' && 'bg-red-500/10 text-red-600'
                        )}>
                          {doc.verificationStatus || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Preview Document" onClick={() => { setPreviewDoc(doc); setShowPreviewDialog(true); }}>
                            <Eye className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Delete Document" onClick={() => handleDeleteEvidence(doc.id)}>
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add New Record</DialogTitle>
            <DialogDescription className="text-xs">
              Enter details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            {tabConfig.fields.map(field => (
              <div key={field.key} className="grid gap-1.5">
                <Label className="text-xs font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                {getFieldInput(field, true)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleCreateRow} disabled={loading}>
              {loading ? 'Saving...' : 'Save Record'}
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

      {/* Upload Evidence Dialog */}
      <Dialog open={showUploadEvidenceDialog} onOpenChange={setShowUploadEvidenceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Upload Evidence Document</DialogTitle>
            <DialogDescription className="text-xs">
              Upload a supporting document for {tabConfig.label}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Associated Record *</Label>
              <Select value={uploadEvidenceRecordId} onValueChange={setUploadEvidenceRecordId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select associated record" />
                </SelectTrigger>
                <SelectContent>
                  {tableData.map((row, idx) => {
                    const recId = row._id || String(idx + 1);
                    const labelStr = row['Alumni ID'] || row['Event Name'] || row['Chapter Name'] || row['Company Name'] || row['Institution Name'] || `Record #${recId}`;
                    return (
                      <SelectItem key={idx} value={String(recId)} className="text-xs">
                        #{recId} - {labelStr}
                      </SelectItem>
                    );
                  })}
                  {tableData.length === 0 && (
                    <SelectItem value="1" className="text-xs">General / Section Record (#1)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Document Type</Label>
              <Select value={uploadEvidenceDocType} onValueChange={setUploadEvidenceDocType}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {tabConfig.requiredEvidence.map(type => (
                    <SelectItem key={type} value={type} className="text-xs">{type}</SelectItem>
                  ))}
                  <SelectItem value="General Evidence" className="text-xs">General Evidence</SelectItem>
                  <SelectItem value="Other Document" className="text-xs">Other Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Select File *</Label>
              <Input
                type="file"
                className="h-9 text-xs cursor-pointer"
                onChange={(e) => setUploadEvidenceFile(e.target.files?.[0] || null)}
              />
              {uploadEvidenceFile && (
                <p className="text-[10px] text-muted-foreground">
                  Selected: {uploadEvidenceFile.name} ({(uploadEvidenceFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowUploadEvidenceDialog(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleUploadEvidence} disabled={evidenceUploading}>
              {evidenceUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Document Preview Modal */}
      <EvidencePreviewModal
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        document={previewDoc}
        sectionName={sectionName}
      />
    </motion.div>
  );
};