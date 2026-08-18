import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type {
  PrincipalDashboardDto,
  DepartmentRepositoryDto,
  PrincipalAccreditationDto,
  PrincipalGapDto,
  DeptFacultyDto,
  DeptStudentDto,
  DeptResearchDto,
  DeptInfraDto,
  AnalyticsSeriesDto,
} from '@/services/principal.service';

export interface ReportData {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

/**
 * Real-data context for report generation. Every exporter reads from these
 * backend-provided aggregates (fetched by ExecutiveReports) instead of
 * hardcoded mock arrays.
 */
export interface ReportContext {
  dashboard?: PrincipalDashboardDto;
  departments?: DepartmentRepositoryDto[];
  accreditation?: PrincipalAccreditationDto;
  gaps?: PrincipalGapDto[];
  faculty?: DeptFacultyDto[];
  students?: DeptStudentDto[];
  research?: DeptResearchDto[];
  infrastructure?: DeptInfraDto[];
  analytics?: AnalyticsSeriesDto[];
}

const deptOverall = (
  ctx: ReportContext,
  code: string,
  framework: 'nba' | 'naac' | 'nirf'
): number => {
  const rows = ctx.accreditation?.[framework]?.departments ?? [];
  return rows.find(x => x.dept === code)?.overall ?? 0;
};

export function buildReportData(id: string, ctx: ReportContext = {}): ReportData {
  switch (id) {
    case 'institution': {
      const kpi = ctx.dashboard?.kpi;
      const stats = ctx.dashboard?.institutionStats;
      return {
        title: 'Institution Summary',
        columns: ['Metric', 'Value'],
        rows: [
          ['Repository Readiness', kpi ? `${kpi.repositoryCompletion}%` : '—'],
          ['NAAC Readiness', kpi ? `${kpi.naacReadiness}%` : '—'],
          ['NBA Readiness', kpi ? `${kpi.nbaReadiness}%` : '—'],
          ['NIRF Readiness', kpi ? `${kpi.nirfReadiness}%` : '—'],
          ['Evidence Completion', kpi ? `${kpi.evidenceCompletion}%` : '—'],
          ['Departments', stats?.departments ?? '—'],
          ['Programs', stats?.programs ?? '—'],
          ['Faculty', stats?.faculty ?? '—'],
          ['Students', stats?.students ?? '—'],
          ['Pending Approvals', kpi?.pendingApprovals ?? '—'],
        ],
      };
    }
    case 'department':
      return {
        title: 'Department Summary',
        columns: ['Department', 'Repository Readiness', 'NBA', 'NAAC', 'NIRF'],
        rows: (ctx.departments ?? []).map(d => [
          d.code,
          `${d.readiness}%`,
          `${deptOverall(ctx, d.code, 'nba')}%`,
          `${deptOverall(ctx, d.code, 'naac')}%`,
          `${deptOverall(ctx, d.code, 'nirf')}%`,
        ]),
      };
    case 'academic-year':
      return {
        title: 'Academic Year Summary',
        columns: [
          'Year',
          'Repository Completion',
          'Accreditation Readiness',
          'Evidence',
          'Placements',
        ],
        rows: (ctx.analytics ?? []).map(s => [
          s.year,
          `${s.repositoryCompletion}%`,
          `${s.accreditationReadiness}%`,
          `${s.evidenceCompletion}%`,
          `${s.placements}%`,
        ]),
      };
    case 'repository':
      return {
        title: 'Repository Summary',
        columns: ['Department', 'Repository', 'Completion', 'Approved', 'Pending', 'Missing'],
        rows: (ctx.departments ?? []).flatMap(d =>
          d.repositories.map(r => [
            d.code,
            r.repo,
            `${r.completion}%`,
            `${r.approved}%`,
            `${r.pending}%`,
            `${r.missing}%`,
          ])
        ),
      };
    case 'accreditation':
      return {
        title: 'Accreditation Readiness Report',
        columns: ['Department', 'NBA', 'NAAC', 'NIRF'],
        rows: (ctx.departments ?? []).map(d => [
          d.code,
          `${deptOverall(ctx, d.code, 'nba')}%`,
          `${deptOverall(ctx, d.code, 'naac')}%`,
          `${deptOverall(ctx, d.code, 'nirf')}%`,
        ]),
      };
    case 'gaps':
      return {
        title: 'Gap Analysis Report',
        columns: ['Department', 'Repository', 'Framework', 'Current', 'Target', 'Gap', 'Priority'],
        rows: (ctx.gaps ?? []).map(g => [
          g.department,
          g.repository,
          g.framework,
          `${g.current}%`,
          `${g.target}%`,
          g.target - g.current,
          g.priority,
        ]),
      };
    case 'faculty':
      return {
        title: 'Faculty Summary',
        columns: [
          'Department',
          'Strength',
          'PhD %',
          'FDP %',
          'Publications',
          'Patents',
          'Funding (₹L)',
        ],
        rows: (ctx.faculty ?? []).map(d => [
          d.dept,
          d.strength,
          `${d.phdPercentage}%`,
          `${d.fdpParticipation}%`,
          d.publications,
          d.patents,
          d.researchFunding,
        ]),
      };
    case 'student':
      return {
        title: 'Student Summary',
        columns: [
          'Department',
          'Strength',
          'Pass %',
          'Placements %',
          'Higher Studies %',
          'Internships',
          'Awards',
          'Certifications',
        ],
        rows: (ctx.students ?? []).map(d => [
          d.dept,
          d.strength,
          `${d.passPercentage}%`,
          `${d.placements}%`,
          `${d.higherStudies}%`,
          d.internships,
          d.awards,
          d.certifications,
        ]),
      };
    case 'research':
      return {
        title: 'Research Summary',
        columns: [
          'Department',
          'Publications',
          'Patents',
          'Books',
          'Sponsored',
          'Consultancy (₹L)',
          'Funding (₹L)',
        ],
        rows: (ctx.research ?? []).map(d => [
          d.dept,
          d.publications,
          d.patents,
          d.books,
          d.sponsoredProjects,
          d.consultancy,
          d.researchFunding,
        ]),
      };
    case 'infrastructure':
      return {
        title: 'Infrastructure Summary',
        columns: [
          'Department',
          'Labs %',
          'Equipment %',
          'Licenses %',
          'ICT %',
          'Smart Classrooms %',
          'Evidence %',
          'Alerts',
        ],
        rows: (ctx.infrastructure ?? []).map(d => [
          d.dept,
          d.laboratories,
          d.equipment,
          d.softwareLicenses,
          d.ictFacilities,
          d.smartClassrooms,
          d.evidenceCompletion,
          d.alerts.length,
        ]),
      };
    default:
      return { title: 'Report', columns: ['Item'], rows: [['—']] };
  }
}

export function exportReportToExcel(id: string, ctx: ReportContext = {}) {
  const data = buildReportData(id, ctx);
  const sheet = XLSX.utils.json_to_sheet(
    data.rows.map(row => Object.fromEntries(data.columns.map((c, i) => [c, row[i]])))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, data.title.slice(0, 31));
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${id}-report-${new Date().toISOString().split('T')[0]}.xlsx`
  );
}

export function exportReportToPDF(id: string, ctx: ReportContext = {}) {
  const data = buildReportData(id, ctx);
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
    body: data.rows.map(row => row.map(String)),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 },
  });
  doc.save(`${id}-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
