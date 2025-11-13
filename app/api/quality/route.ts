// app/api/quality/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const period = searchParams.get('period') || 'today';

    // Déterminer la plage de dates
    let startDate = new Date();
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    // Construire les filtres
    const where: any = {
      timestamp: { gte: startDate }
    };
    if (severity && severity !== 'all') {
      where.severity = severity;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    // Récupérer les défauts qualité
    const defects = await prisma.qualityControl.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });

    // Calculer les métriques
    const totalQuantityDefects = defects.reduce((sum, d) => sum + d.quantity, 0);
    const totalProduced = defects.reduce((sum, d) => sum + d.totalProduced, 0);

    const defectRate = totalProduced > 0 ? (totalQuantityDefects / totalProduced) * 100 : 0;
    const conformityRate = 100 - defectRate;

    // First Pass Yield (produits conformes du premier coup)
    const firstPassYield = conformityRate; // Simplifié pour la démo

    // Données de production réelles
    const productionData = await prisma.productionData.findMany({
      where: {
        timestamp: { gte: startDate }
      }
    });

    const totalBottlesProduced = productionData.reduce((sum, p) => sum + p.bottlesProduced, 0);
    const totalDefectsFromProduction = productionData.reduce((sum, p) => sum + p.defectCount, 0);

    const actualDefectRate = totalBottlesProduced > 0
      ? (totalDefectsFromProduction / totalBottlesProduced) * 100
      : 0;

    // Coûts qualité (estimés)
    const scrapCost = totalQuantityDefects * 0.50; // 0.50€ par unité mise au rebut
    const reworkCost = defects.filter(d => d.status === 'corrected').length * 50; // 50€ par retouche

    const metrics = {
      conformityRate: Math.round(conformityRate * 10) / 10,
      defectRate: Math.round(actualDefectRate * 10) / 10,
      firstPassYield: Math.round(firstPassYield * 10) / 10,
      totalDefects: totalDefectsFromProduction,
      openIssues: defects.filter(d => d.status === 'open' || d.status === 'investigating').length,
      closedIssues: defects.filter(d => d.status === 'closed' || d.status === 'corrected').length,
      criticalIssues: defects.filter(d => d.severity === 'critical').length,
      scrapCost: Math.round(scrapCost * 100) / 100,
      reworkCost: Math.round(reworkCost * 100) / 100,
      totalQualityCost: Math.round((scrapCost + reworkCost) * 100) / 100
    };

    // Répartition par type de défaut
    const defectTypes: any = {};
    defects.forEach(d => {
      if (d.defectType) {
        defectTypes[d.defectType] = (defectTypes[d.defectType] || 0) + d.quantity;
      }
    });

    const defectsByType = Object.keys(defectTypes).map(type => ({
      name: type,
      value: defectTypes[type],
      percentage: Math.round((defectTypes[type] / totalQuantityDefects) * 100)
    })).sort((a, b) => b.value - a.value);

    // Répartition par ligne
    const defectsByLine: any = {};
    defects.forEach(d => {
      defectsByLine[d.line] = (defectsByLine[d.line] || 0) + d.quantity;
    });

    const lineQuality = Object.keys(defectsByLine).map(line => ({
      line,
      defects: defectsByLine[line],
      color: line === 'Ligne 1' ? '#3B82F6' : line === 'Ligne 2' ? '#F59E0B' : '#8B5CF6'
    }));

    // Cartes de contrôle SPC (Statistical Process Control)
    // Grouper par période (dernières 24 heures)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const spcData = await prisma.productionData.findMany({
      where: {
        timestamp: { gte: last24h }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Grouper par heure
    const hourlyData: any = {};
    spcData.forEach(point => {
      const hour = point.timestamp.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      if (!hourlyData[hour]) {
        hourlyData[hour] = { produced: 0, defects: 0, count: 0 };
      }
      hourlyData[hour].produced += point.bottlesProduced;
      hourlyData[hour].defects += point.defectCount;
      hourlyData[hour].count++;
    });

    const spcPoints = Object.keys(hourlyData).map(hour => {
      const data = hourlyData[hour];
      const defectRate = data.produced > 0 ? (data.defects / data.produced) * 100 : 0;
      return {
        hour: hour.substring(11), // HH
        defectRate: Math.round(defectRate * 100) / 100,
        produced: data.produced
      };
    });

    // Calcul des limites de contrôle
    const avgDefectRate = spcPoints.reduce((sum, p) => sum + p.defectRate, 0) / spcPoints.length;
    const variance = spcPoints.reduce((sum, p) => sum + Math.pow(p.defectRate - avgDefectRate, 2), 0) / spcPoints.length;
    const stdDev = Math.sqrt(variance);

    const spcChart = {
      data: spcPoints,
      centerLine: Math.round(avgDefectRate * 100) / 100,
      upperControlLimit: Math.round((avgDefectRate + 3 * stdDev) * 100) / 100,
      lowerControlLimit: Math.max(0, Math.round((avgDefectRate - 3 * stdDev) * 100) / 100),
      upperWarningLimit: Math.round((avgDefectRate + 2 * stdDev) * 100) / 100,
      lowerWarningLimit: Math.max(0, Math.round((avgDefectRate - 2 * stdDev) * 100) / 100)
    };

    return NextResponse.json({
      defects: defects.map(d => ({
        id: d.id,
        timestamp: d.timestamp.toISOString(),
        lotNumber: d.lotNumber,
        productType: d.productType,
        defectType: d.defectType,
        severity: d.severity,
        quantity: d.quantity,
        totalProduced: d.totalProduced,
        operator: d.operator,
        line: d.line,
        shift: d.shift,
        status: d.status,
        inspector: d.inspector,
        correctedAction: d.correctedAction,
        comments: d.comments
      })),
      metrics,
      defectsByType,
      lineQuality,
      spcChart
    });
  } catch (error) {
    console.error('Erreur API quality:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
