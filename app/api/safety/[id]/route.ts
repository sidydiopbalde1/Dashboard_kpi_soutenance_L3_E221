import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPermission } from '@/lib/api-middleware';

const prisma = new PrismaClient();

// PUT - Mettre à jour un incident de sécurité
export const PUT = withPermission('safety', 'update', async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const data = await request.json();
    
    // Vérifier que l'incident existe
    const existingIncident = await prisma.safetyIncident.findUnique({
      where: { id: params.id }
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: 'Incident de sécurité non trouvé' },
        { status: 404 }
      );
    }

    const {
      status,
      rootCause,
      correctiveActions,
      investigator,
      daysLost,
      cost,
      closedAt
    } = data;

    // Construire les données de mise à jour
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (rootCause !== undefined) updateData.rootCause = rootCause;
    if (correctiveActions !== undefined) updateData.correctiveActions = correctiveActions;
    if (investigator !== undefined) updateData.investigator = investigator;
    if (daysLost !== undefined) updateData.daysLost = daysLost;
    if (cost !== undefined) updateData.cost = cost;
    
    // Si l'incident est fermé, ajouter la date de fermeture
    if (status === 'closed' && !existingIncident.closedAt) {
      updateData.closedAt = new Date();
    }
    if (closedAt) updateData.closedAt = new Date(closedAt);

    const updatedIncident = await prisma.safetyIncident.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'incident:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});

// DELETE - Supprimer un incident de sécurité
export const DELETE = withPermission('safety', 'delete', async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Vérifier que l'incident existe
    const existingIncident = await prisma.safetyIncident.findUnique({
      where: { id: params.id }
    });

    if (!existingIncident) {
      return NextResponse.json(
        { error: 'Incident de sécurité non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'incident
    await prisma.safetyIncident.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Incident de sécurité supprimé avec succès' }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'incident:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
});