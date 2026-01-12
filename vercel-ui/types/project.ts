// Project status types
export type ProjectStatus = 
  | 'draft'
  | 'pending'
  | 'New Job Creation'
  | 'New Design'
  | 'Design internal review'
  | 'Design revision'
  | 'Design submitted'
  | 'Awaiting Engineering'
  | 'Print and Ship'
  | 'On hold/challenge';

export const PROJECT_STATUSES: ProjectStatus[] = [
  'draft',
  'pending',
  'New Job Creation',
  'New Design',
  'Design internal review',
  'Design revision',
  'Design submitted',
  'Awaiting Engineering',
  'Print and Ship',
  'On hold/challenge'
];

// Project interface matching permit form data structure
export interface Project {
  id: string;
  name: string;
  address: string;
  status: ProjectStatus;
  systemSize: string | number; // Keep for backward compat if needed, but rely on system_summary
  systemType: string;         // Keep for backward compat
  pvModules: string | number; // Keep for backward compat
  inverters: string | number; // Keep for backward compat
  batteryBackup: boolean;     // Keep for backward compat
  createdAt: Date | string;
  updatedAt: Date | string;
  submittedAt?: Date | string;
  approvedAt?: Date | string;
  type: string; // "commercial" from JSON
  general_notes: string;

  // New Top Level Fields
  submission_type?: {
    id: string;
    name: string;
  };
  services?: Array<{
    id: string;
    name: string;
  }>;
  
  // Nested Details
  user_profile?: {
    id?: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
  };
  system_summary?: {
    id?: string;
    system_size?: number | string;
    system_type?: string;
    pv_modules?: number | string;
    inverters?: number | string;
    battery_backup?: boolean;
    battery_info?: {
      id?: string;
      qty: number;
      model: string;
      image: string[];
    };
  };
  site_details?: {
    id?: string;
    roof_material: string;
    roof_pitch: string;
    number_of_arrays: number;
    ground_mount_type?: boolean | string;
    foundation_type?: boolean | string;
    main_panel_size?: boolean | string; // Note: JSON has false, but likely string/number in real usage
    utility_provider: string;
    jurisdiction: string;
  };
  electrical_details?: {
    id?: string;
    main_panel_size: string;
    bus_rating: string;
    main_breaker: string;
    pv_breaker_location: boolean | string; // JSON has false
    one_line_diagram: string[];
  };
  advanced_electrical_details?: {
    id?: string;
    meter_location: string;
    service_entrance_type: string;
    subpanel_details: string;
  };
  optional_extra_details?: {
    id?: string;
    miracle_watt_required: boolean;
    miracle_watt_notes?: boolean | string;
    der_rlc_required: boolean;
    der_rlc_notes: string;
    setback_constraints: boolean;
    setback_notes?: boolean | string;
    site_access_restrictions: boolean;
    site_access_notes?: boolean | string;
    inspection_notes: boolean;
    inspection_notes_text: string;
    battery_sld_requested: boolean;
    battery_sld_notes?: boolean | string;
  };
  system_components?: Array<{
    id?: string; 
    type?: string;
    make_model?: string;
    qty?: number;
    attachment?: string[];
    notes?: string;
    // Allow for any structure since JSON was empty array
    [key: string]: any;
  }>;
  uploads?: Array<{
    url: string;
    name: string;
    category: string;
  }>;

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
  inProcess: number;
  approved: number;
  done: number;
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


export interface ProjectTableProps {
  projects: Project[]
  isLoading?: boolean
  error?: string | null
  className?: string
}