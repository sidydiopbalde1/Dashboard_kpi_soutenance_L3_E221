// lib/mqtt-client.ts
import mqtt from 'mqtt';
import { prisma } from './db';

class MQTTClient {
  private client: mqtt.MqttClient | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Se connecter au broker MQTT
   */
  connect(brokerUrl: string, options?: { username?: string; password?: string }) {
    console.log('🔌 Tentative de connexion MQTT à:', brokerUrl);

    // Si déjà connecté, déconnecter d'abord
    if (this.client) {
      this.disconnect();
    }

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId: `dashboard-kpi-${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        username: options?.username || undefined,
        password: options?.password || undefined,
      });

      // Event: Connexion réussie
      this.client.on('connect', () => {
        console.log('✅ MQTT: Connecté avec succès à', brokerUrl);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribeToTopics();
      });

      // Event: Message reçu
      this.client.on('message', async (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log(`📨 MQTT Message reçu [${topic}]:`, data);
          await this.handleMessage(topic, data);
        } catch (error) {
          console.error('❌ Erreur traitement message MQTT:', error);
        }
      });

      // Event: Erreur
      this.client.on('error', (error) => {
        console.error('❌ MQTT Erreur:', error.message);
        this.isConnected = false;
      });

      // Event: Déconnexion
      this.client.on('close', () => {
        console.log('🔌 MQTT: Connexion fermée');
        this.isConnected = false;
      });

      // Event: Reconnexion
      this.client.on('reconnect', () => {
        this.reconnectAttempts++;
        console.log(`🔄 MQTT: Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('❌ MQTT: Nombre maximum de tentatives atteint');
          this.disconnect();
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la création du client MQTT:', error);
      throw error;
    }
  }

  /**
   * S'abonner aux topics
   */
  private subscribeToTopics() {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Client MQTT non connecté, impossible de s\'abonner');
      return;
    }

    const topics = [
      'production/+/data',      // Données de production
      'production/+/status',    // État des machines
      'production/+/alert',     // Alertes
      'production/#',           // Tout sous production (fallback)
    ];

    topics.forEach(topic => {
      this.client?.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Erreur abonnement au topic ${topic}:`, err);
        } else {
          console.log(`✅ Abonné au topic: ${topic}`);
        }
      });
    });
  }

  /**
   * Traiter les messages reçus
   */
  private async handleMessage(topic: string, data: any) {
    try {
      if (topic.includes('/data')) {
        await this.saveProductionData(data);
      } else if (topic.includes('/status')) {
        await this.updateMachineStatus(data);
      } else if (topic.includes('/alert')) {
        await this.createAlert(data);
      }
    } catch (error) {
      console.error('❌ Erreur handleMessage:', error);
    }
  }

  /**
   * Sauvegarder les données de production
   */
  private async saveProductionData(data: any) {
    try {
      const productionData = await prisma.productionData.create({
        data: {
          timestamp: new Date(data.timestamp || Date.now()),
          bottlesProduced: data.count || 0,
          targetRate: data.targetRate || 120,
          actualRate: data.rate || 0,
          defectCount: data.defects || 0,
          isRunning: data.running !== false,
          shiftId: this.getCurrentShift(),
          temperature: data.temperature || null,
          pressure: data.pressure || null,
        }
      });
      console.log('✅ Données de production sauvegardées:', productionData.id);
    } catch (error) {
      console.error('❌ Erreur sauvegarde production:', error);
    }
  }

  /**
   * Mettre à jour l'état de la machine
   */
  private async updateMachineStatus(data: any) {
    try {
      if (data.running === false) {
        // Créer un temps d'arrêt
        await prisma.downtime.create({
          data: {
            startTime: new Date(),
            reason: data.reason || 'PANNE',
            category: 'NON_PLANIFIE',
            description: data.message || 'Arrêt détecté via MQTT',
            resolved: false
          }
        });
        console.log('⚠️ Arrêt machine créé');
      } else {
        // Résoudre les arrêts en cours
        await prisma.downtime.updateMany({
          where: {
            endTime: null,
            resolved: false
          },
          data: {
            endTime: new Date(),
            resolved: true
          }
        });
        console.log('✅ Arrêts résolus');
      }
    } catch (error) {
      console.error('❌ Erreur update status:', error);
    }
  }

  /**
   * Créer une alerte
   */
  private async createAlert(data: any) {
    try {
      await prisma.alert.create({
        data: {
          timestamp: new Date(),
          type: data.type || 'QUALITY_ISSUE',
          severity: data.severity || 'MEDIUM',
          message: data.message || 'Alerte MQTT',
          threshold: data.threshold || null,
          actualValue: data.actualValue || null,
          isResolved: false
        }
      });
      console.log('⚠️ Alerte créée via MQTT');
    } catch (error) {
      console.error('❌ Erreur création alerte:', error);
    }
  }

  /**
   * Obtenir le shift actuel
   */
  private getCurrentShift(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'MATIN';
    if (hour >= 14 && hour < 22) return 'APRES_MIDI';
    return 'NUIT';
  }

  /**
   * Publier un message
   */
  publish(topic: string, message: any) {
    if (!this.client || !this.isConnected) {
      console.error('❌ Client MQTT non connecté');
      return false;
    }

    try {
      this.client.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
        if (error) {
          console.error('❌ Erreur publication MQTT:', error);
        } else {
          console.log(`📤 Message publié sur ${topic}`);
        }
      });
      return true;
    } catch (error) {
      console.error('❌ Erreur publish:', error);
      return false;
    }
  }

  /**
   * Déconnecter
   */
  disconnect() {
    if (this.client) {
      console.log('🔌 Déconnexion MQTT...');
      this.client.end(true);
      this.client = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      console.log('✅ MQTT déconnecté');
    }
  }

  /**
   * Vérifier si connecté
   */
  isClientConnected(): boolean {
    return this.isConnected && this.client !== null && this.client.connected;
  }

  /**
   * Obtenir des statistiques
   */
  getStats() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      hasClient: this.client !== null
    };
  }
}

// Singleton
let mqttClient: MQTTClient | null = null;

export function getMQTTClient(): MQTTClient {
  if (!mqttClient) {
    mqttClient = new MQTTClient();
  }
  return mqttClient;
}