// types/production.ts
export interface ProductionOrder {
  id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  produced: number;
  progress: number;
  targetRate: number;
  actualRate: number | null;
  startTime: string | null;
  endTime?: string | null;
  estimatedEndTime: string;
  status: 'waiting' | 'running' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  line: string;
  operator: string | null;
  shift: string | null;
  customer: string | null;
  setupTime?: number | null;
  downtime: number;
  comments?: string | null;
}

export interface ProductionMetrics {
  totalProduced: number;
  targetProduction: number;
  efficiency: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  averageRate: number;
  setupTime: number;
  activeOrders: number;
  completedOrders: number;
  waitingOrders: number;
  pausedOrders: number;
}
