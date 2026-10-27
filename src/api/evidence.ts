import { apiRequest } from './client';

export type AllowedFileType = 'image/jpeg' | 'image/png' | 'application/pdf';

// POST /evidence/upload-url
export interface UploadUrlPayload {
  userId: string;
  fileType: AllowedFileType;
  fileName: string;
  submissionId?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  blobUrl: string;
  blobName: string;
  expiresAt: string;
}

export async function getEvidenceUploadUrl(
  payload: UploadUrlPayload
): Promise<UploadUrlResponse> {
  return apiRequest<UploadUrlResponse>('/evidence/upload-url', {
    method: 'POST',
    body: payload,
  });
}

// PUT file directly to the Azure Blob SAS URL
export async function uploadFileToBlob(
  uploadUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type,
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Blob upload failed: ${res.status} ${res.statusText}`);
  }
}
