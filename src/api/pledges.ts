import { apiRequest } from './client';

// GET /pledges
export interface ApiPledge {
  id: number;
  name: string;
  description: string;
  formula_type: string;
  emission_factor: string;
}

export async function fetchPledges(): Promise<ApiPledge[]> {
  return apiRequest<ApiPledge[]>('/pledges');
}

// POST /pledges/enroll
export interface EnrollPayload {
  userId: string;
  pledgeIds: number[];
}

export interface EnrollResponse {
  enrolled: number[];
  skipped: number[];
  message: string;
}

export async function enrollPledges(payload: EnrollPayload): Promise<EnrollResponse> {
  return apiRequest<EnrollResponse>('/pledges/enroll', {
    method: 'POST',
    body: payload,
  });
}
