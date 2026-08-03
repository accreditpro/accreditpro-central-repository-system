import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExportFormat, AnalyticsOverviewData } from './types';

/** Maps the overview API response to flat export-friendly sections */
function buildExportData(data: AnalyticsOverviewData) {
  return {
    summary: (data.summaryCards || []).map(card => ({
      Metric: card.title,
      Value: String(card.value),
      'Change (%)': card.change,
    })),
    growth: (data.institutionGrowth || []).map(item => ({
      Month: item.month,
      Institutions: item.institutions,
      Users: item.users,
    })),
    topInstitutions: (data.topInstitutions || []).map(item => ({
      Institution: item.name,
      State: item.state,
      Users: item.users,
      Documents: item.documents,
      'Completion (%)': item.completion,
    })),
    repositoryCompletion: (data.repositoryCompletion || []).map(item => ({
      Institution: item.institution,
      'Academic (%)': item.academic,
      'Faculty (%)': item.faculty,
      'Student (%)': item.student,
      'Research (%)': item.research,
      'Infrastructure (%)': item.infrastructure,
    })),
    recentActivity: (data.recentActivity || []).map(item => ({
      Action: item.title,
      User: item.user,
      Institution: item.institution,
      Time: item.timestamp,
      Type: item.type,
    })),
  };
}

function exportToCSV(data: AnalyticsOverviewData) {
  const exportData = buildExportData(data);
  let csv = '';

  // Summary
  csv += 'ANALYTICS SUMMARY\n';
  csv += 'Metric,Value,Change (%)\n';
  exportData.summary.forEach(row => {
    csv += `${row.Metric},${row.Value},${row['Change (%)']}\n`;
  });
  csv += '\n';

  // Growth
  csv += 'INSTITUTION GROWTH\n';
  csv += 'Month,Institutions,Users\n';
  exportData.growth.forEach(row => {
    csv += `${row.Month},${row.Institutions},${row.Users}\n`;
  });
  csv += '\n';

  // Top Institutions
  csv += 'TOP INSTITUTIONS\n';
  csv += 'Institution,State,Users,Documents,Completion (%)\n';
  exportData.topInstitutions.forEach(row => {
    csv += `${row.Institution},${row.State},${row.Users},${row.Documents},${row['Completion (%)']}\n`;
  });
  csv += '\n';

  // Repository Completion
  csv += 'REPOSITORY COMPLETION\n';
  csv += 'Institution,Academic (%),Faculty (%),Student (%),Research (%),Infrastructure (%)\n';
  exportData.repositoryCompletion.forEach(row => {
    csv += `${row.Institution},${row['Academic (%)']},${row['Faculty (%)']},${row['Student (%)']},${row['Research (%)']},${row['Infrastructure (%)']}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
}

function exportToExcel(data: AnalyticsOverviewData) {
  const exportData = buildExportData(data);
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet(exportData.summary);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const growthSheet = XLSX.utils.json_to_sheet(exportData.growth);
  XLSX.utils.book_append_sheet(workbook, growthSheet, 'Institution Growth');

  const topSheet = XLSX.utils.json_to_sheet(exportData.topInstitutions);
  XLSX.utils.book_append_sheet(workbook, topSheet, 'Top Institutions');

  const repoSheet = XLSX.utils.json_to_sheet(exportData.repositoryCompletion);
  XLSX.utils.book_append_sheet(workbook, repoSheet, 'Repository Completion');

  const activitySheet = XLSX.utils.json_to_sheet(exportData.recentActivity);
  XLSX.utils.book_append_sheet(workbook, activitySheet, 'Recent Activity');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportToPDF(data: AnalyticsOverviewData) {
  const doc = new jsPDF();
  const exportData = buildExportData(data);

  // Title
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text('AccreditPro Analytics Report', 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

  // Summary Table
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Summary', 14, 42);
  autoTable(doc, {
    startY: 46,
    head: [['Metric', 'Value', 'Change (%)']],
    body: exportData.summary.map(row => [row.Metric, row.Value, `${row['Change (%)']}%`]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
  });

  // Top Institutions Table
  const finalY1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(14);
  doc.text('Top Institutions', 14, finalY1 + 12);
  autoTable(doc, {
    startY: finalY1 + 16,
    head: [['Institution', 'State', 'Users', 'Documents', 'Completion (%)']],
    body: exportData.topInstitutions.map(row => [
      row.Institution,
      row.State,
      String(row.Users),
      String(row.Documents),
      `${row['Completion (%)']}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
  });

  // Repository Completion on new page
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Repository Completion by Institution', 14, 22);
  autoTable(doc, {
    startY: 26,
    head: [['Institution', 'Academic', 'Faculty', 'Student', 'Research', 'Infrastructure']],
    body: exportData.repositoryCompletion.map(row => [
      row.Institution,
      `${row['Academic (%)']}%`,
      `${row['Faculty (%)']}%`,
      `${row['Student (%)']}%`,
      `${row['Research (%)']}%`,
      `${row['Infrastructure (%)']}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
  });

  doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export analytics data in the specified format.
 * Requires the overview data from the API (not mock data).
 */
export function handleExport(format: ExportFormat, data: AnalyticsOverviewData) {
  switch (format) {
    case 'csv':
      exportToCSV(data);
      break;
    case 'excel':
      exportToExcel(data);
      break;
    case 'pdf':
      exportToPDF(data);
      break;
  }
}
