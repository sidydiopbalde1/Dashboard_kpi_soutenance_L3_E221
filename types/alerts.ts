// types/alerts.ts
export interface Alert {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  timestamp: string;
  isResolved: boolean;
  threshold?: string;
  actualValue?: string;
  source: string;
  resolvedAt?: string;
  resolvedBy?: string;
  duration?: number;
}
