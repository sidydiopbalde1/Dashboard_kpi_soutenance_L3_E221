// app/api/mqtt/test/logs/route.ts
import { NextRequest } from 'next/server';

// Store pour les connexions SSE actives
const sseConnections = new Set<ReadableStreamDefaultController>();

// Store pour les logs récents
let recentLogs: string[] = [];
const MAX_LOGS = 100;

export async function GET(request: NextRequest) {
  // Configuration Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Ajouter cette connexion au store
      sseConnections.add(controller);
      
      // Envoyer les logs récents
      recentLogs.forEach(log => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'log', message: log })}\n\n`);
        } catch (error) {
          console.error('Erreur envoi log SSE:', error);
        }
      });

      // Heartbeat pour maintenir la connexion
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
          sseConnections.delete(controller);
        }
      }, 30000);

      // Nettoyer à la déconnexion
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        sseConnections.delete(controller);
        try {
          controller.close();
        } catch (error) {
          // Connexion déjà fermée
        }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Fonction pour broadcaster un log à toutes les connexions
export function broadcastLog(message: string) {
  // Ajouter aux logs récents
  recentLogs.push(message);
  if (recentLogs.length > MAX_LOGS) {
    recentLogs = recentLogs.slice(-MAX_LOGS);
  }

  // Envoyer à toutes les connexions actives
  const deadConnections: ReadableStreamDefaultController[] = [];
  
  sseConnections.forEach(controller => {
    try {
      controller.enqueue(`data: ${JSON.stringify({ 
        type: 'log', 
        message, 
        timestamp: Date.now() 
      })}\n\n`);
    } catch (error) {
      deadConnections.push(controller);
    }
  });

  // Nettoyer les connexions mortes
  deadConnections.forEach(controller => {
    sseConnections.delete(controller);
  });
}

// Fonction pour broadcaster des données MQTT
export function broadcastMqttData(data: any) {
  const deadConnections: ReadableStreamDefaultController[] = [];
  
  sseConnections.forEach(controller => {
    try {
      controller.enqueue(`data: ${JSON.stringify({ 
        type: 'mqtt-data', 
        data, 
        timestamp: Date.now() 
      })}\n\n`);
    } catch (error) {
      deadConnections.push(controller);
    }
  });

  deadConnections.forEach(controller => {
    sseConnections.delete(controller);
  });
}