import { apiRequest } from './client';

export type CertificateType = 'Participation' | 'Annual' | 'TopPerformer';

export interface ApiCertificate {
  id: string;
  user_id: string;
  type: CertificateType;
  issued_at: string;
  blob_url: string;
}

// GET /certificates/{userId}
export async function fetchCertificates(userId: string): Promise<ApiCertificate[]> {
  return apiRequest<ApiCertificate[]>(`/certificates/${userId}`);
}
