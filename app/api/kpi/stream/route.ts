// app/api/kpi/stream/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Fonction pour envoyer des données
      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Fonction pour récupérer les KPIs
      const fetchKPIs = async () => {
        try {
          // Dernières données de production
          const latestProduction = await prisma.productionData.findFirst({
            where: {
              timestamp: {
                gte: new Date(Date.now() - 5 * 60 * 1000) // Dernières 5 minutes
              }
            },
            orderBy: { timestamp: 'desc' }
          });

          // Dernier snapshot KPI
          const latestKPI = await prisma.kPISnapshot.findFirst({
            where: { period: 'current' },
            orderBy: { timestamp: 'desc' }
          });

          // Alertes actives
          const activeAlerts = await prisma.alert.count({
            where: { isResolved: false }
          });

          // Temps d'arrêt actifs
          const activeDowntime = await prisma.downtime.count({
            where: { resolved: false }
          });

          return {
            timestamp: new Date().toISOString(),
            production: {
              bottlesProduced: latestProduction?.bottlesProduced || 0,
              actualRate: latestProduction?.actualRate || 0,
              targetRate: latestProduction?.targetRate || 120,
              isRunning: latestProduction?.isRunning || false,
              temperature: latestProduction?.temperature,
              pressure: latestProduction?.pressure
            },
            kpi: {
              trs: latestKPI?.trs || 0,
              availability: latestKPI?.availability || 0,
              performance: latestKPI?.performance || 0,
              quality: latestKPI?.quality || 0
            },
            alerts: {
              active: activeAlerts,
              downtime: activeDowntime
            }
          };
        } catch (error) {
          console.error('Erreur récupération KPIs:', error);
          return null;
        }
      };

      // Envoyer les données toutes les 5 secondes
      const interval = setInterval(async () => {
        const kpiData = await fetchKPIs();
        if (kpiData) {
          sendEvent(kpiData);
        }
      }, 5000);

      // Envoyer immédiatement la première fois
      const initialData = await fetchKPIs();
      if (initialData) {
        sendEvent(initialData);
      }

      // Nettoyer l'intervalle quand la connexion est fermée
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
