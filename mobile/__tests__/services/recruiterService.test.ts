import {
  recruiterService,
  Company,
  Recruiter,
} from '../../src/services/recruiterService';
import { apiClient } from '../../src/services/api/apiClient';

describe('recruiterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCompany: Company = {
    id: 'comp-101',
    name: 'Acme Cloud Systems',
    type: 'PRODUCT',
    website: 'https://acmecloud.io',
    isVerified: true,
  };

  const mockRecruiter: Recruiter = {
    id: 'rec-1',
    company: mockCompany,
    designation: 'Lead University Talent Partner',
    isVerified: true,
  };

  test('getCompanies calls GET /recruiter/companies', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: {
        content: [mockCompany],
        totalElements: 1,
      },
      statusCode: 200,
    });

    const res = await recruiterService.getCompanies(0, 20);
    expect(getSpy).toHaveBeenCalledWith('/recruiter/companies?page=0&size=20');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
    expect(res.data?.[0].name).toBe('Acme Cloud Systems');
  });

  test('getCompanyById calls GET /recruiter/companies/{id}', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCompany,
      statusCode: 200,
    });

    const res = await recruiterService.getCompanyById('comp-101');
    expect(getSpy).toHaveBeenCalledWith('/recruiter/companies/comp-101');
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('comp-101');
  });

  test('getMyRecruiterProfile calls GET /recruiter/me', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockRecruiter,
      statusCode: 200,
    });

    const res = await recruiterService.getMyRecruiterProfile();
    expect(getSpy).toHaveBeenCalledWith('/recruiter/me');
    expect(res.success).toBe(true);
    expect(res.data?.designation).toBe('Lead University Talent Partner');
  });
});

