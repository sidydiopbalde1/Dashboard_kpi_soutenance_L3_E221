// types/energy.ts
export interface EnergyMetrics {
  currentConsumption: number; // kW
  dailyConsumption: number; // kWh
  monthlyCost: number; // €
  efficiency: number; // %
  carbonFootprint: number; // kg CO2
  peakDemand: number; // kW
  offPeakRatio: number; // %
  renewableRatio: number; // %
}

export interface EnergyAlert {
  id: string;
  type: 'peak_demand' | 'efficiency_drop' | 'high_cost' | 'maintenance';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  equipment: string;
  value: number;
  threshold: number;
}
