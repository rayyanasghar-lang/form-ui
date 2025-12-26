// Project status types
export type ProjectStatus = 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected';

// Project interface matching permit form data structure
export interface Project {
  id: string;
  name: string;
  address: string;
  status: ProjectStatus;
  systemSize: string;      // e.g., "12.5 kW"
  systemType: string;      // e.g., "Roof Mount", "Ground Mount"
  pvModules: string;
  inverters: string;
  batteryBackup: boolean;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  // Owner info
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

// Dashboard statistics
export interface ProjectStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  draft: number;
  totalCapacityKW: number;
  // Trends (percentage change vs last period)
  totalTrend?: number;
  pendingTrend?: number;
  approvedTrend?: number;
  capacityTrend?: number;
}

// Chart data point for submissions over time
export interface ChartDataPoint {
  date: string;           // "Jun 23" or "2024-06-23"
  submissions: number;
  approvals?: number;
}

// Table filter state
export interface ProjectFilters {
  status?: ProjectStatus | 'all';
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy?: keyof Project;
  sortOrder?: 'asc' | 'desc';
}
