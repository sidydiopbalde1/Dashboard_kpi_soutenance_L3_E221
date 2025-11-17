import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/api-middleware';

const prisma = new PrismaClient();

// GET - Récupérer une tâche de maintenance par ID
export const GET = withPermission('maintenance', 'read', async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const task = await prisma.maintenanceTask.findUnique({
      where: { id: params.id },
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

    if (!task) {
      return NextResponse.json(
        { error: 'Tâche de maintenance non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

// PUT - Mettre à jour une tâche de maintenance
export const PUT = withPermission('maintenance', 'update', async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const data = await request.json();
    
    // Vérifier que la tâche existe
    const existingTask = await prisma.maintenanceTask.findUnique({
      where: { id: params.id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tâche de maintenance non trouvée' },
        { status: 404 }
      );
    }

    const {
      status,
      actualDuration,
      cost,
      spareParts,
      comments,
      completedAt,
      startedAt,
      correctedAction
    } = data;

    // Construire les données de mise à jour
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (actualDuration !== undefined) updateData.actualDuration = actualDuration;
    if (cost !== undefined) updateData.cost = cost;
    if (spareParts !== undefined) updateData.spareParts = spareParts;
    if (comments !== undefined) updateData.comments = comments;
    if (correctedAction !== undefined) updateData.correctedAction = correctedAction;
    
    // Gérer les timestamps
    if (status === 'in_progress' && !existingTask.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'completed' && !existingTask.completedAt) {
      updateData.completedAt = new Date();
    }
    if (startedAt) updateData.startedAt = new Date(startedAt);
    if (completedAt) updateData.completedAt = new Date(completedAt);

    const updatedTask = await prisma.maintenanceTask.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

// DELETE - Supprimer une tâche de maintenance
export const DELETE = withPermission('maintenance', 'delete', async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Vérifier que la tâche existe
    const existingTask = await prisma.maintenanceTask.findUnique({
      where: { id: params.id }
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Tâche de maintenance non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer la tâche
    await prisma.maintenanceTask.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Tâche de maintenance supprimée avec succès' }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});