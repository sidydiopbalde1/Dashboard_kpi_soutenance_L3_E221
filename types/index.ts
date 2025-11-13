export interface KPIData {
    trs: number;
    availability: number;
    performance: number;
    quality: number;
    currentRate: number;
    targetRate: number;
    totalProduced: number;
    totalDefects: number;
    downtime: number;
    timestamp: Date;
  }
  
  export interface ProductionPoint {
    timestamp: Date;
    actualRate: number;
    targetRate: number;
    bottlesProduced: number;
    defectCount: number;
    isRunning: boolean;
  }
  
  export interface Alert {
    id: number;
    timestamp: Date;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    isResolved: boolean;
    threshold?: number;
    actualValue?: number;
  }
  
  export type AlertType = 
    | 'CADENCE_LOW' 
    | 'DEFECT_HIGH' 
    | 'DOWNTIME' 
    | 'QUALITY_ISSUE';
  
  export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  export type ShiftId = 'MATIN' | 'APRES_MIDI' | 'NUIT';
  
  export interface ChartDataPoint {
    time: string;
    actual: number;
    target: number;
  }