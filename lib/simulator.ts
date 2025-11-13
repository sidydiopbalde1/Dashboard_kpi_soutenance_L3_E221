// Simulateur IoT pour ligne d'embouteillage

import { ShiftId, ProductionPoint } from '@/types';

export class ProductionSimulator {
  private isRunning: boolean = true;
  private currentRate: number = 120;
  private readonly targetRate: number = 120;
  private readonly minRate: number = 100;
  private readonly maxRate: number = 130;
  
  // Probabilités
  private readonly defectProbability: number = 0.02; // 2% de défauts
  private readonly downtimeProbability: number = 0.03; // 3% de chance d'arrêt
  private readonly qualityIssueProbability: number = 0.01; // 1% de problème qualité
  
  // État interne
  private downtimeRemaining: number = 0;
  private consecutiveDefects: number = 0;

  constructor() {
    console.log('🏭 Simulateur de production initialisé');
  }

  /**
   * Génère un point de données de production
   */
  generateData(): ProductionPoint {
    // Gestion des arrêts
    if (this.downtimeRemaining > 0) {
      this.downtimeRemaining--;
      this.isRunning = false;
      this.currentRate = 0;
    } else if (!this.isRunning) {
      // Redémarrage progressif
      this.isRunning = true;
      this.currentRate = Math.floor(this.targetRate * 0.7);
    } else {
      // Simulation d'un arrêt aléatoire
      if (Math.random() < this.downtimeProbability) {
        this.triggerDowntime();
      }
    }

    // Variation de la cadence (simulation réaliste)
    if (this.isRunning) {
      this.currentRate = this.simulateRateVariation();
    }

    // Calcul de la production dans l'intervalle (1 seconde)
    const bottlesProduced = Math.floor(this.currentRate / 60);

    // Simulation des défauts
    const defectCount = this.simulateDefects(bottlesProduced);

    return {
      timestamp: new Date(),
      actualRate: this.currentRate,
      targetRate: this.targetRate,
      bottlesProduced,
      defectCount,
      isRunning: this.isRunning
    };
  }

  /**
   * Simule une variation naturelle de la cadence
   */
  private simulateRateVariation(): number {
    // Variation aléatoire ±10 bouteilles/min
    const variation = Math.floor(Math.random() * 21) - 10;
    let newRate = this.currentRate + variation;

    // Contraintes min/max
    newRate = Math.max(this.minRate, Math.min(this.maxRate, newRate));

    // Tendance à revenir vers le target
    const targetGap = this.targetRate - newRate;
    if (Math.abs(targetGap) > 5) {
      newRate += Math.sign(targetGap) * 2;
    }

    return newRate;
  }

  /**
   * Simule la génération de défauts
   */
  private simulateDefects(bottlesProduced: number): number {
    let defects = 0;

    for (let i = 0; i < bottlesProduced; i++) {
      if (Math.random() < this.defectProbability) {
        defects++;
        this.consecutiveDefects++;
      }
    }

    // Problème qualité prolongé (rare)
    if (Math.random() < this.qualityIssueProbability) {
      defects += Math.floor(Math.random() * 5) + 3; // 3-7 défauts supplémentaires
      this.consecutiveDefects += defects;
    }

    // Réinitialisation après correction
    if (defects === 0 && this.consecutiveDefects > 0) {
      this.consecutiveDefects = Math.max(0, this.consecutiveDefects - 1);
    }

    return defects;
  }

  /**
   * Déclenche un arrêt de production
   */
  private triggerDowntime(): void {
    // Durée d'arrêt aléatoire: 30 secondes à 5 minutes
    const downtimeDuration = Math.floor(Math.random() * 270) + 30;
    this.downtimeRemaining = downtimeDuration;
    this.isRunning = false;
    this.currentRate = 0;
    
    console.log(`⚠️ Arrêt de production: ${downtimeDuration}s`);
  }

  /**
   * Détermine le shift actuel
   */
  getCurrentShift(): ShiftId {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 14) {
      return 'MATIN';
    } else if (hour >= 14 && hour < 22) {
      return 'APRES_MIDI';
    } else {
      return 'NUIT';
    }
  }

  /**
   * Force un arrêt (pour tests)
   */
  forceDowntime(seconds: number): void {
    this.downtimeRemaining = seconds;
    this.isRunning = false;
  }

  /**
   * Force un redémarrage (pour tests)
   */
  forceRestart(): void {
    this.downtimeRemaining = 0;
    this.isRunning = true;
    this.currentRate = Math.floor(this.targetRate * 0.8);
  }

  /**
   * Obtient l'état actuel du simulateur
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentRate: this.currentRate,
      targetRate: this.targetRate,
      downtimeRemaining: this.downtimeRemaining,
      consecutiveDefects: this.consecutiveDefects
    };
  }
}

// Instance singleton du simulateur
let simulatorInstance: ProductionSimulator | null = null;

export function getSimulator(): ProductionSimulator {
  if (!simulatorInstance) {
    simulatorInstance = new ProductionSimulator();
  }
  return simulatorInstance;
}