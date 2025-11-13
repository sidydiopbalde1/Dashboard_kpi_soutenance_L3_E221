// lib/mqtt-service.ts
import mqtt from 'mqtt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductionMessage {
  timestamp: string;
  count: number;
  rate: number;
  targetRate: number;
  defects: number;
  running: boolean;
  temperature?: number;
  pressure?: number;
}

interface StatusMessage {
  running: boolean;
  reason?: string;
  message?: string;
}

class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

    console.log(`🔌 Connexion au broker MQTT: ${brokerUrl}`);

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId: `dashboard-server-${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('❌ Erreur connexion MQTT:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.on('connect', () => {
      console.log('✅ Connecté au broker MQTT');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // S'abonner aux topics
      this.client?.subscribe('production/+/data', { qos: 1 }, (err) => {
        if (err) {
          console.error('❌ Erreur souscription topic data:', err);
        } else {
          console.log('📡 Abonné au topic: production/+/data');
        }
      });

      this.client?.subscribe('production/+/status', { qos: 1 }, (err) => {
        if (err) {
          console.error('❌ Erreur souscription topic status:', err);
        } else {
          console.log('📡 Abonné au topic: production/+/status');
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        await this.handleMessage(topic, data);
      } catch (error) {
        console.error('❌ Erreur traitement message:', error);
      }
    });

    this.client.on('error', (error) => {
      console.error('❌ Erreur MQTT:', error);
      this.isConnected = false;
    });

    this.client.on('offline', () => {
      console.log('⚠️  Client MQTT hors ligne');
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      console.log(`🔄 Tentative de reconnexion (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
        this.client?.end();
      }
    });

    this.client.on('close', () => {
      console.log('🔌 Connexion MQTT fermée');
      this.isConnected = false;
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log('🔄 Nouvelle tentative de connexion...');
        this.connect();
      }, 10000); // Réessayer après 10 secondes
    }
  }

  private async handleMessage(topic: string, data: any) {
    console.log(`📥 Message reçu sur ${topic}:`, data);

    if (topic.endsWith('/data')) {
      await this.handleProductionData(data as ProductionMessage);
    } else if (topic.endsWith('/status')) {
      await this.handleStatusUpdate(data as StatusMessage);
    }
  }

  private async handleProductionData(data: ProductionMessage) {
    try {
      // Déterminer le shift actuel
      const now = new Date();
      const hour = now.getHours();
      let shift = 'NUIT';
      if (hour >= 6 && hour < 14) shift = 'MATIN';
      else if (hour >= 14 && hour < 22) shift = 'APRES_MIDI';

      // Enregistrer les données de production
      const productionRecord = await prisma.productionData.create({
        data: {
          timestamp: new Date(data.timestamp),
          bottlesProduced: data.count,
          targetRate: data.targetRate,
          actualRate: data.rate,
          defectCount: data.defects,
          isRunning: data.running,
          shiftId: shift,
          temperature: data.temperature || null,
          pressure: data.pressure || null,
        }
      });

      console.log(`✅ Données production enregistrées: ${data.count} bouteilles, cadence ${data.rate} b/min`);

      // Créer une alerte si nécessaire
      await this.checkAndCreateAlerts(data);

      // Mettre à jour les KPIs
      await this.updateKPISnapshots();

    } catch (error) {
      console.error('❌ Erreur enregistrement données production:', error);
    }
  }

  private async handleStatusUpdate(data: StatusMessage) {
    try {
      if (!data.running && data.reason) {
        // Créer un enregistrement de temps d'arrêt
        const downtime = await prisma.downtime.create({
          data: {
            startTime: new Date(),
            reason: data.reason,
            category: this.categorizeDowntime(data.reason),
            description: data.message || '',
            resolved: false
          }
        });

        console.log(`⏸️  Arrêt enregistré: ${data.reason}`);

        // Créer une alerte
        await prisma.alert.create({
          data: {
            timestamp: new Date(),
            type: 'error',
            severity: 'high',
            message: `Arrêt machine: ${data.message || data.reason}`,
            isResolved: false
          }
        });
      } else if (data.running) {
        // Résoudre les temps d'arrêt actifs
        const activeDowntimes = await prisma.downtime.findMany({
          where: { resolved: false }
        });

        for (const dt of activeDowntimes) {
          const duration = Math.floor((Date.now() - dt.startTime.getTime()) / 60000);
          await prisma.downtime.update({
            where: { id: dt.id },
            data: {
              endTime: new Date(),
              duration,
              resolved: true
            }
          });
        }

        console.log(`✅ Machine redémarrée, ${activeDowntimes.length} arrêt(s) résolu(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur traitement statut:', error);
    }
  }

  private categorizeDowntime(reason: string): string {
    const reasonLower = reason.toLowerCase();

    if (reasonLower.includes('panne') || reasonLower.includes('breakdown')) {
      return 'breakdown';
    } else if (reasonLower.includes('changement') || reasonLower.includes('setup')) {
      return 'changeover';
    } else if (reasonLower.includes('maintenance')) {
      return 'maintenance';
    } else if (reasonLower.includes('matière') || reasonLower.includes('material')) {
      return 'material';
    }

    return 'other';
  }

  private async checkAndCreateAlerts(data: ProductionMessage) {
    try {
      // Récupérer les seuils d'alerte actifs
      const thresholds = await prisma.alertThreshold.findMany({
        where: { isActive: true }
      });

      for (const threshold of thresholds) {
        let shouldAlert = false;
        let message = '';
        let actualValue: number | null = null;

        switch (threshold.kpiType) {
          case 'CADENCE':
            if (threshold.minValue && data.rate < threshold.minValue) {
              shouldAlert = true;
              message = `Cadence inférieure au seuil: ${data.rate} b/min (seuil: ${threshold.minValue})`;
              actualValue = data.rate;
            }
            break;

          case 'TEMPERATURE':
            if (data.temperature && threshold.maxValue && data.temperature > threshold.maxValue) {
              shouldAlert = true;
              message = `Température élevée: ${data.temperature}°C (max: ${threshold.maxValue})`;
              actualValue = data.temperature;
            }
            break;

          case 'DEFECT_RATE':
            if (data.count > 0) {
              const defectRate = (data.defects / data.count) * 100;
              if (threshold.maxValue && defectRate > threshold.maxValue) {
                shouldAlert = true;
                message = `Taux de défauts élevé: ${defectRate.toFixed(2)}% (max: ${threshold.maxValue}%)`;
                actualValue = defectRate;
              }
            }
            break;
        }

        if (shouldAlert) {
          // Vérifier si une alerte similaire existe déjà (dernières 10 minutes)
          const recentAlert = await prisma.alert.findFirst({
            where: {
              type: threshold.kpiType.toLowerCase(),
              timestamp: {
                gte: new Date(Date.now() - 10 * 60 * 1000)
              },
              isResolved: false
            }
          });

          if (!recentAlert) {
            await prisma.alert.create({
              data: {
                timestamp: new Date(),
                type: 'warning',
                severity: threshold.severity.toLowerCase(),
                message,
                threshold: threshold.minValue || threshold.maxValue,
                actualValue,
                isResolved: false
              }
            });

            console.log(`🚨 Alerte créée: ${message}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur vérification alertes:', error);
    }
  }

  private async updateKPISnapshots() {
    try {
      // Récupérer les données des 8 dernières heures
      const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

      const productionData = await prisma.productionData.findMany({
        where: {
          timestamp: { gte: eightHoursAgo }
        }
      });

      if (productionData.length === 0) return;

      // Calculer les métriques
      const totalProduced = productionData.reduce((sum, d) => sum + d.bottlesProduced, 0);
      const totalDefects = productionData.reduce((sum, d) => sum + d.defectCount, 0);
      const runningMinutes = productionData.filter(d => d.isRunning).length;
      const totalMinutes = productionData.length;

      const availability = (runningMinutes / totalMinutes) * 100;
      const performance = (totalProduced / (120 * totalMinutes)) * 100;
      const quality = totalProduced > 0 ? ((totalProduced - totalDefects) / totalProduced) * 100 : 100;
      const trs = (availability * performance * quality) / 10000;

      // Récupérer le total des temps d'arrêt
      const downtimes = await prisma.downtime.findMany({
        where: {
          startTime: { gte: eightHoursAgo }
        }
      });

      const totalDowntime = downtimes.reduce((sum, dt) => {
        if (dt.duration) return sum + dt.duration;
        if (dt.endTime) {
          return sum + Math.floor((dt.endTime.getTime() - dt.startTime.getTime()) / 60000);
        }
        return sum + Math.floor((Date.now() - dt.startTime.getTime()) / 60000);
      }, 0);

      // Mettre à jour ou créer le snapshot actuel
      const existingSnapshot = await prisma.kPISnapshot.findFirst({
        where: { period: 'current' },
        orderBy: { timestamp: 'desc' }
      });

      if (existingSnapshot) {
        await prisma.kPISnapshot.update({
          where: { id: existingSnapshot.id },
          data: {
            timestamp: new Date(),
            trs: Math.round(trs * 10) / 10,
            availability: Math.round(availability * 10) / 10,
            performance: Math.round(performance * 10) / 10,
            quality: Math.round(quality * 10) / 10,
            totalProduced,
            totalDefects,
            totalDowntime,
            oee: Math.round(trs * 10) / 10
          }
        });
      } else {
        await prisma.kPISnapshot.create({
          data: {
            period: 'current',
            trs: Math.round(trs * 10) / 10,
            availability: Math.round(availability * 10) / 10,
            performance: Math.round(performance * 10) / 10,
            quality: Math.round(quality * 10) / 10,
            totalProduced,
            totalDefects,
            totalDowntime,
            oee: Math.round(trs * 10) / 10,
            shiftId: 'CURRENT'
          }
        });
      }

      console.log(`📈 KPIs mis à jour: TRS=${trs.toFixed(1)}%`);
    } catch (error) {
      console.error('❌ Erreur mise à jour KPIs:', error);
    }
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }

  public disconnect() {
    if (this.client) {
      console.log('👋 Déconnexion du broker MQTT...');
      this.client.end();
      this.client = null;
      this.isConnected = false;
    }
  }
}

// Singleton instance
let mqttServiceInstance: MQTTService | null = null;

export function getMQTTService(): MQTTService {
  if (!mqttServiceInstance) {
    mqttServiceInstance = new MQTTService();
  }
  return mqttServiceInstance;
}

export function disconnectMQTT() {
  if (mqttServiceInstance) {
    mqttServiceInstance.disconnect();
    mqttServiceInstance = null;
  }
}
