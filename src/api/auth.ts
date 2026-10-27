import { apiRequest, setToken } from './client';

// POST /users/register
export interface RegisterPayload {
  full_name: string;
  email: string;
  mobile?: string;
  location_state?: string;
  location_city?: string;
  occupation?: string;
  age_group?: string;
  organization?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  devOtp?: string;   // dev/demo only — backend returns the OTP so testing does not need email
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/users/register', {
    method: 'POST',
    body: payload,
  });
}

// POST /users/login — sign in only; 404 if the email is not registered
export async function loginUser(email: string): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/users/login', {
    method: 'POST',
    body: { email },
  });
}

// POST /users/verify-otp
export interface VerifyOtpPayload {
  userId: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: 'participant' | 'reviewer' | 'admin';
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const res = await apiRequest<VerifyOtpResponse>('/users/verify-otp', {
    method: 'POST',
    body: payload,
  });
  setToken(res.token);
  return res;
}
