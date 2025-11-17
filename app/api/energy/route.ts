// app/api/energy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/api-middleware';

const prisma = new PrismaClient();

export const GET = withPermission('energy', 'read', async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';

    // Déterminer la plage de dates
    let hoursAgo = 24;
    if (period === '7d') hoursAgo = 24 * 7;
    if (period === '30d') hoursAgo = 24 * 30;

    const startDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    const energyData = await prisma.energyConsumption.findMany({
      where: {
        timestamp: { gte: startDate }
      },
      include: {
        equipment: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Métriques
    const totalConsumption = energyData.reduce((sum, d) => sum + d.consumption, 0);
    const totalCost = energyData.reduce((sum, d) => sum + (d.cost || 0), 0);
    const avgEfficiency = energyData.reduce((sum, d) => sum + (d.efficiency || 0), 0) / energyData.length;
    const totalCarbonFootprint = energyData.reduce((sum, d) => sum + (d.carbonFootprint || 0), 0);

    // Pic de demande
    const peakDemand = Math.max(...energyData.map(d => d.consumption));

    // Consommation actuelle (dernière donnée)
    const currentConsumption = energyData.length > 0 ? energyData[energyData.length - 1].consumption : 0;

    const metrics = {
      currentConsumption: Math.round(currentConsumption * 10) / 10,
      totalConsumption: Math.round(totalConsumption * 10) / 10,
      totalCost: Math.round(totalCost * 100) / 100,
      avgEfficiency: Math.round(avgEfficiency * 10) / 10,
      totalCarbonFootprint: Math.round(totalCarbonFootprint * 10) / 10,
      peakDemand: Math.round(peakDemand * 10) / 10,
      avgCostPerKWh: totalConsumption > 0 ? Math.round((totalCost / totalConsumption) * 1000) / 1000 : 0
    };

    // Consommation par équipement
    const byEquipment: any = {};
    energyData.forEach(d => {
      if (d.equipment) {
        if (!byEquipment[d.equipment.name]) {
          byEquipment[d.equipment.name] = {
            consumption: 0,
            cost: 0,
            count: 0
          };
        }
        byEquipment[d.equipment.name].consumption += d.consumption;
        byEquipment[d.equipment.name].cost += d.cost || 0;
        byEquipment[d.equipment.name].count++;
      }
    });

    const consumptionByEquipment = Object.keys(byEquipment).map(name => ({
      equipment: name,
      consumption: Math.round(byEquipment[name].consumption * 10) / 10,
      cost: Math.round(byEquipment[name].cost * 100) / 100,
      avgConsumption: Math.round((byEquipment[name].consumption / byEquipment[name].count) * 10) / 10
    })).sort((a, b) => b.consumption - a.consumption);

    // Tendance temporelle (par heure ou par jour selon la période)
    const timeFormat = period === '24h' ? 'hour' : 'day';
    const timeSeries: any = {};

    energyData.forEach(d => {
      const key = timeFormat === 'hour'
        ? d.timestamp.toISOString().substring(0, 13) // YYYY-MM-DDTHH
        : d.timestamp.toISOString().substring(0, 10); // YYYY-MM-DD

      if (!timeSeries[key]) {
        timeSeries[key] = {
          consumption: 0,
          cost: 0,
          efficiency: 0,
          count: 0
        };
      }
      timeSeries[key].consumption += d.consumption;
      timeSeries[key].cost += d.cost || 0;
      timeSeries[key].efficiency += d.efficiency || 0;
      timeSeries[key].count++;
    });

    const trend = Object.keys(timeSeries).map(key => ({
      time: timeFormat === 'hour' ? key.substring(11) : key,
      consumption: Math.round(timeSeries[key].consumption * 10) / 10,
      cost: Math.round(timeSeries[key].cost * 100) / 100,
      efficiency: Math.round((timeSeries[key].efficiency / timeSeries[key].count) * 10) / 10
    }));

    // Répartition heures pleines/creuses
    const peakData = energyData.filter(d => d.tariffPeriod === 'peak');
    const offPeakData = energyData.filter(d => d.tariffPeriod === 'off_peak');

    const tariffDistribution = [
      {
        name: 'Heures pleines',
        consumption: Math.round(peakData.reduce((sum, d) => sum + d.consumption, 0) * 10) / 10,
        cost: Math.round(peakData.reduce((sum, d) => sum + (d.cost || 0), 0) * 100) / 100,
        color: '#EF4444'
      },
      {
        name: 'Heures creuses',
        consumption: Math.round(offPeakData.reduce((sum, d) => sum + d.consumption, 0) * 10) / 10,
        cost: Math.round(offPeakData.reduce((sum, d) => sum + (d.cost || 0), 0) * 100) / 100,
        color: '#10B981'
      }
    ];

    return NextResponse.json({
      metrics,
      consumptionByEquipment,
      trend,
      tariffDistribution
    });
  } catch (error) {
    console.error('Erreur API energy:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});
