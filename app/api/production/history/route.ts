// app/api/production/history/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/production/history
 * Récupère l'historique de production avec graphiques
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const periodMinutes = parseInt(searchParams.get('period') || '60');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const startTime = new Date(Date.now() - periodMinutes * 60 * 1000);

    // Récupérer les données de production
    const productionData = await prisma.productionData.findMany({
      where: {
        timestamp: {
          gte: startTime
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      take: limit
    });

    if (productionData.length === 0) {
      return NextResponse.json({
        data: [],
        summary: null
      });
    }

    // Calculer les statistiques
    const totalProduced = productionData.reduce((sum, d) => sum + d.bottlesProduced, 0);
    const totalDefects = productionData.reduce((sum, d) => sum + d.defectCount, 0);
    const avgRate = productionData.reduce((sum, d) => sum + d.actualRate, 0) / productionData.length;
    
    const maxRate = Math.max(...productionData.map(d => d.actualRate));
    const minRate = Math.min(...productionData.filter(d => d.isRunning).map(d => d.actualRate));

    // Formater pour le graphique
    const chartData = productionData.map(d => ({
      timestamp: d.timestamp,
      time: new Date(d.timestamp).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      actual: d.actualRate,
      target: d.targetRate,
      bottlesProduced: d.bottlesProduced,
      defectCount: d.defectCount,
      isRunning: d.isRunning
    }));

    return NextResponse.json({
      data: chartData,
      summary: {
        period: `${periodMinutes} minutes`,
        totalProduced,
        totalDefects,
        avgRate: Math.round(avgRate * 10) / 10,
        maxRate,
        minRate,
        defectRate: totalProduced > 0 ? ((totalDefects / totalProduced) * 100).toFixed(2) : 0,
        dataPoints: productionData.length
      }
    });

  } catch (error) {
    console.error('Erreur API /api/production/history:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}