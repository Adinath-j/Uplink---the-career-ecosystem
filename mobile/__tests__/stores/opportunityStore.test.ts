import { useOpportunityStore } from '../../src/store/opportunityStore';

describe('OpportunityStore', () => {
  beforeEach(() => {
    useOpportunityStore.setState({
      opportunities: [],
      selectedCategory: 'All',
      workModeFilter: 'All',
      searchQuery: '',
      isLoading: false,
      error: null,
    });
  });

  test('fetches opportunities and updates state', async () => {
    await useOpportunityStore.getState().fetchOpportunities();
    const state = useOpportunityStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.opportunities.length).toBeGreaterThan(0);
    expect(state.error).toBeNull();
  });

  test('filters opportunities by category', async () => {
    useOpportunityStore.getState().setSelectedCategory('Internship');
    await useOpportunityStore.getState().fetchOpportunities();

    const state = useOpportunityStore.getState();
    expect(state.selectedCategory).toBe('Internship');
    expect(state.opportunities.every((o) => o.type === 'Internship')).toBe(true);
  });
});
