import { apiClient, ApiResponse } from './api/apiClient';

export interface Company {
  id: string;
  name: string;
  type?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  isVerified?: boolean;
}

export interface Recruiter {
  id: string;
  company?: Company;
  designation?: string;
  isVerified?: boolean;
}

export interface RegisterCompanyRequest {
  companyName: string;
  type?: string;
  website?: string;
  description?: string;
  designation?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

class RecruiterService {
  /**
   * List all companies (paginated).
   * Calls GET /recruiter/companies
   */
  async getCompanies(page: number = 0, size: number = 20): Promise<ApiResponse<Company[]>> {
    const res = await apiClient.get<SpringPage<Company> | Company[]>(
      `/recruiter/companies?page=${page}&size=${size}`
    );

    if (res.success && res.data) {
      const list: Company[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<Company>).content || [];

      return { success: true, data: list, statusCode: res.statusCode };
    }

    return {
      success: false,
      error: res.error || 'Failed to load companies',
      statusCode: res.statusCode,
    };
  }

  /**
   * Get company details by ID.
   * Calls GET /recruiter/companies/{id}
   */
  async getCompanyById(id: string): Promise<ApiResponse<Company>> {
    return apiClient.get<Company>(`/recruiter/companies/${id}`);
  }

  /**
   * Get current recruiter profile and assigned company.
   * Calls GET /recruiter/me
   */
  async getMyRecruiterProfile(): Promise<ApiResponse<Recruiter>> {
    return apiClient.get<Recruiter>('/recruiter/me');
  }

  /**
   * Register company as recruiter.
   * Calls POST /recruiter/company
   */
  async registerCompany(request: RegisterCompanyRequest): Promise<ApiResponse<Recruiter>> {
    return apiClient.post<Recruiter>('/recruiter/company', request);
  }
}

export const recruiterService = new RecruiterService();

