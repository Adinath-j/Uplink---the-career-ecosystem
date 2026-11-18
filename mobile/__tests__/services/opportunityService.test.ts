import {
  opportunityService,
  mapBackendOpportunityToMobile,
  mapBackendApplicationToRecord,
  BackendOpportunity,
  BackendApplication,
} from '../../src/services/opportunityService';
import { apiClient } from '../../src/services/api/apiClient';
import { storage } from '../../src/services/api/tokenStorage';

describe('opportunityService', () => {
  beforeEach(() => {
    storage.clearAll();
    jest.clearAllMocks();
  });

  const mockBackendOpportunity: BackendOpportunity = {
    id: 'opp-101',
    company: {
      id: 'comp-1',
      name: 'Acme Cloud Systems',
      logoUrl: 'https://example.com/logo.png',
    },
    type: 'INTERNSHIP',
    title: 'Software Engineering Intern',
    description: 'Work on distributed systems and cloud APIs',
    location: 'Bengaluru, India',
    workMode: 'HYBRID',
    experienceLevel: 'ENTRY',
    stipendMin: 45000,
    stipendMax: 50000,
    applicationUrl: undefined,
    deadline: '2026-12-31',
    isActive: true,
    isVerified: true,
    createdAt: '2026-10-20T10:00:00Z',
    requiredSkills: [
      {
        skill: { name: 'Java' },
        isMandatory: true,
      },
      {
        skill: { name: 'Spring Boot' },
        isMandatory: true,
      },
    ],
  };

  const mockBackendApplication: BackendApplication = {
    id: 'app-901',
    opportunity: mockBackendOpportunity,
    user: {
      id: 'usr-1',
      fullName: 'Aditya Verma',
      email: 'aditya@campus.edu',
    },
    status: 'UNDER_REVIEW',
    appliedAt: '2026-10-24T14:30:00Z',
    coverLetter: 'Passionate about backend performance',
    remarks: 'Profile forwarded to technical lead',
    updatedAt: '2026-10-25T09:15:00Z',
  };

  describe('mapBackendOpportunityToMobile', () => {
    test('maps backend opportunity fields correctly', () => {
      const mapped = mapBackendOpportunityToMobile(mockBackendOpportunity);

      expect(mapped.id).toBe('opp-101');
      expect(mapped.type).toBe('Internship');
      expect(mapped.title).toBe('Software Engineering Intern');
      expect(mapped.organization).toBe('Acme Cloud Systems');
      expect(mapped.organizationLogo).toBe('https://example.com/logo.png');
      expect(mapped.workMode).toBe('Hybrid');
      expect(mapped.stipendOrSalary).toBe('₹45,000 – ₹50,000');
      expect(mapped.requiredSkills).toEqual(['Java', 'Spring Boot']);
      expect(mapped.applicationMethod).toBe('INTERNAL');
      expect(mapped.isVerified).toBe(true);
    });

    test('detects EXTERNAL applicationMethod when http url is present', () => {
      const externalOpp: BackendOpportunity = {
        ...mockBackendOpportunity,
        applicationUrl: 'https://careers.google.com/jobs/123',
      };

      const mapped = mapBackendOpportunityToMobile(externalOpp);
      expect(mapped.applicationMethod).toBe('EXTERNAL');
      expect(mapped.externalUrl).toBe('https://careers.google.com/jobs/123');
    });

    test('formats single stipend correctly', () => {
      const singleStipend: BackendOpportunity = {
        ...mockBackendOpportunity,
        stipendMin: 30000,
        stipendMax: undefined,
      };

      const mapped = mapBackendOpportunityToMobile(singleStipend);
      expect(mapped.stipendOrSalary).toBe('₹30,000');
    });
  });

  describe('mapBackendApplicationToRecord', () => {
    test('maps backend application to mobile ApplicationRecord', () => {
      const record = mapBackendApplicationToRecord(mockBackendApplication);

      expect(record.id).toBe('app-901');
      expect(record.opportunityId).toBe('opp-101');
      expect(record.opportunityTitle).toBe('Software Engineering Intern');
      expect(record.organization).toBe('Acme Cloud Systems');
      expect(record.type).toBe('Internship');
      expect(record.status).toBe('UNDER_REVIEW');
      expect(record.appliedAt).toBe('2026-10-24T14:30:00Z');
      expect(record.notes).toBe('Profile forwarded to technical lead');
    });

    test('normalizes SELECTED status to ACCEPTED', () => {
      const selectedApp: BackendApplication = {
        ...mockBackendApplication,
        status: 'SELECTED',
      };

      const record = mapBackendApplicationToRecord(selectedApp);
      expect(record.status).toBe('ACCEPTED');
    });
  });

  describe('getOpportunities', () => {
    test('sends query params to /opportunities and maps paginated content', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: {
          content: [mockBackendOpportunity],
          totalElements: 1,
          totalPages: 1,
          size: 50,
          number: 0,
        },
        statusCode: 200,
      });

      const res = await opportunityService.getOpportunities({
        category: 'Internship',
        workMode: 'Hybrid',
        search: 'backend',
      });

      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining('/opportunities?type=INTERNSHIP&workMode=HYBRID&keyword=backend')
      );
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
      expect(res.data?.[0].title).toBe('Software Engineering Intern');
    });

    test('handles raw array responses from backend', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: [mockBackendOpportunity],
        statusCode: 200,
      });

      const res = await opportunityService.getOpportunities();
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
    });

    test('returns failure on server error', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: false,
        error: 'Database timeout',
        statusCode: 500,
      });

      const res = await opportunityService.getOpportunities();
      expect(res.success).toBe(false);
      expect(res.error).toBe('Database timeout');
    });
  });

  describe('getOpportunityById', () => {
    test('fetches opportunity detail by UUID', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: mockBackendOpportunity,
        statusCode: 200,
      });

      const res = await opportunityService.getOpportunityById('opp-101');
      expect(getSpy).toHaveBeenCalledWith('/opportunities/opp-101');
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('opp-101');
    });
  });

  describe('applyInternal', () => {
    test('submits application payload to /applications/apply', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: mockBackendApplication,
        statusCode: 201,
      });

      const res = await opportunityService.applyInternal('opp-101', {
        coverLetter: 'Here is my cover letter',
        resumeUrl: 'https://storage.uplink.edu/resumes/aditya.pdf',
      });

      expect(postSpy).toHaveBeenCalledWith('/applications/apply', {
        opportunityId: 'opp-101',
        coverLetter: 'Here is my cover letter',
        resumeUrl: 'https://storage.uplink.edu/resumes/aditya.pdf',
        expectedCtc: undefined,
        remarks: undefined,
      });

      expect(res.success).toBe(true);
      expect(res.data?.status).toBe('UNDER_REVIEW');
    });
  });

  describe('getMyApplications', () => {
    test('fetches user applications from /applications/my', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: {
          content: [mockBackendApplication],
          totalElements: 1,
        },
        statusCode: 200,
      });

      const res = await opportunityService.getMyApplications();
      expect(getSpy).toHaveBeenCalledWith('/applications/my?page=0&size=50');
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
      expect(res.data?.[0].opportunityTitle).toBe('Software Engineering Intern');
    });
  });

  describe('getApplicationHistory', () => {
    test('calls /applications/{id}/history', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: 'hist-1',
            status: 'APPLIED',
            remarks: 'Submitted',
            changedAt: '2026-10-24T14:30:00Z',
          },
        ],
        statusCode: 200,
      });

      const res = await opportunityService.getApplicationHistory('app-901');
      expect(getSpy).toHaveBeenCalledWith('/applications/app-901/history');
      expect(res.success).toBe(true);
      expect(res.data?.[0].status).toBe('APPLIED');
    });
  });

  describe('saveOpportunity', () => {
    test('calls POST /opportunities/{id}/save', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: undefined,
        statusCode: 200,
      });

      const res = await opportunityService.saveOpportunity('opp-101');
      expect(postSpy).toHaveBeenCalledWith('/opportunities/opp-101/save');
      expect(res.success).toBe(true);
    });
  });

  describe('unsaveOpportunity', () => {
    test('calls DELETE /opportunities/{id}/save', async () => {
      const delSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
        success: true,
        data: undefined,
        statusCode: 200,
      });

      const res = await opportunityService.unsaveOpportunity('opp-101');
      expect(delSpy).toHaveBeenCalledWith('/opportunities/opp-101/save');
      expect(res.success).toBe(true);
    });
  });

  describe('getSavedOpportunities', () => {
    test('calls GET /opportunities/saved and maps backend opportunities', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: [mockBackendOpportunity],
        statusCode: 200,
      });

      const res = await opportunityService.getSavedOpportunities();
      expect(getSpy).toHaveBeenCalledWith('/opportunities/saved');
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
      expect(res.data?.[0].id).toBe('opp-101');
      expect(res.data?.[0].title).toBe('Software Engineering Intern');
    });

    test('returns failure if backend call fails', async () => {
      jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
      });

      const res = await opportunityService.getSavedOpportunities();
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');
    });
  });
});

