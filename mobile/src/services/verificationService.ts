import { apiClient, ApiResponse } from './api/apiClient';

export interface VerificationSubmitRequest {
  type: 'IDENTITY_PROOF' | 'COLLEGE_ID' | 'COMPANY_DOC' | 'OTHER' | string;
  documentUrl: string;
  remarks?: string;
}

export interface UserVerification {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  documentUrl: string;
  remarks?: string;
  verifiedAt?: string;
}

class VerificationService {
  /**
   * Submit document for verification.
   * Calls POST /verification/submit
   */
  async submitVerification(request: VerificationSubmitRequest): Promise<ApiResponse<UserVerification>> {
    return apiClient.post<UserVerification>('/verification/submit', request);
  }

  /**
   * Get user's submitted verification records.
   * Calls GET /verification/my
   */
  async getMyVerifications(): Promise<ApiResponse<UserVerification[]>> {
    return apiClient.get<UserVerification[]>('/verification/my');
  }
}

export const verificationService = new VerificationService();

