import { apiRequest } from './client';
import type { AllowedFileType } from './evidence';

// POST /submissions
export interface CreateSubmissionPayload {
  userId: string;
  pledgeId: number;
  month: string;
  inputs: Record<string, string | number>;
  blobUrl?: string;
  fileType?: AllowedFileType;
}

export interface CreateSubmissionResponse {
  submissionId: string;
  carbonSaved: number;
  status: 'Pending';
  message: string;
}

export async function createSubmission(
  payload: CreateSubmissionPayload
): Promise<CreateSubmissionResponse> {
  return apiRequest<CreateSubmissionResponse>('/submissions', {
    method: 'POST',
    body: payload,
  });
}

// GET /submissions/user/{userId}
export interface UserSubmission {
  id: string;
  user_id: string;
  pledge_id: number;
  pledge_name: string;
  month: string;
  inputs: string;
  carbon_saved_kg: number;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Flagged';
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  blob_url: string | null;
  file_type: string | null;
}

export async function fetchUserSubmissions(userId: string): Promise<UserSubmission[]> {
  return apiRequest<UserSubmission[]>(`/submissions/user/${userId}`);
}

// GET /submissions/pending (reviewer queue)
export type AiStatus = 'ai_verified' | 'ai_flagged' | 'ai_rejected' | null;

export interface PendingSubmission {
  id: string;
  full_name: string;
  email: string;
  organization: string;
  location_city: string;
  pledge_name: string;
  month: string;
  inputs: string;
  carbon_saved_kg: number;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Flagged';
  submitted_at: string;
  blob_url: string | null;
  file_type: string | null;
  ai_status: AiStatus;
  ai_notes: string | null;
  ai_reviewed_at: string | null;
}

export async function fetchPendingSubmissions(): Promise<PendingSubmission[]> {
  return apiRequest<PendingSubmission[]>('/submissions/pending');
}

// GET /submissions/{id}/ai-log — the automated verification audit trail
export type AiCheckType = 'rule_based' | 'evidence_check' | 'authenticity_check' | 'ai_reasoning' | 'vision_check';

export interface AiLogEntry {
  check_type: AiCheckType;
  decision: 'verified' | 'flagged' | 'rejected';
  reasoning: string;
  red_flags: string | null;
  confidence: number | null;
  model_used: string | null;
  created_at: string;
}

export async function fetchAiLog(submissionId: string): Promise<AiLogEntry[]> {
  return apiRequest<AiLogEntry[]>(`/submissions/${submissionId}/ai-log`);
}

// PATCH /submissions/{id}/verify
export async function verifySubmission(
  id: string,
  reviewerId: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/submissions/${id}/verify`, {
    method: 'PATCH',
    body: { reviewerId },
  });
}

// PATCH /submissions/{id}/reject
export async function rejectSubmission(
  id: string,
  reviewerId: string,
  rejection_reason: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/submissions/${id}/reject`, {
    method: 'PATCH',
    body: { reviewerId, rejection_reason },
  });
}

// PATCH /submissions/{id}/flag
export async function flagSubmission(
  id: string,
  reviewerId: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/submissions/${id}/flag`, {
    method: 'PATCH',
    body: { reviewerId },
  });
}
