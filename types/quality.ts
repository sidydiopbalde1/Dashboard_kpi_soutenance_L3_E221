// types/quality.ts
export interface QualityDefect {
  id: string;
  lotNumber: string;
  productType: string;
  defectType: string;
  severity: 'minor' | 'major' | 'critical';
  quantity: number;
  totalProduced: number;
  timestamp: string;
  shift: 'MATIN' | 'APRES_MIDI' | 'NUIT';
  operator: string;
  line: string;
  correctedAction?: string;
  status: 'open' | 'investigating' | 'corrected' | 'closed';
}

export interface QualityMetrics {
  conformityRate: number;
  defectRate: number;
  firstPassYield: number;
  customerComplaints: number;
  scrapCost: number;
  rework: number;
}
