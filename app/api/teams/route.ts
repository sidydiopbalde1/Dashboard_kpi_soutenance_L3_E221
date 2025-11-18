// app/api/teams/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission, AuthenticatedRequest } from '@/lib/api-middleware';

const prisma = new PrismaClient();

export const GET = withPermission('teams', 'read', async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const shift = searchParams.get('shift');

    const where: any = { isActive: true };
    if (shift && shift !== 'all') {
      where.shift = shift;
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: [
        { shift: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Métriques d'équipe
    const allEmployees = await prisma.employee.findMany({ where: { isActive: true } });

    const avgPerformance = allEmployees.reduce((sum, e) => sum + (e.performanceScore || 0), 0) / allEmployees.length;
    const avgEfficiency = allEmployees.reduce((sum, e) => sum + (e.efficiencyScore || 0), 0) / allEmployees.length;
    const avgQuality = allEmployees.reduce((sum, e) => sum + (e.qualityScore || 0), 0) / allEmployees.length;
    const avgSafety = allEmployees.reduce((sum, e) => sum + (e.safetyScore || 0), 0) / allEmployees.length;

    const metrics = {
      totalEmployees: allEmployees.length,
      byShift: {
        MATIN: allEmployees.filter(e => e.shift === 'MATIN').length,
        APRES_MIDI: allEmployees.filter(e => e.shift === 'APRES_MIDI').length,
        NUIT: allEmployees.filter(e => e.shift === 'NUIT').length
      },
      avgPerformance: Math.round(avgPerformance * 10) / 10,
      avgEfficiency: Math.round(avgEfficiency * 10) / 10,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgSafety: Math.round(avgSafety * 10) / 10,
      topPerformers: allEmployees
        .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
        .slice(0, 5)
        .map(e => ({
          name: `${e.firstName} ${e.lastName}`,
          score: e.performanceScore
        }))
    };

    // Performance par shift
    const shiftPerformance = ['MATIN', 'APRES_MIDI', 'NUIT'].map(shiftName => {
      const shiftEmployees = allEmployees.filter(e => e.shift === shiftName);
      const avgPerf = shiftEmployees.reduce((sum, e) => sum + (e.performanceScore || 0), 0) / shiftEmployees.length || 0;
      const avgEff = shiftEmployees.reduce((sum, e) => sum + (e.efficiencyScore || 0), 0) / shiftEmployees.length || 0;
      const avgQual = shiftEmployees.reduce((sum, e) => sum + (e.qualityScore || 0), 0) / shiftEmployees.length || 0;

      return {
        shift: shiftName,
        performance: Math.round(avgPerf * 10) / 10,
        efficiency: Math.round(avgEff * 10) / 10,
        quality: Math.round(avgQual * 10) / 10,
        employees: shiftEmployees.length
      };
    });

    return NextResponse.json({
      employees: employees.map(e => ({
        id: e.id,
        employeeNumber: e.employeeNumber,
        name: `${e.firstName} ${e.lastName}`,
        firstName: e.firstName,
        lastName: e.lastName,
        role: e.role,
        shift: e.shift,
        workstation: e.workstation,
        skills: e.skills,
        certifications: e.certifications,
        performanceScore: e.performanceScore,
        efficiencyScore: e.efficiencyScore,
        qualityScore: e.qualityScore,
        safetyScore: e.safetyScore,
        experience: e.experience,
        lastTraining: e.lastTraining?.toISOString(),
        nextTraining: e.nextTraining?.toISOString()
      })),
      metrics,
      shiftPerformance
    });
  } catch (error) {
    console.error('Erreur API teams:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});
