// types/teams.ts
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  shift: 'MATIN' | 'APRES_MIDI' | 'NUIT';
  status: 'present' | 'absent' | 'break' | 'training';
  skills: string[];
  certifications: string[];
  performance: number;
  efficiency: number;
  quality: number;
  safety: number;
  experience: number; // en années
  lastTraining?: string;
  nextTraining?: string;
  workstation: string;
}

export interface ShiftMetrics {
  shift: string;
  members: number;
  present: number;
  efficiency: number;
  production: number;
  target: number;
  incidents: number;
}
