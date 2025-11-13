// lib/export-utils.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportData {
  kpi: any;
  production: any;
  downtime: any;
  alerts: any[];
  period: string;
  reportType: string;
  shift?: string;
}

/**
 * Génère un rapport PDF
 */
export function generatePDFReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Bleu
  doc.text('Dashboard KPI - Ligne d\'Embouteillage', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Rapport: ${getReportTypeName(data.reportType)}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Date: ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, 37, { align: 'center' });
  doc.text(`Période: ${data.period}`, pageWidth / 2, 44, { align: 'center' });
  
  let yPos = 55;

  // Ligne séparatrice
  doc.setDrawColor(200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 10;

  // Section KPIs principaux
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Indicateurs de Performance (KPI)', 15, yPos);
  yPos += 10;

  const kpiData = [
    ['TRS (Taux de Rendement Synthétique)', `${data.kpi?.trs || 0}%`, getStatusLabel(data.kpi?.trsStatus)],
    ['Disponibilité', `${data.kpi?.availability || 0}%`, '-'],
    ['Performance', `${data.kpi?.performance || 0}%`, '-'],
    ['Qualité', `${data.kpi?.quality || 0}%`, '-'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indicateur', 'Valeur', 'Statut']],
    body: kpiData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section Production
  doc.setFontSize(16);
  doc.text('Production', 15, yPos);
  yPos += 10;

  const productionData = [
    ['Production totale', `${data.production?.totalProduced?.toLocaleString() || 0} bouteilles`],
    ['Cadence actuelle', `${data.production?.currentRate || 0} b/min`],
    ['Cadence objectif', `${data.production?.targetRate || 120} b/min`],
    ['Défauts totaux', `${data.production?.totalDefects || 0}`],
    ['Taux de défauts', `${data.production?.defectRate || 0}%`],
    ['Unités conformes', `${data.production?.goodUnits?.toLocaleString() || 0}`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Métrique', 'Valeur']],
    body: productionData,
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section Temps d'arrêt
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.text('Temps d\'Arrêt', 15, yPos);
  yPos += 10;

  const downtimeData = [
    ['Temps total d\'arrêt', `${data.downtime?.total || 0} minutes`],
    ['Nombre d\'incidents', `${data.downtime?.count || 0}`],
    ['Statut', getStatusLabel(data.downtime?.status)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Métrique', 'Valeur']],
    body: downtimeData,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Section Alertes
  if (data.alerts && data.alerts.length > 0) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.text('Alertes', 15, yPos);
    yPos += 10;

    const alertsData = data.alerts.slice(0, 10).map(alert => [
      alert.type.replace('_', ' '),
      alert.severity,
      alert.message,
      alert.isResolved ? 'Résolu' : 'Actif'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Type', 'Sévérité', 'Message', 'Statut']],
      body: alertsData,
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      styles: { fontSize: 9 },
    });
  }

  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Sauvegarder
  const filename = `rapport_${data.reportType}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  doc.save(filename);
}

/**
 * Génère un rapport Excel
 */
export function generateExcelReport(data: ReportData) {
  const workbook = XLSX.utils.book_new();

  // Feuille 1: KPIs
  const kpiSheet = XLSX.utils.json_to_sheet([
    { Indicateur: 'TRS', Valeur: `${data.kpi?.trs || 0}%`, Statut: getStatusLabel(data.kpi?.trsStatus) },
    { Indicateur: 'Disponibilité', Valeur: `${data.kpi?.availability || 0}%`, Statut: '-' },
    { Indicateur: 'Performance', Valeur: `${data.kpi?.performance || 0}%`, Statut: '-' },
    { Indicateur: 'Qualité', Valeur: `${data.kpi?.quality || 0}%`, Statut: '-' },
  ]);
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');

  // Feuille 2: Production
  const productionSheet = XLSX.utils.json_to_sheet([
    { Métrique: 'Production totale', Valeur: `${data.production?.totalProduced || 0} bouteilles` },
    { Métrique: 'Cadence actuelle', Valeur: `${data.production?.currentRate || 0} b/min` },
    { Métrique: 'Cadence objectif', Valeur: `${data.production?.targetRate || 120} b/min` },
    { Métrique: 'Défauts totaux', Valeur: data.production?.totalDefects || 0 },
    { Métrique: 'Taux de défauts', Valeur: `${data.production?.defectRate || 0}%` },
    { Métrique: 'Unités conformes', Valeur: data.production?.goodUnits || 0 },
  ]);
  XLSX.utils.book_append_sheet(workbook, productionSheet, 'Production');

  // Feuille 3: Temps d'arrêt
  const downtimeSheet = XLSX.utils.json_to_sheet([
    { Métrique: 'Temps total d\'arrêt', Valeur: `${data.downtime?.total || 0} minutes` },
    { Métrique: 'Nombre d\'incidents', Valeur: data.downtime?.count || 0 },
    { Métrique: 'Statut', Valeur: getStatusLabel(data.downtime?.status) },
  ]);
  XLSX.utils.book_append_sheet(workbook, downtimeSheet, 'Temps d\'Arrêt');

  // Feuille 4: Alertes
  if (data.alerts && data.alerts.length > 0) {
    const alertsData = data.alerts.map(alert => ({
      Type: alert.type.replace('_', ' '),
      Sévérité: alert.severity,
      Message: alert.message,
      Statut: alert.isResolved ? 'Résolu' : 'Actif',
      Date: format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })
    }));
    const alertsSheet = XLSX.utils.json_to_sheet(alertsData);
    XLSX.utils.book_append_sheet(workbook, alertsSheet, 'Alertes');
  }

  // Sauvegarder
  const filename = `rapport_${data.reportType}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

// Fonctions utilitaires
function getReportTypeName(type: string): string {
  const types: Record<string, string> = {
    production: 'Production',
    trs: 'TRS & OEE',
    downtime: 'Temps d\'arrêt',
    quality: 'Qualité',
    shift: 'Par équipe'
  };
  return types[type] || type;
}

function getStatusLabel(status: string | undefined): string {
  const labels: Record<string, string> = {
    good: '✓ Bon',
    warning: '⚠ Attention',
    critical: '✗ Critique'
  };
  return labels[status || ''] || '-';
}