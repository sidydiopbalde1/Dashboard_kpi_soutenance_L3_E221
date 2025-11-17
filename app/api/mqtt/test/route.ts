// app/api/mqtt/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { broadcastLog, broadcastMqttData } from './logs/route';

// Store pour gérer les processus actifs
const activeProcesses = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'start') {
      return startMQTTTest();
    } else if (action === 'stop') {
      return stopMQTTTest();
    } else {
      return NextResponse.json(
        { error: 'Action invalide. Utilisez "start" ou "stop"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erreur dans MQTT test API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Retourner le statut des processus actifs
    const status = Array.from(activeProcesses.entries()).map(([id, process]) => ({
      id,
      pid: process.pid,
      running: !process.killed
    }));

    return NextResponse.json({ 
      running: activeProcesses.size > 0,
      processes: status
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du statut' },
      { status: 500 }
    );
  }
}

function startMQTTTest() {
  try {
    // Vérifier si un processus est déjà en cours
    if (activeProcesses.size > 0) {
      return NextResponse.json(
        { 
          error: 'Un test MQTT est déjà en cours',
          running: true 
        },
        { status: 409 }
      );
    }

    // Vérifier l'existence du wrapper script
    const wrapperPath = path.join(process.cwd(), 'run-mqtt-test.sh');
    const scriptPath = path.join(process.cwd(), 'test-mqtt.py');
    
    let command: string;
    let args: string[];
    
    // Essayer d'abord le wrapper, puis python3 direct
    try {
      require('fs').accessSync(wrapperPath, require('fs').constants.F_OK);
      command = 'bash';
      args = [wrapperPath];
      broadcastLog(`🔧 Utilisation du wrapper script: ${wrapperPath}`);
    } catch {
      command = 'python3';
      args = [scriptPath];
      broadcastLog(`🐍 Utilisation directe de python3: ${scriptPath}`);
    }
    
    // Démarrer le processus avec environnement nettoyé
    const pythonProcess = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        // Créer un environnement minimal
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        USER: process.env.USER,
        TERM: process.env.TERM || 'xterm-256color',
        LANG: process.env.LANG || 'en_US.UTF-8',
        // Exclure les variables problématiques
        // NODE_OPTIONS, VSCODE_INJECTION, ELECTRON_RUN_AS_NODE sont omises
      }
    });

    const processId = `mqtt-test-${Date.now()}`;
    activeProcesses.set(processId, pythonProcess);

    // Log de démarrage
    broadcastLog(`🚀 Démarrage du test MQTT (PID: ${pythonProcess.pid})`);

    // Gérer les événements du processus
    pythonProcess.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`[MQTT Test stdout]: ${output}`);
      
      // Broadcaster le log via SSE
      broadcastLog(`📤 ${output}`);
      
      // Tenter de parser les données MQTT si c'est du JSON
      try {
        const lines = output.split('\n');
        lines.forEach(line => {
          if (line.includes('{') && line.includes('}')) {
            const jsonMatch = line.match(/\{.*\}/);
            if (jsonMatch) {
              const mqttData = JSON.parse(jsonMatch[0]);
              broadcastMqttData(mqttData);
            }
          }
        });
      } catch (error) {
        // Pas du JSON valide, on ignore
      }
    });

    pythonProcess.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      console.error(`[MQTT Test stderr]: ${output}`);
      
      // Broadcaster l'erreur via SSE
      broadcastLog(`❌ Erreur: ${output}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`[MQTT Test] Processus terminé avec le code ${code}`);
      broadcastLog(`🛑 Test MQTT terminé (code: ${code})`);
      activeProcesses.delete(processId);
    });

    pythonProcess.on('error', (error) => {
      console.error(`[MQTT Test] Erreur processus:`, error);
      broadcastLog(`💥 Erreur processus: ${error.message}`);
      activeProcesses.delete(processId);
    });

    return NextResponse.json({
      success: true,
      message: 'Test MQTT démarré avec succès',
      processId,
      pid: pythonProcess.pid
    });

  } catch (error) {
    console.error('Erreur lors du démarrage du test MQTT:', error);
    return NextResponse.json(
      { error: `Erreur lors du démarrage: ${error}` },
      { status: 500 }
    );
  }
}

function stopMQTTTest() {
  try {
    if (activeProcesses.size === 0) {
      return NextResponse.json(
        { 
          message: 'Aucun test MQTT en cours',
          running: false 
        }
      );
    }

    // Arrêter tous les processus actifs
    let stoppedCount = 0;
    for (const [processId, process] of activeProcesses.entries()) {
      if (process && !process.killed) {
        process.kill('SIGTERM');
        stoppedCount++;
        
        // Forcer l'arrêt après 5 secondes si nécessaire
        setTimeout(() => {
          if (!process.killed) {
            process.kill('SIGKILL');
          }
        }, 5000);
      }
      activeProcesses.delete(processId);
    }

    return NextResponse.json({
      success: true,
      message: `${stoppedCount} processus MQTT arrêté(s)`,
      stopped: stoppedCount
    });

  } catch (error) {
    console.error('Erreur lors de l\'arrêt du test MQTT:', error);
    return NextResponse.json(
      { error: `Erreur lors de l'arrêt: ${error}` },
      { status: 500 }
    );
  }
}