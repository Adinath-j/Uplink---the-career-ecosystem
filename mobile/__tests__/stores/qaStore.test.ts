import { useQAStore } from '../../src/store/qaStore';

describe('QAStore', () => {
  beforeEach(() => {
    useQAStore.setState({
      questions: [],
      activeTab: 'For You',
      selectedTopic: 'All',
      searchQuery: '',
      isLoading: false,
      error: null,
    });
  });

  test('fetches questions successfully', async () => {
    await useQAStore.getState().fetchQuestions();
    const state = useQAStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.questions.length).toBeGreaterThan(0);
    expect(state.error).toBeNull();
  });

  test('toggles same doubt count optimistically', async () => {
    await useQAStore.getState().fetchQuestions();
    const firstQ = useQAStore.getState().questions[0];
    const initialCount = firstQ.sameDoubtCount;
    const initialMarked = firstQ.hasUserMarkedSameDoubt;

    await useQAStore.getState().toggleSameDoubt(firstQ.id);

    const updatedQ = useQAStore.getState().questions.find((q) => q.id === firstQ.id)!;
    expect(updatedQ.hasUserMarkedSameDoubt).toBe(!initialMarked);
    expect(updatedQ.sameDoubtCount).toBe(
      !initialMarked ? initialCount + 1 : Math.max(0, initialCount - 1)
    );
  });
});
