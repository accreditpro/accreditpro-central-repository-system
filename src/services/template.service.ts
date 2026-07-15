import {
  Template,
  TemplateCategory,
  TemplateStatus,
  TEMPLATE_CATEGORIES,
} from '@/types/template.types';

const MOCK_TEMPLATES: Template[] = [
  // Academic
  { id: 't1', name: 'Course Curriculum Template', category: 'Academic', version: '3.2', uploadedBy: 'Dr. Ramesh Kumar', uploadedDate: '2025-12-10', status: 'active', fileType: 'xlsx', fileSize: '245 KB', description: 'Standard template for course curriculum documentation', downloads: 156, versionHistory: [{ version: '3.2', uploadedBy: 'Dr. Ramesh Kumar', uploadedDate: '2025-12-10', fileSize: '245 KB', fileType: 'xlsx', notes: 'Updated with new NBA criteria' }, { version: '3.1', uploadedBy: 'Dr. Ramesh Kumar', uploadedDate: '2025-09-15', fileSize: '230 KB', fileType: 'xlsx', notes: 'Minor formatting fixes' }, { version: '3.0', uploadedBy: 'Admin', uploadedDate: '2025-06-01', fileSize: '220 KB', fileType: 'xlsx', notes: 'Major revision for 2025-26' }] },
  { id: 't2', name: 'Syllabus Mapping Sheet', category: 'Academic', version: '2.1', uploadedBy: 'Prof. Anita Sharma', uploadedDate: '2025-11-20', status: 'active', fileType: 'xlsx', fileSize: '180 KB', description: 'CO-PO mapping template for syllabus', downloads: 89, versionHistory: [{ version: '2.1', uploadedBy: 'Prof. Anita Sharma', uploadedDate: '2025-11-20', fileSize: '180 KB', fileType: 'xlsx', notes: 'Added bloom taxonomy levels' }, { version: '2.0', uploadedBy: 'Admin', uploadedDate: '2025-07-10', fileSize: '165 KB', fileType: 'xlsx', notes: 'Initial release' }] },
  { id: 't3', name: 'Academic Calendar Template', category: 'Academic', version: '1.5', uploadedBy: 'Admin', uploadedDate: '2025-10-05', status: 'active', fileType: 'csv', fileSize: '45 KB', description: 'Annual academic calendar planning template', downloads: 210, versionHistory: [{ version: '1.5', uploadedBy: 'Admin', uploadedDate: '2025-10-05', fileSize: '45 KB', fileType: 'csv', notes: 'Added holiday list' }] },
  { id: 't4', name: 'Exam Schedule Template', category: 'Academic', version: '1.0', uploadedBy: 'Dr. Suresh Patel', uploadedDate: '2025-08-15', status: 'inactive', fileType: 'xlsx', fileSize: '120 KB', description: 'Template for semester exam scheduling', downloads: 45, versionHistory: [{ version: '1.0', uploadedBy: 'Dr. Suresh Patel', uploadedDate: '2025-08-15', fileSize: '120 KB', fileType: 'xlsx', notes: 'Initial version' }] },
  // Faculty
  { id: 't5', name: 'Faculty Profile Template', category: 'Faculty', version: '2.3', uploadedBy: 'HR Admin', uploadedDate: '2025-11-01', status: 'active', fileType: 'xlsx', fileSize: '310 KB', description: 'Comprehensive faculty profile data template', downloads: 178, versionHistory: [{ version: '2.3', uploadedBy: 'HR Admin', uploadedDate: '2025-11-01', fileSize: '310 KB', fileType: 'xlsx', notes: 'Added research metrics' }, { version: '2.2', uploadedBy: 'HR Admin', uploadedDate: '2025-08-20', fileSize: '290 KB', fileType: 'xlsx', notes: 'Updated fields' }] },
  { id: 't6', name: 'Faculty Workload Sheet', category: 'Faculty', version: '1.8', uploadedBy: 'Dr. Meena Iyer', uploadedDate: '2025-10-15', status: 'active', fileType: 'csv', fileSize: '78 KB', description: 'Weekly workload distribution template', downloads: 134, versionHistory: [{ version: '1.8', uploadedBy: 'Dr. Meena Iyer', uploadedDate: '2025-10-15', fileSize: '78 KB', fileType: 'csv', notes: 'Added lab hours' }] },
  { id: 't7', name: 'Faculty Leave Record', category: 'Faculty', version: '1.2', uploadedBy: 'Admin', uploadedDate: '2025-09-10', status: 'active', fileType: 'xlsx', fileSize: '95 KB', description: 'Annual leave tracking template', downloads: 67, versionHistory: [{ version: '1.2', uploadedBy: 'Admin', uploadedDate: '2025-09-10', fileSize: '95 KB', fileType: 'xlsx', notes: 'Added CL/EL categories' }] },
  // Student
  { id: 't8', name: 'Student Enrollment Data', category: 'Student', version: '4.0', uploadedBy: 'Registrar', uploadedDate: '2025-12-01', status: 'active', fileType: 'xlsx', fileSize: '420 KB', description: 'Student admission and enrollment data template', downloads: 245, versionHistory: [{ version: '4.0', uploadedBy: 'Registrar', uploadedDate: '2025-12-01', fileSize: '420 KB', fileType: 'xlsx', notes: 'Major revision for NAAC' }, { version: '3.5', uploadedBy: 'Registrar', uploadedDate: '2025-06-15', fileSize: '380 KB', fileType: 'xlsx', notes: 'Added diversity metrics' }] },
  { id: 't9', name: 'Student Performance Report', category: 'Student', version: '2.0', uploadedBy: 'Exam Cell', uploadedDate: '2025-11-15', status: 'active', fileType: 'csv', fileSize: '56 KB', description: 'Semester-wise student performance template', downloads: 189, versionHistory: [{ version: '2.0', uploadedBy: 'Exam Cell', uploadedDate: '2025-11-15', fileSize: '56 KB', fileType: 'csv', notes: 'Added CGPA calculation' }] },
  { id: 't10', name: 'Student Feedback Form', category: 'Student', version: '1.3', uploadedBy: 'IQAC', uploadedDate: '2025-10-20', status: 'active', fileType: 'xlsx', fileSize: '88 KB', description: 'Course feedback collection template', downloads: 312, versionHistory: [{ version: '1.3', uploadedBy: 'IQAC', uploadedDate: '2025-10-20', fileSize: '88 KB', fileType: 'xlsx', notes: 'Added Likert scale' }] },
  // Research
  { id: 't11', name: 'Research Publication Record', category: 'Research', version: '2.5', uploadedBy: 'R&D Cell', uploadedDate: '2025-11-25', status: 'active', fileType: 'xlsx', fileSize: '195 KB', description: 'Faculty research publication tracking', downloads: 98, versionHistory: [{ version: '2.5', uploadedBy: 'R&D Cell', uploadedDate: '2025-11-25', fileSize: '195 KB', fileType: 'xlsx', notes: 'Added Scopus/WoS fields' }] },
  { id: 't12', name: 'Patent Filing Template', category: 'Research', version: '1.1', uploadedBy: 'IPR Cell', uploadedDate: '2025-09-30', status: 'active', fileType: 'csv', fileSize: '34 KB', description: 'Patent application tracking template', downloads: 23, versionHistory: [{ version: '1.1', uploadedBy: 'IPR Cell', uploadedDate: '2025-09-30', fileSize: '34 KB', fileType: 'csv', notes: 'Added status tracking' }] },
  // Infrastructure
  { id: 't13', name: 'Lab Equipment Inventory', category: 'Infrastructure', version: '3.0', uploadedBy: 'Lab Admin', uploadedDate: '2025-12-05', status: 'active', fileType: 'xlsx', fileSize: '560 KB', description: 'Laboratory equipment and asset tracking', downloads: 76, versionHistory: [{ version: '3.0', uploadedBy: 'Lab Admin', uploadedDate: '2025-12-05', fileSize: '560 KB', fileType: 'xlsx', notes: 'Added AMC details' }] },
  { id: 't14', name: 'Classroom Utilization Report', category: 'Infrastructure', version: '1.4', uploadedBy: 'Admin', uploadedDate: '2025-10-10', status: 'inactive', fileType: 'csv', fileSize: '42 KB', description: 'Room and facility usage tracking', downloads: 54, versionHistory: [{ version: '1.4', uploadedBy: 'Admin', uploadedDate: '2025-10-10', fileSize: '42 KB', fileType: 'csv', notes: 'Updated room categories' }] },
  // Finance
  { id: 't15', name: 'Budget Allocation Sheet', category: 'Finance', version: '2.8', uploadedBy: 'Finance Officer', uploadedDate: '2025-11-30', status: 'active', fileType: 'xlsx', fileSize: '380 KB', description: 'Department-wise budget allocation template', downloads: 45, versionHistory: [{ version: '2.8', uploadedBy: 'Finance Officer', uploadedDate: '2025-11-30', fileSize: '380 KB', fileType: 'xlsx', notes: 'Added capital expenditure' }] },
  { id: 't16', name: 'Fee Collection Report', category: 'Finance', version: '1.6', uploadedBy: 'Accounts', uploadedDate: '2025-10-25', status: 'active', fileType: 'csv', fileSize: '67 KB', description: 'Student fee collection tracking', downloads: 112, versionHistory: [{ version: '1.6', uploadedBy: 'Accounts', uploadedDate: '2025-10-25', fileSize: '67 KB', fileType: 'csv', notes: 'Added scholarship details' }] },
  // Placement
  { id: 't17', name: 'Placement Statistics', category: 'Placement', version: '3.1', uploadedBy: 'TPO', uploadedDate: '2025-12-08', status: 'active', fileType: 'xlsx', fileSize: '275 KB', description: 'Annual placement data and statistics', downloads: 167, versionHistory: [{ version: '3.1', uploadedBy: 'TPO', uploadedDate: '2025-12-08', fileSize: '275 KB', fileType: 'xlsx', notes: 'Added higher studies data' }] },
  { id: 't18', name: 'Company Visit Record', category: 'Placement', version: '1.0', uploadedBy: 'TPO', uploadedDate: '2025-09-20', status: 'active', fileType: 'csv', fileSize: '38 KB', description: 'Recruiter visit and offer tracking', downloads: 89, versionHistory: [{ version: '1.0', uploadedBy: 'TPO', uploadedDate: '2025-09-20', fileSize: '38 KB', fileType: 'csv', notes: 'Initial version' }] },
  // Compliance
  { id: 't19', name: 'NAAC SSR Data Template', category: 'Compliance', version: '5.0', uploadedBy: 'IQAC', uploadedDate: '2025-12-12', status: 'active', fileType: 'xlsx', fileSize: '890 KB', description: 'Self Study Report data collection template', downloads: 234, versionHistory: [{ version: '5.0', uploadedBy: 'IQAC', uploadedDate: '2025-12-12', fileSize: '890 KB', fileType: 'xlsx', notes: 'Updated for NAAC 2025 framework' }, { version: '4.5', uploadedBy: 'IQAC', uploadedDate: '2025-06-01', fileSize: '820 KB', fileType: 'xlsx', notes: 'Added criterion 7 metrics' }] },
  { id: 't20', name: 'NBA SAR Template', category: 'Compliance', version: '2.2', uploadedBy: 'NBA Coordinator', uploadedDate: '2025-11-10', status: 'active', fileType: 'xlsx', fileSize: '650 KB', description: 'Self Assessment Report for NBA accreditation', downloads: 156, versionHistory: [{ version: '2.2', uploadedBy: 'NBA Coordinator', uploadedDate: '2025-11-10', fileSize: '650 KB', fileType: 'xlsx', notes: 'Updated OBE metrics' }] },
  // Alumni
  { id: 't21', name: 'Alumni Database Template', category: 'Alumni', version: '2.0', uploadedBy: 'Alumni Cell', uploadedDate: '2025-10-30', status: 'active', fileType: 'xlsx', fileSize: '210 KB', description: 'Alumni contact and career tracking', downloads: 78, versionHistory: [{ version: '2.0', uploadedBy: 'Alumni Cell', uploadedDate: '2025-10-30', fileSize: '210 KB', fileType: 'xlsx', notes: 'Added LinkedIn fields' }] },
  { id: 't22', name: 'Alumni Contribution Record', category: 'Alumni', version: '1.0', uploadedBy: 'Alumni Cell', uploadedDate: '2025-08-05', status: 'draft', fileType: 'csv', fileSize: '28 KB', description: 'Track alumni contributions and mentoring', downloads: 12, versionHistory: [{ version: '1.0', uploadedBy: 'Alumni Cell', uploadedDate: '2025-08-05', fileSize: '28 KB', fileType: 'csv', notes: 'Draft version' }] },
  // Extension
  { id: 't23', name: 'Extension Activity Report', category: 'Extension', version: '1.5', uploadedBy: 'NSS Coordinator', uploadedDate: '2025-11-05', status: 'active', fileType: 'xlsx', fileSize: '145 KB', description: 'Community outreach and extension activities', downloads: 56, versionHistory: [{ version: '1.5', uploadedBy: 'NSS Coordinator', uploadedDate: '2025-11-05', fileSize: '145 KB', fileType: 'xlsx', notes: 'Added impact metrics' }] },
  { id: 't24', name: 'MoU Tracking Sheet', category: 'Extension', version: '1.2', uploadedBy: 'Admin', uploadedDate: '2025-09-25', status: 'active', fileType: 'csv', fileSize: '32 KB', description: 'Industry and institutional MoU tracking', downloads: 43, versionHistory: [{ version: '1.2', uploadedBy: 'Admin', uploadedDate: '2025-09-25', fileSize: '32 KB', fileType: 'csv', notes: 'Added renewal dates' }] },
  // Governance
  { id: 't25', name: 'Committee Meeting Minutes', category: 'Governance', version: '1.8', uploadedBy: 'Secretary', uploadedDate: '2025-12-02', status: 'active', fileType: 'xlsx', fileSize: '105 KB', description: 'Template for recording meeting proceedings', downloads: 134, versionHistory: [{ version: '1.8', uploadedBy: 'Secretary', uploadedDate: '2025-12-02', fileSize: '105 KB', fileType: 'xlsx', notes: 'Added action items tracker' }] },
  { id: 't26', name: 'Strategic Plan Template', category: 'Governance', version: '2.0', uploadedBy: 'Director', uploadedDate: '2025-07-15', status: 'active', fileType: 'xlsx', fileSize: '320 KB', description: 'Institutional strategic planning document', downloads: 67, versionHistory: [{ version: '2.0', uploadedBy: 'Director', uploadedDate: '2025-07-15', fileSize: '320 KB', fileType: 'xlsx', notes: 'Five-year plan template' }] },
];

