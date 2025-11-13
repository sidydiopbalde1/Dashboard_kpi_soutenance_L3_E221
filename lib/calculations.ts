// lib/calculations.ts

export interface TRSCalculation {
    trs: number;
    availability: number;
    performance: number;
    quality: number;
  }
  
  /**
   * Calcule le TRS simplifié
   */
  export function calculateSimplifiedTRS(params: {
    totalMinutes: number;
    downtimeMinutes: number;
    bottlesProduced: number;
    targetRate: number;
    defects: number;
  }): TRSCalculation {
    const {
      totalMinutes,
      downtimeMinutes,
      bottlesProduced,
      targetRate,
      defects
    } = params;
  
    const runTime = totalMinutes - downtimeMinutes;
    const targetProduction = targetRate * runTime;
    const goodUnits = bottlesProduced - defects;
  
    // Disponibilité = Temps de marche / Temps total
    const availability = totalMinutes > 0 
      ? ((runTime / totalMinutes) * 100) 
      : 0;
  
    // Performance = Production réelle / Production théorique
    const performance = targetProduction > 0 
      ? ((bottlesProduced / targetProduction) * 100) 
      : 0;
  
    // Qualité = Unités conformes / Total produit
    const quality = bottlesProduced > 0 
      ? ((goodUnits / bottlesProduced) * 100) 
      : 0;
  
    // TRS = Disponibilité × Performance × Qualité
    const trs = (availability * performance * quality) / 10000;
  
    return {
      trs: roundTo(trs, 2),
      availability: roundTo(availability, 2),
      performance: roundTo(performance, 2),
      quality: roundTo(quality, 2)
    };
  }
  
  /**
   * Détermine le statut d'un KPI
   */
  export function getKPIStatus(
    value: number,
    thresholds: { good: number; warning: number }
  ): 'good' | 'warning' | 'critical' {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
  }
  
  /**
   * Arrondit un nombre
   */
  function roundTo(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }
  
  /**
   * Seuils recommandés pour les KPIs
   */
  export const KPI_THRESHOLDS = {
    TRS: {
      excellent: 85,
      good: 75,
      warning: 65
    },
    AVAILABILITY: {
      excellent: 90,
      good: 85,
      warning: 75
    },
    PERFORMANCE: {
      excellent: 95,
      good: 85,
      warning: 75
    },
    QUALITY: {
      excellent: 99,
      good: 97,
      warning: 95
    }
  } as const;