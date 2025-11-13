// app/api/mqtt/connect/route.ts
import { NextResponse } from 'next/server';
import { getMQTTClient } from '@/lib/mqtt-client';

export const dynamic = 'force-dynamic';

/**
 * POST /api/mqtt/connect
 * Se connecter au broker MQTT
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brokerUrl, username, password } = body;

    if (!brokerUrl) {
      return NextResponse.json(
        { error: 'URL du broker MQTT requise' },
        { status: 400 }
      );
    }

    console.log('📡 Tentative de connexion MQTT à:', brokerUrl);

    const client = getMQTTClient();
    
    // Se connecter
    client.connect(brokerUrl, {
      username: username || undefined,
      password: password || undefined
    });

    // Attendre un peu pour vérifier la connexion
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isConnected = client.isClientConnected();

    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Connexion réussie' : 'Connexion en cours...',
      connected: isConnected
    });

  } catch (error: any) {
    console.error('❌ Erreur API connexion MQTT:', error);
    return NextResponse.json(
      { 
        error: 'Erreur de connexion',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mqtt/connect
 * Obtenir le statut de la connexion
 */
export async function GET() {
  try {
    const client = getMQTTClient();
    const stats = client.getStats();

    return NextResponse.json({
      connected: client.isClientConnected(),
      stats
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: 'Erreur lors de la vérification du statut'
    });
  }
}

/**
 * DELETE /api/mqtt/connect
 * Déconnecter
 */
export async function DELETE() {
  try {
    const client = getMQTTClient();
    client.disconnect();

    return NextResponse.json({
      success: true,
      message: 'Déconnecté avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}