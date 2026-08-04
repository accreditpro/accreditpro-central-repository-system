import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  kpiData,
  institutionStats,
  departmentRepositories,
  deptAcademic,
  deptFaculty,
  deptStudent,
  deptResearch,
  deptInfra,
  principalGaps,
  nbaDeptScores,
  naacDeptScores,
  nirfDeptScores,
} from '../principal-data';

export interface ReportData {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export const REPORT_TYPES = [
  { id: 'institution', name: 'Institution Summary', description: 'Institution-level KPIs and readiness overview' },
  { id: 'department', name: 'Department Summary', description: 'Department-wise readiness and accreditation scores' },
  { id: 'academic-year', name: 'Academic Year Summary', description: 'Year-wise repository and accreditation trends' },
  { id: 'repository', name: 'Repository Summary', description: 'Repository completion matrix across departments' },
  { id: 'accreditation', name: 'Accreditation Readiness Report', description: 'NBA / NAAC / NIRF criterion readiness' },
  { id: 'gaps', name: 'Gap Analysis Report', description: 'Current vs target readiness gaps with owners' },
  { id: 'faculty', name: 'Faculty Summary', description: 'Faculty strength, qualifications and research' },
  { id: 'student', name: 'Student Summary', description: 'Student performance and progression metrics' },
  { id: 'research', name: 'Research Summary', description: 'Publications, patents, projects and funding' },
  { id: 'infrastructure', name: 'Infrastructure Summary', description: 'Facilities readiness and compliance alerts' },
];

export function buildReportData(id: string): ReportData {
  switch (id) {
    case 'institution':
      return {
        title: 'Institution Summary',
        columns: ['Metric', 'Value'],
        rows: [
          ['Repository Readiness', `${kpiData.repositoryCompletion}%`],
          ['NAAC Readiness', `${kpiData.naacReadiness}%`],
          ['NBA Readiness', `${kpiData.nbaReadiness}%`],
          ['NIRF Readiness', `${kpiData.nirfReadiness}%`],
          ['Evidence Completion', `${kpiData.evidenceCompletion}%`],
          ['Departments', institutionStats.departments],
          ['Programs', institutionStats.programs],
          ['Faculty', institutionStats.faculty],
          ['Students', institutionStats.students],
          ['Pending Approvals', kpiData.pendingApprovals],
        ],
      };
    case 'department':
      return {
        title: 'Department Summary',
        columns: ['Department', 'Repository Readiness', 'NBA', 'NAAC', 'NIRF'],
        rows: departmentRepositories.map((d) => [
          d.code,
          `${d.readiness}%`,
          `${nbaDeptScores.find((x) => x.dept === d.code)?.overall ?? 0}%`,
          `${naacDeptScores.find((x) => x.dept === d.code)?.overall ?? 0}%`,
          `${nirfDeptScores.find((x) => x.dept === d.code)?.overall ?? 0}%`,
        ]),
      };
    case 'academic-year':
      return {
        title: 'Academic Year Summary',
        columns: ['Year', 'Repository Completion', 'Accreditation Readiness', 'Evidence', 'Placements'],
        rows: [2021, 2022, 2023, 2024, 2025].map((y, i) => [
          `${y - 1}-${String(y).slice(2)}`,
          `${72 + i * 3}%`,
          `${68 + i * 3}%`,
          `${65 + i * 2}%`,
          `${72 + i * 2}%`,
        ]),
      };
    case 'repository':
      return {
        title: 'Repository Summary',
        columns: ['Department', 'Repository', 'Completion', 'Approved', 'Pending', 'Missing'],
        rows: departmentRepositories.flatMap((d) =>
          d.repositories.map((r) => [d.code, r.repo, `${r.completion}%`, `${r.approved}%`, `${r.pending}%`, `${r.missing}%`])
        ),
      };
    case 'accreditation':
      return {
        title: 'Accreditation Readiness Report',
        columns: ['Department', 'NBA', 'NAAC', 'NIRF'],
        rows: departmentRepositories.map((d) => [
          d.code,
          `${nbaDeptScores.find((x) => x.dept === d.code)?.overall ?? 0}%`,
          `${naacDeptScores.find((x) => x.dept === d.code)?.overall ?? 0}%`,
          `${nirfDeptScores.find((x) => x.dept === d.code)?.overall ?? 0}%`,
        ]),
      };
    case 'gaps':
      return {
        title: 'Gap Analysis Report',
        columns: ['Department', 'Repository', 'Framework', 'Current', 'Target', 'Gap', 'Priority'],
        rows: principalGaps.map((g) => [g.department, g.repository, g.framework, `${g.current}%`, `${g.target}%`, g.target - g.current, g.priority]),
      };
    case 'faculty':
      return {
        title: 'Faculty Summary',
        columns: ['Department', 'Strength', 'PhD %', 'FDP %', 'Publications', 'Patents', 'Funding (₹L)'],
        rows: deptFaculty.map((d) => [d.dept, d.strength, `${d.phdPercentage}%`, `${d.fdpParticipation}%`, d.publications, d.patents, d.researchFunding]),
      };
    case 'student':
      return {
        title: 'Student Summary',
        columns: ['Department', 'Strength', 'Pass %', 'Placements %', 'Higher Studies %', 'Internships', 'Awards', 'Certifications'],
        rows: deptStudent.map((d) => [d.dept, d.strength, `${d.passPercentage}%`, `${d.placements}%`, `${d.higherStudies}%`, d.internships, d.awards, d.certifications]),
      };
    case 'research':
      return {
        title: 'Research Summary',
        columns: ['Department', 'Publications', 'Patents', 'Books', 'Sponsored', 'Consultancy (₹L)', 'Funding (₹L)'],
        rows: deptResearch.map((d) => [d.dept, d.publications, d.patents, d.books, d.sponsoredProjects, d.consultancy, d.researchFunding]),
      };
    case 'infrastructure':
      return {
        title: 'Infrastructure Summary',
        columns: ['Department', 'Labs %', 'Equipment %', 'Licenses %', 'ICT %', 'Smart Classrooms %', 'Evidence %', 'Alerts'],
        rows: deptInfra.map((d) => [d.dept, d.laboratories, d.equipment, d.softwareLicenses, d.ictFacilities, d.smartClassrooms, d.evidenceCompletion, d.alerts.length]),
      };
    default:
      return { title: 'Report', columns: ['Item'], rows: [['—']] };
  }
}

export function exportReportToExcel(id: string) {
  const data = buildReportData(id);
  const sheet = XLSX.utils.json_to_sheet(
    data.rows.map((row) => Object.fromEntries(data.columns.map((c, i) => [c, row[i]])))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, data.title.slice(0, 31));
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${id}-report-${new Date().toISOString().split('T')[0]}.xlsx`
  );
}

export function exportReportToPDF(id: string) {
  const data = buildReportData(id);
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(99, 102, 241);
  doc.text(`AccreditPro — ${data.title}`, 14, 20);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated on ${new Date().toLocaleDateString()} • Principal Executive Module`, 14, 27);
  autoTable(doc, {
    startY: 34,
    head: [data.columns],
    body: data.rows.map((row) => row.map(String)),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 },
  });
  doc.save(`${id}-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