class TemplateService {
  private templates = [...MOCK_TEMPLATES];

  async getTemplates(category?: TemplateCategory): Promise<Template[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (category) {
      return this.templates.filter((t) => t.category === category);
    }
    return this.templates;
  }

  async uploadTemplate(
    file: File,
    category: TemplateCategory,
    name: string,
    description: string
  ): Promise<Template> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';
    const newTemplate: Template = {
      id: `t${Date.now()}`,
      name,
      category,
      version: '1.0',
      uploadedBy: 'Current User',
      uploadedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      fileType: fileType as 'csv' | 'xlsx',
      fileSize: `${Math.round(file.size / 1024)} KB`,
      description,
      downloads: 0,
      versionHistory: [
        {
          version: '1.0',
          uploadedBy: 'Current User',
          uploadedDate: new Date().toISOString().split('T')[0],
          fileSize: `${Math.round(file.size / 1024)} KB`,
          fileType: fileType as 'csv' | 'xlsx',
          notes: 'Initial upload',
        },
      ],
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  async replaceTemplate(id: string, file: File, notes: string): Promise<Template> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const template = this.templates.find((t) => t.id === id);
    if (!template) throw new Error('Template not found');

    const currentVersion = parseFloat(template.version);
    const newVersion = (currentVersion + 0.1).toFixed(1);
    const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';

    template.version = newVersion;
    template.uploadedDate = new Date().toISOString().split('T')[0];
    template.uploadedBy = 'Current User';
    template.fileSize = `${Math.round(file.size / 1024)} KB`;
    template.fileType = fileType as 'csv' | 'xlsx';
    template.versionHistory.unshift({
      version: newVersion,
      uploadedBy: 'Current User',
      uploadedDate: new Date().toISOString().split('T')[0],
      fileSize: `${Math.round(file.size / 1024)} KB`,
      fileType: fileType as 'csv' | 'xlsx',
      notes,
    });

    return template;
  }

  async deactivateTemplate(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const template = this.templates.find((t) => t.id === id);
    if (template) {
      template.status = template.status === 'active' ? 'inactive' : 'active';
    }
  }

  async downloadTemplate(_id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock download - in real app would trigger file download
  }

  getCategories(): TemplateCategory[] {
    return TEMPLATE_CATEGORIES;
  }
}

export const templateService = new TemplateService();