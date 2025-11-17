// app/api/safety/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/api-middleware';

const prisma = new PrismaClient();

export const GET = withPermission('safety', 'read', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const incidents = await prisma.safetyIncident.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });

    // Métriques de sécurité
    const allIncidents = await prisma.safetyIncident.findMany();

    // Accidents uniquement
    const accidents = allIncidents.filter(i => i.type === 'accident');
    const lastAccident = accidents.length > 0
      ? accidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
      : null;

    // Jours sans accident
    const daysSinceLastAccident = lastAccident
      ? Math.floor((Date.now() - lastAccident.timestamp.getTime()) / (24 * 60 * 60 * 1000))
      : 365; // Valeur par défaut si pas d'accident

    // Taux de fréquence (nombre d'accidents avec arrêt de travail pour 1 million d'heures travaillées)
    const accidentsWithDaysLost = accidents.filter(a => a.daysLost && a.daysLost > 0);
    const hoursWorked = 24 * 30 * 20; // Approximation : 30 jours * 20 employés * 8h (en réalité 24h/3 shifts)
    const frequencyRate = (accidentsWithDaysLost.length / hoursWorked) * 1000000;

    // Taux de gravité (nombre de jours perdus pour 1000 heures travaillées)
    const totalDaysLost = accidents.reduce((sum, a) => sum + (a.daysLost || 0), 0);
    const severityRate = (totalDaysLost / hoursWorked) * 1000;

    // Coûts
    const totalCost = allIncidents.reduce((sum, i) => sum + (i.cost || 0), 0);

    const metrics = {
      daysSinceLastAccident,
      totalIncidents: allIncidents.length,
      accidents: accidents.length,
      nearMisses: allIncidents.filter(i => i.type === 'near_miss').length,
      unsafeConditions: allIncidents.filter(i => i.type === 'unsafe_condition').length,
      openIncidents: allIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
      closedIncidents: allIncidents.filter(i => i.status === 'closed').length,
      frequencyRate: Math.round(frequencyRate * 100) / 100,
      severityRate: Math.round(severityRate * 100) / 100,
      totalDaysLost,
      totalCost: Math.round(totalCost * 100) / 100
    };

    // Répartition par type
    const incidentsByType = [
      { name: 'Accidents', value: accidents.length, color: '#EF4444' },
      { name: 'Presque-accidents', value: allIncidents.filter(i => i.type === 'near_miss').length, color: '#F59E0B' },
      { name: 'Conditions dangereuses', value: allIncidents.filter(i => i.type === 'unsafe_condition').length, color: '#3B82F6' },
      { name: 'Non-conformités', value: allIncidents.filter(i => i.type === 'non_compliance').length, color: '#8B5CF6' }
    ];

    // Répartition par sévérité
    const incidentsBySeverity = [
      { name: 'Critique', value: allIncidents.filter(i => i.severity === 'critical').length, color: '#DC2626' },
      { name: 'Élevée', value: allIncidents.filter(i => i.severity === 'high').length, color: '#EF4444' },
      { name: 'Moyenne', value: allIncidents.filter(i => i.severity === 'medium').length, color: '#F59E0B' },
      { name: 'Faible', value: allIncidents.filter(i => i.severity === 'low').length, color: '#10B981' }
    ];

    // Répartition par lieu
    const byLocation: any = {};
    allIncidents.forEach(i => {
      byLocation[i.location] = (byLocation[i.location] || 0) + 1;
    });

    const incidentsByLocation = Object.keys(byLocation).map(location => ({
      location,
      count: byLocation[location]
    })).sort((a, b) => b.count - a.count);

    // Tendance (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentIncidents = allIncidents.filter(i => i.timestamp >= sixMonthsAgo);
    const monthlyData: any = {};

    recentIncidents.forEach(incident => {
      const month = incident.timestamp.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { accidents: 0, nearMisses: 0, unsafeConditions: 0 };
      }
      if (incident.type === 'accident') monthlyData[month].accidents++;
      else if (incident.type === 'near_miss') monthlyData[month].nearMisses++;
      else if (incident.type === 'unsafe_condition') monthlyData[month].unsafeConditions++;
    });

    const trend = Object.keys(monthlyData).sort().map(month => ({
      month,
      accidents: monthlyData[month].accidents,
      nearMisses: monthlyData[month].nearMisses,
      unsafeConditions: monthlyData[month].unsafeConditions,
      total: monthlyData[month].accidents + monthlyData[month].nearMisses + monthlyData[month].unsafeConditions
    }));

    return NextResponse.json({
      incidents: incidents.map(i => ({
        id: i.id,
        timestamp: i.timestamp.toISOString(),
        type: i.type,
        severity: i.severity,
        title: i.title,
        description: i.description,
        location: i.location,
        reportedBy: i.reportedBy,
        involvedPersons: i.involvedPersons,
        injuryType: i.injuryType,
        bodyPart: i.bodyPart,
        rootCause: i.rootCause,
        correctiveActions: i.correctiveActions,
        status: i.status,
        daysLost: i.daysLost,
        cost: i.cost,
        investigator: i.investigator,
        closedAt: i.closedAt?.toISOString()
      })),
      metrics,
      incidentsByType,
      incidentsBySeverity,
      incidentsByLocation,
      trend
    });
  } catch (error) {
    console.error('Erreur API safety:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

// POST - Créer un nouvel incident de sécurité
export const POST = withPermission('safety', 'create', async (request: NextRequest) => {
  try {
    const data = await request.json();
    
    const {
      type,
      severity,
      title,
      description,
      location,
      reportedBy,
      involvedPersons,
      injuryType,
      bodyPart,
      rootCause
    } = data;

    // Validation des données requises
    if (!type || !severity || !title || !location || !reportedBy) {
      return NextResponse.json(
        { error: 'Type, severity, title, location, and reportedBy are required' },
        { status: 400 }
      );
    }

    const incident = await prisma.safetyIncident.create({
      data: {
        type,
        severity,
        title,
        description,
        location,
        reportedBy,
        involvedPersons,
        injuryType,
        bodyPart,
        rootCause,
        status: 'open',
        timestamp: new Date()
      }
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'incident:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});
