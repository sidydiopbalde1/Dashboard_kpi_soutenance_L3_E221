// app/api/dashboard/current/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/api-middleware';

const prisma = new PrismaClient();

// Fonction helper pour les couleurs des temps d'arrêt
function getDowntimeColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'planned':
    case 'maintenance':
      return '#3B82F6'; // Bleu
    case 'unplanned':
    case 'breakdown':
      return '#EF4444'; // Rouge
    case 'changeover':
    case 'setup':
      return '#F59E0B'; // Orange
    case 'material':
    case 'supply':
      return '#8B5CF6'; // Violet
    default:
      return '#6B7280'; // Gris
  }
}

export const GET = withPermission('dashboard', 'read', async (_request: NextRequest) => {
  try {
    // Récupérer les données de production actuelles (dernières 5 minutes)
    const currentProduction = await prisma.productionData.findFirst({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000)
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Récupérer le dernier snapshot KPI
    const latestKPI = await prisma.kPISnapshot.findFirst({
      where: {
        period: 'current'
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Récupérer les équipements
    const equipmentList = await prisma.equipment.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Récupérer les alertes actives
    const activeAlerts = await prisma.alert.findMany({
      where: {
        isResolved: false
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });

    // Production horaire (dernières 8 heures)
    const hourlyProduction = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM timestamp) as hour,
        AVG("bottlesProduced") as production,
        AVG("targetRate" * 60) as objectif
      FROM "ProductionData" 
      WHERE timestamp >= NOW() - INTERVAL '8 hours'
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY hour;
    `;

    // Répartition des temps d'arrêt par catégorie (aujourd'hui)
    const downtimeReasons = await prisma.$queryRaw`
      SELECT 
        category as name,
        SUM(COALESCE(duration, EXTRACT(EPOCH FROM (NOW() - "startTime"))/60)) as value
      FROM "Downtime" 
      WHERE "startTime" >= CURRENT_DATE
      GROUP BY category;
    `;

    // Temps d'arrêt actifs
    const activeDowntime = await prisma.downtime.findMany({
      where: {
        resolved: false
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Comparaison des shifts (aujourd'hui)
    const shiftComparison = await prisma.$queryRaw`
      SELECT 
        "shiftId" as shift,
        AVG("bottlesProduced") as production,
        COUNT(*) as data_points
      FROM "ProductionData" 
      WHERE timestamp >= CURRENT_DATE
        AND "shiftId" IS NOT NULL
      GROUP BY "shiftId"
      ORDER BY 
        CASE "shiftId" 
          WHEN 'MATIN' THEN 1 
          WHEN 'APRES_MIDI' THEN 2 
          WHEN 'NUIT' THEN 3 
          ELSE 4
        END;
    `;

    // Calculer le temps d'arrêt total aujourd'hui
    const totalDowntimeToday = await prisma.$queryRaw`
      SELECT 
        SUM(COALESCE(duration, EXTRACT(EPOCH FROM (NOW() - "startTime"))/60)) as total
      FROM "Downtime" 
      WHERE "startTime" >= CURRENT_DATE;
    `;

    // Calculer les composants TRS
    const trsComponents = latestKPI ? [
      { name: 'Disponibilité', value: Number(latestKPI.availability), color: '#10B981' },
      { name: 'Performance', value: Number(latestKPI.performance), color: '#3B82F6' },
      { name: 'Qualité', value: Number(latestKPI.quality), color: '#8B5CF6' }
    ] : [
      { name: 'Disponibilité', value: 95.2, color: '#10B981' },
      { name: 'Performance', value: 87.4, color: '#3B82F6' },
      { name: 'Qualité', value: 96.8, color: '#8B5CF6' }
    ];

    // Mapper le statut des équipements
    const equipmentStatus = equipmentList.map(eq => ({
      name: eq.name,
      status: eq.status,
      efficiency: Number(eq.efficiency),
      lastMaintenance: eq.lastMaintenance?.toISOString().split('T')[0] || 'N/A'
    }));

    // Calculer les métriques de qualité
    const qualityMetrics = currentProduction ? {
      conformityRate: Math.max(0, 100 - (currentProduction.defectCount / Math.max(1, currentProduction.bottlesProduced)) * 100),
      defectRate: (currentProduction.defectCount / Math.max(1, currentProduction.bottlesProduced)) * 100,
      defectCount: currentProduction.defectCount
    } : {
      conformityRate: 96.8,
      defectRate: 3.2,
      defectCount: 0
    };

    // Construire la réponse
    const response = {
      kpi: {
        trs: latestKPI ? Number(latestKPI.trs) : (currentProduction?.isRunning ? 82.1 : 0)
      },
      production: {
        totalProduced: currentProduction?.bottlesProduced || 0,
        currentRate: currentProduction?.actualRate || 0,
        objectif: currentProduction ? currentProduction.targetRate * 60 : 2500, // Convertir en bouteilles/heure
        isRunning: currentProduction?.isRunning || false,
        temperature: currentProduction?.temperature || null,
        pressure: currentProduction?.pressure || null
      },
      quality: qualityMetrics,
      downtime: {
        total: Math.round(Number((totalDowntimeToday as any)?.[0]?.total || 0)),
        active: activeDowntime.length,
        activeEvents: activeDowntime.map(dt => ({
          id: dt.id,
          reason: dt.reason,
          category: dt.category,
          duration: dt.duration || Math.floor((Date.now() - dt.startTime.getTime()) / 60000),
          startTime: dt.startTime.toISOString()
        }))
      },
      hourlyProduction: (hourlyProduction as any[]).map(hp => ({
        hour: `${hp.hour}h`,
        production: Math.round(hp.production || 0),
        objectif: Math.round(hp.objectif || 850)
      })),
      trsComponents,
      equipmentStatus,
      alerts: activeAlerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        message: alert.message,
        time: alert.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        severity: alert.severity,
        threshold: alert.threshold,
        actualValue: alert.actualValue
      })),
      downtimeReasons: (downtimeReasons as any[]).map(dt => ({
        name: dt.name,
        value: Math.round(dt.value || 0),
        color: getDowntimeColor(dt.name)
      })),
      shiftComparison: (shiftComparison as any[]).map(shift => ({
        shift: shift.shift,
        production: Math.round(shift.production || 0),
        trs: latestKPI ? Number(latestKPI.trs) : 80,
        efficiency: Math.round((shift.production / 2500) * 100) || 90
      })),
      metadata: {
        lastUpdate: new Date().toISOString(),
        dataPoints: {
          production: currentProduction ? 1 : 0,
          alerts: activeAlerts.length,
          downtime: activeDowntime.length,
          equipment: equipmentList.length
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur API dashboard:', error);
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

// API POST pour créer de nouvelles données (optionnel)
export const POST = withPermission('dashboard', 'create', async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Créer une nouvelle entrée de production
    const newProduction = await prisma.productionData.create({
      data: {
        bottlesProduced: body.bottlesProduced,
        targetRate: body.targetRate || 120,
        actualRate: body.actualRate,
        defectCount: body.defectCount || 0,
        isRunning: body.isRunning ?? true,
        shiftId: body.shiftId,
        temperature: body.temperature,
        pressure: body.pressure
      }
    });

    return NextResponse.json({
      success: true,
      data: newProduction
    });
  } catch (error) {
    console.error('Erreur création données:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});