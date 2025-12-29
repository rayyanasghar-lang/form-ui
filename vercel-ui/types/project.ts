// Project status types
export type ProjectStatus = 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected';

// Project interface matching permit form data structure
export interface Project {
  id: string;
  name: string;
  address: string;
  status: ProjectStatus;
  systemSize: string | number;
  systemType: string;
  pvModules: string | number;
  inverters: string | number;
  batteryBackup: boolean;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  
  // Nested Details
  user_profile?: {
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
  };
  system_summary?: {
    battery_info?: {
      qty: number;
      model: string;
      image: string[];
    };
  };
  site_details?: {
    roof_material: string;
    roof_pitch: string;
    number_of_arrays: number;
    utility_provider: string;
    jurisdiction: string;
  };
  electrical_details?: {
    main_panel_size: string;
    bus_rating: string;
    main_breaker: string;
    pv_breaker_location: string;
    one_line_diagram: string[];
  };
  advanced_electrical_details?: {
    meter_location: string;
    service_entrance_type: string;
    subpanel_details: string;
  };
  optional_extra_details?: {
    miracle_watt_required: boolean;
    der_rlc_required: boolean;
    der_rlc_notes: string;
    setback_constraints: boolean;
    site_access_restrictions: boolean;
    inspection_notes: boolean;
    inspection_notes_text: string;
    battery_sld_requested: boolean;
  };
  system_components?: Array<{
    type: string;
    make_model: string;
    qty: number;
    attachment: string[];
    notes: string;
  }>;
  uploads?: Array<{
    url: string;
    name: string;
    category: string;
  }>;
  general_notes?: string;

  // Owner info (for backward compatibility if needed)
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
