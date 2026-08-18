import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { ImprovementInitiative, QualityObservation } from '../types';
import type {
  AccreditationDto,
  DashboardKpisDto,
  DepartmentReadinessRowDto,
  GapAnalysisDto,
  InstitutionReadinessDto,
  RepositoryMonitoringDto,
} from '@/services/iqac.service';

export interface ReportData {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ReportContext {
  kpis: DashboardKpisDto;
  departmentReadiness: DepartmentReadinessRowDto[];
  institutionRepositories: InstitutionReadinessDto['repositories'];
  repositoryMonitoring: RepositoryMonitoringDto[];
  gaps: GapAnalysisDto;
  accreditation: AccreditationDto;
}

export const IQAC_REPORT_TYPES = [
  { id: 'institution', name: 'Institution Readiness Report', description: 'Institution-level KPIs and readiness overview' },
  { id: 'department', name: 'Department Readiness Report', description: 'Department-wise readiness and accreditation scores' },
  { id: 'repository', name: 'Repository Completion Report', description: 'Repository completion matrix across departments' },
  { id: 'gaps', name: 'Gap Analysis Report', description: 'Auto-generated readiness gaps with suggested actions' },
  { id: 'observations', name: 'Quality Observation Report', description: 'All IQAC observations with status and priority' },
  { id: 'improvement', name: 'Continuous Improvement Report', description: 'Quality initiative tracker with outcomes' },
  { id: 'nba', name: 'NBA Readiness Report', description: 'NBA criterion-wise and department-wise readiness' },
  { id: 'naac', name: 'NAAC Readiness Report', description: 'NAAC criterion-wise and institution readiness' },
  { id: 'nirf', name: 'NIRF Readiness Report', description: 'NIRF category-wise readiness scores' },
];

function gapRows(gaps: GapAnalysisDto, scope: 'repository' | 'evidence' | 'criterion' | 'department' | 'year') {
  return (gaps[scope] ?? []).map((g) => [
    g.scope,
    g.department ?? '-',
    g.repository ?? (g.framework ? `${g.framework} ${g.criterion ?? ''}` : g.criterion ?? '-'),
    `${g.current}%`,
    `${g.target}%`,
    g.target - g.current,
    g.priority,
    g.suggestedAction,
  ]);
}

export function buildReportData(
  id: string,
  observations: QualityObservation[],
  initiatives: ImprovementInitiative[],
  ctx: ReportContext
): ReportData {
  const { kpis, departmentReadiness, institutionRepositories, repositoryMonitoring, gaps, accreditation } = ctx;
  switch (id) {
    case 'institution':
      return {
        title: 'Institution Readiness Report',
        columns: ['Metric', 'Value'],
        rows: [
          ['Overall Repository Readiness', `${kpis.repositoryReadiness}%`],
          ['Evidence Completion', `${kpis.evidenceCompletion}%`],
          ['NBA Readiness', `${kpis.nbaReadiness}%`],
          ['NAAC Readiness', `${kpis.naacReadiness}%`],
          ['NIRF Readiness', `${kpis.nirfReadiness}%`],
          ['Departments Ready', kpis.departmentsReady],
          ['Departments Needing Attention', kpis.departmentsNeedingAttention],
          ['Critical Departments', kpis.criticalDepartments],
          ['Critical Gaps', kpis.criticalGaps],
          ['Pending HOD Approvals', kpis.pendingHodApprovals],
          ['Active Quality Observations', kpis.activeObservations],
        ],
      };
    case 'department':
      return {
        title: 'Department Readiness Report',
        columns: ['Department', 'Repository Completion', 'NBA', 'NAAC', 'NIRF', 'Overall Status'],
        rows: departmentReadiness.map((d) => [
          d.code,
          `${d.repositoryCompletion}%`,
          `${d.nba}%`,
          `${d.naac}%`,
          `${d.nirf}%`,
          d.status,
        ]),
      };
    case 'repository':
      return {
        title: 'Repository Completion Report',
        columns: ['Repository', 'Total Records', 'Approved', 'Pending Uploads', 'Pending HOD Approval', 'Missing Evidence', 'Completion'],
        rows: institutionRepositories.map((r) => {
          const m = repositoryMonitoring.find((x) => x.repository === r.repository);
          return [
            r.repository,
            r.totalRecords,
            r.approvedRecords,
            m?.pendingUploads ?? 0,
            m?.pendingHodApproval ?? 0,
            r.missingRecords,
            `${r.readiness}%`,
          ];
        }),
      };
    case 'gaps':
      return {
        title: 'Gap Analysis Report',
        columns: ['Scope', 'Department', 'Repository / Criterion', 'Current', 'Target', 'Gap', 'Priority', 'Suggested Action'],
        rows: [
          ...gapRows(gaps, 'repository'),
          ...gapRows(gaps, 'evidence'),
          ...gapRows(gaps, 'criterion'),
          ...gapRows(gaps, 'department'),
          ...gapRows(gaps, 'year'),
        ],
      };
    case 'observations':
      return {
        title: 'Quality Observation Report',
        columns: ['Title', 'Department', 'Repository', 'Framework', 'Priority', 'Status', 'Due Date', 'Recommended Action'],
        rows: observations.map((o) => [
          o.title,
          o.department,
          o.repository,
          o.framework,
          o.priority,
          o.status,
          o.dueDate,
          o.recommendedAction,
        ]),
      };
    case 'improvement':
      return {
        title: 'Continuous Improvement Report',
        columns: ['Title', 'Category', 'Department', 'Academic Year', 'Owner', 'Start', 'Target', 'Status', 'Outcome'],
        rows: initiatives.map((i) => [
          i.title,
          i.category,
          i.department,
          i.academicYear,
          i.owner,
          i.startDate,
          i.targetDate,
          i.status,
          i.outcome ?? '-',
        ]),
      };
    case 'nba': {
      const criteria = accreditation.nba.criteria ?? [];
      const deptRows = accreditation.nba.departments ?? [];
      return {
        title: 'NBA Readiness Report',
        columns: ['Department', ...criteria.map((_, ci) => `C${ci + 1}`), 'Overall'],
        rows: deptRows.map((d) => [d.dept, ...d.scores.map((s) => `${s}%`), `${d.overall}%`]),
      };
    }
    case 'naac': {
      const criteria = accreditation.naac.criteria ?? [];
      const deptRows = accreditation.naac.departments ?? [];
      return {
        title: 'NAAC Readiness Report',
        columns: ['Department', ...criteria.map((_, ci) => `C${ci + 1}`), 'Overall'],
        rows: deptRows.map((d) => [d.dept, ...d.scores.map((s) => `${s}%`), `${d.overall}%`]),
      };
    }
    case 'nirf': {
      const params = accreditation.nirf.parameters ?? [];
      const deptRows = accreditation.nirf.departments ?? [];
      return {
        title: 'NIRF Readiness Report',
        columns: ['Department', ...params.map((p) => p.id.toUpperCase()), 'Overall'],
        rows: deptRows.map((d) => [d.dept, ...d.scores.map((s) => `${s}%`), `${d.overall}%`]),
      };
    }
    default:
      return { title: 'Report', columns: ['Item'], rows: [['—']] };
  }
}

export function exportIQACReportToExcel(
  id: string,
  observations: QualityObservation[],
  initiatives: ImprovementInitiative[],
  ctx: ReportContext
) {
  const data = buildReportData(id, observations, initiatives, ctx);
  const sheet = XLSX.utils.json_to_sheet(
    data.rows.map((row) => Object.fromEntries(data.columns.map((c, i) => [c, row[i]])))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, data.title.slice(0, 31));
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `iqac-${id}-report-${new Date().toISOString().split('T')[0]}.xlsx`
  );
}

export function exportIQACReportToPDF(
  id: string,
  observations: QualityObservation[],
  initiatives: ImprovementInitiative[],
  ctx: ReportContext
) {
  const data = buildReportData(id, observations, initiatives, ctx);
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text(`AccreditPro — ${data.title}`, 14, 20);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated on ${new Date().toLocaleDateString()} • IQAC Coordinator Module`, 14, 27);
  autoTable(doc, {
    startY: 34,
    head: [data.columns],
    body: data.rows.map((row) => row.map(String)),
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 8 },
  });
  doc.save(`iqac-${id}-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
