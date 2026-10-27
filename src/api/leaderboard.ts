import { apiRequest } from './client';

export type LeaderboardType = 'individual' | 'organization' | 'city';

export interface IndividualEntry {
  full_name: string;
  organization: string;
  location_city: string;
  total_carbon_saved_kg: number;
  user_id: string;
}

export interface OrgEntry {
  organization: string;
  total_carbon_saved_kg: number;
  member_count: number;
}

export interface CityEntry {
  city: string;
  total_carbon_saved_kg: number;
  member_count: number;
}

export type LeaderboardEntry = IndividualEntry | OrgEntry | CityEntry;

export async function fetchLeaderboard(
  type: 'individual',
  month?: string
): Promise<IndividualEntry[]>;
export async function fetchLeaderboard(
  type: 'organization',
  month?: string
): Promise<OrgEntry[]>;
export async function fetchLeaderboard(
  type: 'city',
  month?: string
): Promise<CityEntry[]>;
export async function fetchLeaderboard(
  type: LeaderboardType,
  month?: string
): Promise<LeaderboardEntry[]> {
  const query = month ? `?month=${month}` : '';
  return apiRequest<LeaderboardEntry[]>(`/leaderboard/${type}${query}`);
}
