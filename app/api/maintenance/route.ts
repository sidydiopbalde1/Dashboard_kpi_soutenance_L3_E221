// app/api/maintenance/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission, AuthenticatedRequest } from '@/lib/api-middleware';

const prisma = new PrismaClient();

export const GET = withPermission('maintenance', 'read', async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Construire la requête avec filtres
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }

    // Récupérer les tâches de maintenance
    const tasks = await prisma.maintenanceTask.findMany({
      where,
      include: {
        equipment: {
          select: {
            name: true,
            location: true,
            type: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledDate: 'asc' }
      ]
    });

    // Calculer les métriques
    const allTasks = await prisma.maintenanceTask.findMany();
    const completedTasks = allTasks.filter(t => t.status === 'completed');

    // MTTR - Mean Time To Repair (moyenne des durées de réparation)
    const repairs = completedTasks.filter(t => t.actualDuration && t.type !== 'preventive');
    const mttr = repairs.length > 0
      ? repairs.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / repairs.length
      : 0;

    // Calculer MTBF approximatif (heures entre pannes)
    const breakdowns = allTasks.filter(t => t.type === 'emergency' || t.type === 'corrective');
    const mtbf = breakdowns.length > 1
      ? (24 * 30) / breakdowns.length // Approximation sur 30 jours
      : 342.5;

    // Disponibilité (basée sur le temps d'arrêt)
    const totalDowntimeHours = completedTasks.reduce((sum, t) =>
      sum + ((t.actualDuration || t.estimatedDuration) / 60), 0
    );
    const totalHours = 24 * 30; // 30 jours
    const availability = ((totalHours - totalDowntimeHours) / totalHours) * 100;

    // Coûts
    const totalCost = allTasks.reduce((sum, t) => sum + (t.cost || 0), 0);
    const averageCost = allTasks.length > 0 ? totalCost / allTasks.length : 0;

    const metrics = {
      mtbf: Math.round(mtbf * 10) / 10,
      mttr: Math.round(mttr * 10) / 10,
      availability: Math.round(availability * 10) / 10,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
      plannedTasks: allTasks.filter(t => t.status === 'planned').length,
      totalCost: Math.round(totalCost * 100) / 100,
      averageCost: Math.round(averageCost * 100) / 100
    };

    // Tendances (derniers 6 mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentTasks = await prisma.maintenanceTask.findMany({
      where: {
        scheduledDate: { gte: sixMonthsAgo }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    // Grouper par mois
    const monthlyData: any = {};
    recentTasks.forEach(task => {
      const month = task.scheduledDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { preventive: 0, corrective: 0, emergency: 0, cost: 0 };
      }
      monthlyData[month][task.type as keyof typeof monthlyData[typeof month]]++;
      monthlyData[month].cost += task.cost || 0;
    });

    const trends = Object.keys(monthlyData).map(month => ({
      month,
      preventive: monthlyData[month].preventive,
      corrective: monthlyData[month].corrective,
      emergency: monthlyData[month].emergency,
      cost: Math.round(monthlyData[month].cost * 100) / 100
    }));

    // Répartition par type
    const tasksByType = [
      { name: 'Préventive', value: allTasks.filter(t => t.type === 'preventive').length, color: '#3B82F6' },
      { name: 'Corrective', value: allTasks.filter(t => t.type === 'corrective').length, color: '#F59E0B' },
      { name: 'Urgence', value: allTasks.filter(t => t.type === 'emergency').length, color: '#EF4444' }
    ];

    return NextResponse.json({
      tasks: tasks.map(t => ({
        id: t.id,
        equipment: t.equipment.name,
        equipmentLocation: t.equipment.location,
        type: t.type,
        status: t.status,
        priority: t.priority,
        title: t.title,
        description: t.description,
        assignedTo: t.assignedTo,
        scheduledDate: t.scheduledDate.toISOString(),
        startedAt: t.startedAt?.toISOString(),
        completedAt: t.completedAt?.toISOString(),
        estimatedDuration: t.estimatedDuration,
        actualDuration: t.actualDuration,
        cost: t.cost,
        spareParts: t.spareParts,
        comments: t.comments
      })),
      metrics,
      trends,
      tasksByType
    });
  } catch (error) {
    console.error('Erreur API maintenance:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

// POST - Créer une nouvelle tâche de maintenance
export const POST = withPermission('maintenance', 'create', async (request: AuthenticatedRequest) => {
  try {
    const data = await request.json();
    
    const {
      equipmentId,
      type,
      title,
      description,
      priority,
      scheduledDate,
      estimatedDuration,
      assignedTo
    } = data;

    // Validation des données requises
    if (!equipmentId || !type || !title || !scheduledDate) {
      return NextResponse.json(
        { error: 'Equipment ID, type, title, and scheduled date are required' },
        { status: 400 }
      );
    }

    const task = await prisma.maintenanceTask.create({
      data: {
        equipmentId,
        type,
        title,
        description,
        priority: priority || 'medium',
        scheduledDate: new Date(scheduledDate),
        estimatedDuration,
        assignedTo,
        status: 'planned'
      },
      include: {
        equipment: {
          select: {
            name: true,
            location: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});
