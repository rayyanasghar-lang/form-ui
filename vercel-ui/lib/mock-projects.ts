import type { Project, ProjectStats, ChartDataPoint } from '@/types/project';

// Generate mock projects for the dashboard
export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Smith Residence',
    address: '123 Oak Street, Los Angeles, CA 90001',
    status: 'draft',
    systemSize: '8.5 kW',
    systemType: 'Roof Mount',
    pvModules: 'LG NeON 2 (20 panels)',
    inverters: 'SolarEdge SE7600H',
    batteryBackup: false,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-01'),
    submittedAt: new Date('2024-11-16'),
    approvedAt: new Date('2024-12-01'),
    ownerName: 'John Smith',
    ownerEmail: 'john.smith@email.com',
    ownerPhone: '(555) 123-4567',
    type: 'residential',
    general_notes: '',
  },
  {
    id: 'proj-002',
    name: 'Jones Solar Project',
    address: '456 Elm Drive, Phoenix, AZ 85001',
    status: 'pending',
    systemSize: '12.2 kW',
    systemType: 'Roof Mount',
    pvModules: 'REC Alpha Pure (28 panels)',
    inverters: 'Enphase IQ8+',
    batteryBackup: true,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
    submittedAt: new Date('2024-12-10'),
    ownerName: 'Sarah Jones',
    ownerEmail: 'sarah.jones@email.com',
    ownerPhone: '(555) 234-5678',
    type: 'residential',
    general_notes: '',
  },
  {
    id: 'proj-003',
    name: 'Garcia Commercial',
    address: '789 Business Park, San Diego, CA 92101',
    status: 'in_review',
    systemSize: '45.0 kW',
    systemType: 'Ground Mount',
    pvModules: 'Trina Vertex S (100 panels)',
    inverters: 'SMA Sunny Tripower',
    batteryBackup: true,
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-20'),
    submittedAt: new Date('2024-12-06'),
    ownerName: 'Miguel Garcia',
    ownerEmail: 'm.garcia@business.com',
    ownerPhone: '(555) 345-6789',
    type: 'commercial',
    general_notes: '',
  },
  {
    id: 'proj-004',
    name: 'Williams Retrofit',
    address: '321 Maple Ave, Las Vegas, NV 89101',
    status: 'draft',
    systemSize: '6.8 kW',
    systemType: 'Roof Mount',
    pvModules: 'Canadian Solar HiKu (16 panels)',
    inverters: 'SolarEdge SE5000H',
    batteryBackup: false,
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-11-10'),
    submittedAt: new Date('2024-10-21'),
    approvedAt: new Date('2024-11-10'),
    ownerName: 'Robert Williams',
    ownerEmail: 'rwilliams@email.com',
    ownerPhone: '(555) 456-7890',
    type: 'residential',
    general_notes: '',
  },
  {
    id: 'proj-005',
    name: 'Thompson Residence',
    address: '654 Pine Road, Tucson, AZ 85701',
    status: 'rejected',
    systemSize: '9.2 kW',
    systemType: 'Roof Mount',
    pvModules: 'Panasonic EverVolt (22 panels)',
    inverters: 'Enphase IQ7+',
    batteryBackup: false,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-20'),
    submittedAt: new Date('2024-11-02'),
    ownerName: 'Emily Thompson',
    ownerEmail: 'ethompson@email.com',
    ownerPhone: '(555) 567-8901',
    type: 'residential',
    general_notes: '',
  },
  {
    id: 'proj-006',
    name: 'Davis Solar Array',
    address: '987 Cedar Lane, Sacramento, CA 95814',
    status: 'draft',
    systemSize: '15.0 kW',
    systemType: 'Ground Mount',
    pvModules: 'Q Cells Q.Peak DUO (35 panels)',
    inverters: 'Fronius Primo',
    batteryBackup: true,
    createdAt: new Date('2024-12-22'),
    updatedAt: new Date('2024-12-22'),
    ownerName: 'Mark Davis',
    ownerEmail: 'mdavis@email.com',
    ownerPhone: '(555) 678-9012',
    type: 'residential',
    general_notes: '',
  },
  {
    id: 'proj-007',
    name: 'Martinez Home',
    address: '159 Birch Street, Denver, CO 80202',
    status: 'pending',
    systemSize: '7.4 kW',
    systemType: 'Roof Mount',
    pvModules: 'Jinko Tiger Neo (18 panels)',
    inverters: 'SolarEdge SE6000H',
    batteryBackup: false,
    createdAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-18'),
    submittedAt: new Date('2024-12-18'),
    ownerName: 'Ana Martinez',
    ownerEmail: 'amartinez@email.com',
    ownerPhone: '(555) 789-0123',
    type: 'residential',
    general_notes: '',
  },
  {
    id: 'proj-008',
    name: 'Anderson Office',
    address: '753 Willow Way, Portland, OR 97201',
    status: 'draft',
    systemSize: '22.5 kW',
    systemType: 'Roof Mount',
    pvModules: 'SunPower Maxeon 6 (50 panels)',
    inverters: 'SMA Sunny Boy',
    batteryBackup: true,
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-10-20'),
    submittedAt: new Date('2024-09-16'),
    approvedAt: new Date('2024-10-20'),
    ownerName: 'Tom Anderson',
    ownerEmail: 'tanderson@business.com',
    ownerPhone: '(555) 890-1234',
    type: 'residential',
    general_notes: '',
  },
];

// Calculate stats from projects
export function getProjectStats(projectsArray: Project[] = mockProjects): ProjectStats {
  const total = projectsArray.length;
  const pending = projectsArray.filter(p => p.status === 'pending').length;
  const inReview = projectsArray.filter(p => p.status === 'in_review').length;
  const approved = projectsArray.filter(p => p.status === 'approved').length;
  const done = projectsArray.filter(p => p.status === 'approved' || p.status === 'done').length;
  const rejected = projectsArray.filter(p => p.status === 'rejected').length;
  const draft = projectsArray.filter(p => p.status === 'draft').length;
  const inProcess = projectsArray.filter(p => p.status === 'pending' || p.status === 'in_review' || p.status === 'in_process').length;
  
  const totalCapacityKW = projectsArray.reduce((sum, p) => {
    const sizeStr = typeof p.systemSize === 'string' ? p.systemSize : '0';
    const size = parseFloat(sizeStr.replace(' kW', ''));
    return sum + (isNaN(size) ? 0 : size);
  }, 0);

  return {
    total,
    pending,
    inReview,
    approved,
    done,
    inProcess,
    rejected,
    draft,
    totalCapacityKW: Math.round(totalCapacityKW * 10) / 10,
    // Mock trends
    totalTrend: 15,
    pendingTrend: -10,
    approvedTrend: 33,
    capacityTrend: 25,
  };
}

// Generate chart data for last 6 months
export function getSubmissionChartData(): ChartDataPoint[] {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    date: month,
    submissions: Math.floor(Math.random() * 8) + 2,
    approvals: Math.floor(Math.random() * 6) + 1,
  }));
}

// Filter projects by status
export function filterProjectsByStatus(status: string): Project[] {
  if (status === 'all') return mockProjects;
  return mockProjects.filter(p => p.status === status);
}
