// i-Pledge Carbon Impact Platform: Shared TypeScript Types
// i-Pledge Initiative

export type UserRole = 'user' | 'reviewer' | 'admin';

export type AuthMethod = 'email' | 'otp' | 'microsoft-sso';

export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  city?: string;
  state?: string;
  ageGroup?: string;
  occupation?: string;
  role: UserRole;
  authMethod: AuthMethod;
  co2Saved: number;
  pledgesActive: string[];
  certificatesEarned: string[];
  joinedAt: string;
  avatar?: string;
}

export type EvidenceStatus = 'pending' | 'verified' | 'rejected' | 'flagged';

export type PledgeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface PledgeField {
  label: string;
  type: 'number' | 'text' | 'select';
  unit?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface Pledge {
  id: string;
  title: string;
  category: 'Transport' | 'Energy' | 'Food' | 'Waste' | 'Nature' | 'Digital';
  description: string;
  longDescription: string;
  impact: string;
  co2Savings: string;
  co2Factor: number;       // kg CO2e per unit
  co2FactorUnit: string;   // e.g. "per km" or "per tree per year"
  co2Methodology: string;  // e.g. "IPCC AR6 / GHG Protocol"
  difficulty: PledgeDifficulty;
  timeCommitment: string;
  fields: PledgeField[];
  enrolled?: boolean;
  icon: string;            // Lucide icon name
  color: string;
  bgColor: string;
  badgeColor: string;
  sdgGoals: number[];      // UN SDG goals this pledge aligns with
}

export interface ActivitySubmission {
  id: string;
  pledgeId: string;
  pledgeTitle: string;
  userId: string;
  month: string;           // "June 2026"
  year: number;
  status: EvidenceStatus;
  co2Saved: number;        // kg CO2e
  values: Record<string, string | number>;
  evidenceFileName?: string;
  evidenceFileType?: 'image/jpeg' | 'image/png' | 'application/pdf';
  notes?: string;
  reviewerNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  organization?: string;
  city?: string;
  co2Saved: number;        // kg CO2e
  pledgesActive: number;
  certificatesEarned: number;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
  badge?: string;
  isCurrentUser?: boolean;
}

export type LeaderboardCategory = 'individual' | 'organization' | 'city';
export type LeaderboardPeriod = 'monthly' | 'cumulative';

export interface Certificate {
  id: string;
  title: string;
  description: string;
  criteria: string;
  co2Threshold?: number;   // kg CO2e required
  pledgeCount?: number;    // number of pledges required
  icon: string;
  color: string;
  bgColor: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;       // 0-100
  digitalBadgeUrl?: string;
}

export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  userOrg?: string;
  pledgeId: string;
  pledgeTitle: string;
  month: string;
  submittedAt: string;
  status: EvidenceStatus;
  co2Claimed: number;
  values: Record<string, string | number>;
  evidenceFileName?: string;
  evidenceFileType?: string;
  notes?: string;
  priority: 'high' | 'normal' | 'low';
  flagReason?: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'achievement';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  notifications: AppNotification[];
  enrolledPledges: string[];
  submissions: ActivitySubmission[];
  totalCO2Saved: number;
  currentMonth: string;
}
