import { apiFetch } from '../../core/client';
import { API_ENDPOINTS } from '../../core/endpoints';

export interface DashboardStats {
  activeListings: number;
  totalViews: number;
  openInquiries: number;
  upcomingAppointments: number;
}

export interface DashboardListingSnapshot {
  id: string;
  listingCode: string;
  title: string;
  status: string;
  views: number;
  updatedAt: string;
}

export interface DashboardActivityItem {
  id: string;
  type: 'inquiry' | 'view' | 'appointment' | 'verification';
  message: string;
  timestamp: string;
  relative: string;
}

export interface DashboardAppointment {
  id: string;
  propertyCode: string;
  propertyArea: string;
  type: string;
  status: string;
  day: string;
  month: string;
  officer: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  listings: DashboardListingSnapshot[];
  activity: DashboardActivityItem[];
  appointments: DashboardAppointment[];
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return apiFetch<DashboardOverview>(API_ENDPOINTS.dashboard.overview);
}
