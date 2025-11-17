// types/maintenance.ts
export interface MaintenanceTask {
  id: string;
  equipment: string;
  type: 'preventive' | 'corrective' | 'emergency';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  assignedTo: string;
  scheduledDate: string;
  estimatedDuration: number;
  actualDuration?: number;
  completedDate?: string;
  spareParts: string[];
  cost?: number;
}
