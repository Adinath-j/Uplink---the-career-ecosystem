import { useOpportunityStore } from '../../src/store/opportunityStore';
import { opportunityService } from '../../src/services/opportunityService';
import { Opportunity, ApplicationRecord } from '../../src/types/models';

describe('OpportunityStore', () => {
  const sampleOpportunity: Opportunity = {
    id: 'opp-1',
    type: 'Internship',
    title: 'Software Engineering Intern',
    organization: 'Acme Cloud Systems',
    location: 'Bengaluru, India',
    workMode: 'Hybrid',
    stipendOrSalary: '₹45,000 / month',
    deadline: '2026-11-30',
    description: 'Work on distributed microservices',
    eligibility: 'Pre-final and final year B.Tech',
    requiredSkills: ['Java', 'Spring Boot'],
    applicationMethod: 'INTERNAL',
    isVerified: true,
    createdAt: '2026-10-20T10:00:00Z',
  };

  const sampleApplication: ApplicationRecord = {
    id: 'app-1',
    opportunityId: 'opp-1',
    opportunityTitle: 'Software Engineering Intern',
    organization: 'Acme Cloud Systems',
    type: 'Internship',
    status: 'APPLIED',
    appliedAt: '2026-10-24T14:30:00Z',
    updatedAt: '2026-10-24T14:30:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useOpportunityStore.setState({
      opportunities: [],
      events: [],
      myApplications: [],
      selectedCategory: 'All',
      workModeFilter: 'All',
      searchQuery: '',
      isLoading: false,
      isApplying: false,
      error: null,
    });
  });

  test('fetches opportunities and updates state', async () => {
    jest.spyOn(opportunityService, 'getOpportunities').mockResolvedValueOnce({
      success: true,
      data: [sampleOpportunity],
      statusCode: 200,
    });

    await useOpportunityStore.getState().fetchOpportunities();
    const state = useOpportunityStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.opportunities.length).toBe(1);
    expect(state.opportunities[0].title).toBe('Software Engineering Intern');
    expect(state.error).toBeNull();
  });

  test('handles fetch opportunities failure', async () => {
    jest.spyOn(opportunityService, 'getOpportunities').mockResolvedValueOnce({
      success: false,
      error: 'Network request failed',
      statusCode: 500,
    });

    await useOpportunityStore.getState().fetchOpportunities();
    const state = useOpportunityStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.opportunities.length).toBe(0);
    expect(state.error).toBe('Network request failed');
  });

  test('updates selectedCategory and triggers fetch', async () => {
    const fetchSpy = jest.spyOn(opportunityService, 'getOpportunities').mockResolvedValueOnce({
      success: true,
      data: [sampleOpportunity],
      statusCode: 200,
    });

    useOpportunityStore.getState().setSelectedCategory('Internship');

    expect(useOpportunityStore.getState().selectedCategory).toBe('Internship');
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Internship' })
    );
  });

  test('applies to opportunity and prepends to myApplications', async () => {
    jest.spyOn(opportunityService, 'applyInternal').mockResolvedValueOnce({
      success: true,
      data: sampleApplication,
      statusCode: 201,
    });

    const result = await useOpportunityStore.getState().applyInternal('opp-1', {
      coverLetter: 'Interested in this role',
    });

    expect(result.success).toBe(true);
    const state = useOpportunityStore.getState();
    expect(state.myApplications.length).toBe(1);
    expect(state.myApplications[0].id).toBe('app-1');
    expect(state.isApplying).toBe(false);
  });

  test('fetches user applications', async () => {
    jest.spyOn(opportunityService, 'getMyApplications').mockResolvedValueOnce({
      success: true,
      data: [sampleApplication],
      statusCode: 200,
    });

    await useOpportunityStore.getState().fetchMyApplications();
    const state = useOpportunityStore.getState();

    expect(state.myApplications.length).toBe(1);
    expect(state.myApplications[0].opportunityTitle).toBe('Software Engineering Intern');
  });
});
