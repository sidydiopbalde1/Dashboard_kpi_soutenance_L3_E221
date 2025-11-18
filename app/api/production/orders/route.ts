// app/api/production/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const line = searchParams.get('line');

    // Construire les filtres
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (line && line !== 'all') {
      where.line = line;
    }

    // Récupérer les ordres de production
    const orders = await prisma.productionOrder.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { startTime: 'desc' }
      ]
    });

    // Calculer les métriques globales
    const allOrders = await prisma.productionOrder.findMany();

    const totalProduced = allOrders.reduce((sum, o) => sum + o.produced, 0);
    const targetProduction = allOrders.reduce((sum, o) => sum + o.quantity, 0);
    const efficiency = targetProduction > 0 ? (totalProduced / targetProduction) * 100 : 0;

    // Calculer OEE (Overall Equipment Effectiveness)
    const completedOrders = allOrders.filter(o => o.status === 'completed' && o.startTime && o.endTime);

    let totalAvailability = 0;
    let totalPerformance = 0;
    let totalQuality = 0;

    completedOrders.forEach(order => {
      if (order.startTime && order.endTime) {
        const actualTime = (order.endTime.getTime() - order.startTime.getTime()) / 60000; // minutes
        const plannedProductionTime = actualTime - order.downtime;
        const availability = actualTime > 0 ? (plannedProductionTime / actualTime) * 100 : 0;

        const idealTime = (order.quantity / order.targetRate); // minutes
        const performance = plannedProductionTime > 0 ? (idealTime / plannedProductionTime) * 100 : 0;

        // Assuming quality is near perfect for completed orders
        const quality = 98;

        totalAvailability += availability;
        totalPerformance += performance;
        totalQuality += quality;
      }
    });

    const avgAvailability = completedOrders.length > 0 ? totalAvailability / completedOrders.length : 0;
    const avgPerformance = completedOrders.length > 0 ? totalPerformance / completedOrders.length : 0;
    const avgQuality = completedOrders.length > 0 ? totalQuality / completedOrders.length : 0;

    const oee = (avgAvailability * avgPerformance * avgQuality) / 10000;

    // Cadence moyenne
    const runningOrders = allOrders.filter(o => o.actualRate && o.actualRate > 0);
    const averageRate = runningOrders.length > 0
      ? runningOrders.reduce((sum, o) => sum + (o.actualRate || 0), 0) / runningOrders.length
      : 0;

    // Temps de setup total
    const setupTime = allOrders.reduce((sum, o) => sum + (o.setupTime || 0), 0);

    const metrics = {
      totalProduced,
      targetProduction,
      efficiency: Math.round(efficiency * 10) / 10,
      oee: Math.round(oee * 10) / 10,
      availability: Math.round(avgAvailability * 10) / 10,
      performance: Math.round(avgPerformance * 10) / 10,
      quality: Math.round(avgQuality * 10) / 10,
      averageRate: Math.round(averageRate * 10) / 10,
      setupTime,
      activeOrders: allOrders.filter(o => o.status === 'running').length,
      completedOrders: allOrders.filter(o => o.status === 'completed').length,
      waitingOrders: allOrders.filter(o => o.status === 'waiting').length,
      pausedOrders: allOrders.filter(o => o.status === 'paused').length
    };

    // Répartition par ligne
    const lineProduction: any = {};
    allOrders.forEach(order => {
      if (!lineProduction[order.line]) {
        lineProduction[order.line] = {
          produced: 0,
          target: 0,
          orders: 0
        };
      }
      lineProduction[order.line].produced += order.produced;
      lineProduction[order.line].target += order.quantity;
      lineProduction[order.line].orders++;
    });

    const productionByLine = Object.keys(lineProduction).map(line => ({
      line,
      produced: lineProduction[line].produced,
      target: lineProduction[line].target,
      efficiency: Math.round((lineProduction[line].produced / lineProduction[line].target) * 100),
      orders: lineProduction[line].orders
    }));

    // Mix produits
    const productMix: any = {};
    allOrders.forEach(order => {
      productMix[order.productType] = (productMix[order.productType] || 0) + order.produced;
    });

    const productionMix = Object.keys(productMix).map(product => ({
      name: product,
      value: productMix[product],
      percentage: Math.round((productMix[product] / totalProduced) * 100)
    })).sort((a, b) => b.value - a.value);

    // Statuts
    const statusDistribution = [
      { name: 'En cours', value: allOrders.filter(o => o.status === 'running').length, color: '#10B981' },
      { name: 'Terminé', value: allOrders.filter(o => o.status === 'completed').length, color: '#3B82F6' },
      { name: 'En attente', value: allOrders.filter(o => o.status === 'waiting').length, color: '#F59E0B' },
      { name: 'En pause', value: allOrders.filter(o => o.status === 'paused').length, color: '#EF4444' }
    ];

    // OEE détaillé (composants)
    const oeeComponents = [
      { name: 'Disponibilité', value: Math.round(avgAvailability * 10) / 10, target: 90 },
      { name: 'Performance', value: Math.round(avgPerformance * 10) / 10, target: 95 },
      { name: 'Qualité', value: Math.round(avgQuality * 10) / 10, target: 99 }
    ];

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        product: o.productType,
        quantity: o.quantity,
        produced: o.produced,
        progress: Math.round((o.produced / o.quantity) * 100),
        targetRate: o.targetRate,
        actualRate: o.actualRate,
        startTime: o.startTime?.toISOString(),
        endTime: o.endTime?.toISOString(),
        estimatedEndTime: o.estimatedEndTime.toISOString(),
        status: o.status,
        priority: o.priority,
        line: o.line,
        operator: o.operator,
        shift: o.shift,
        customer: o.customer,
        setupTime: o.setupTime,
        downtime: o.downtime,
        comments: o.comments
      })),
      metrics,
      productionByLine,
      productionMix,
      statusDistribution,
      oeeComponents
    });
  } catch (error) {
    console.error('Erreur API production orders:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
