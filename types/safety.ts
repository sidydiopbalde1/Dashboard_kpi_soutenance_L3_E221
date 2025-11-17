// types/safety.ts
export interface SafetyIncident {
  id: string;
  type: 'accident' | 'near_miss' | 'unsafe_condition' | 'non_compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  reportedBy: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'corrected' | 'closed';
  involvedPersons: number;
  injuryType?: string;
  rootCause?: string;
  correctiveActions: string[];
  daysLost?: number;
}

export interface SafetyMetrics {
  daysWithoutAccident: number;
  incidentRate: number; // incidents per 100,000 hours
  nearMissReports: number;
  complianceRate: number;
  trainingCompletion: number;
  auditScore: number;
  eppCompliance: number; // EPI compliance
  safetyMeetingsHeld: number;
}
