// app/api/downtime/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withPermission, AuthenticatedRequest } from '@/lib/api-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/downtime
 * Récupère les temps d'arrêt
 */
export const GET = withPermission('production', 'read', async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const periodMinutes = parseInt(searchParams.get('period') || '1440'); // 24h par défaut
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const startTime = new Date(Date.now() - periodMinutes * 60 * 1000);

    const downtimes = await prisma.downtime.findMany({
      where: {
        startTime: {
          gte: startTime
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: limit
    });

    // Statistiques
    const totalDowntime = downtimes.reduce((sum, d) => sum + (d.duration || 0), 0);
    const plannedCount = downtimes.filter(d => d.category === 'PLANIFIE').length;
    const unplannedCount = downtimes.filter(d => d.category === 'NON_PLANIFIE').length;
    
    // Répartition par raison
    const byReason = downtimes.reduce((acc, d) => {
      acc[d.reason] = (acc[d.reason] || 0) + (d.duration || 0);
      return acc;
    }, {} as Record<string, number>);

    // MTTR (Mean Time To Repair) - seulement pour les pannes résolues
    const resolvedDowntimes = downtimes.filter(d => d.resolved && d.duration);
    const mttr = resolvedDowntimes.length > 0
      ? resolvedDowntimes.reduce((sum, d) => sum + (d.duration || 0), 0) / resolvedDowntimes.length
      : 0;

    return NextResponse.json({
      downtimes: downtimes.map(d => ({
        id: d.id,
        startTime: d.startTime,
        endTime: d.endTime,
        duration: d.duration,
        reason: d.reason,
        category: d.category,
        description: d.description,
        resolved: d.resolved
      })),
      summary: {
        total: downtimes.length,
        totalDowntime,
        plannedCount,
        unplannedCount,
        mttr: Math.round(mttr * 10) / 10,
        byReason
      }
    });

  } catch (error) {
    console.error('Erreur API /api/downtime:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/downtime
 * Créer un nouvel arrêt manuellement
 */
export const POST = withPermission('production', 'create', async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { reason, category, description } = body;

    if (!reason || !category) {
      return NextResponse.json(
        { error: 'Raison et catégorie requis' },
        { status: 400 }
      );
    }

    const downtime = await prisma.downtime.create({
      data: {
        startTime: new Date(),
        reason,
        category,
        description,
        resolved: false
      }
    });

    return NextResponse.json({
      message: 'Arrêt créé avec succès',
      downtime
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur création arrêt:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'arrêt' },
      { status: 500 }
    );
  }
});