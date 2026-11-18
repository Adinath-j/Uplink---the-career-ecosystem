import { useQAStore } from '../../src/store/qaStore';
import { qaService } from '../../src/services/qaService';
import { Question, Answer } from '../../src/types/models';

describe('QAStore', () => {
  const sampleQuestion: Question = {
    id: 'q-1',
    title: 'How does Spring Boot handle transactions?',
    description: 'Looking for advice on @Transactional isolation levels.',
    topicTags: ['Backend', 'Academics'],
    authorId: 'u-1',
    authorName: 'Aditya Sharma',
    authorAcademicContext: 'B.Tech CSE • Year 3',
    createdAt: '2026-10-24T10:00:00Z',
    answerCount: 1,
    sameDoubtCount: 3,
    hasUserMarkedSameDoubt: false,
    isUnanswered: false,
  };

  const sampleAnswer: Answer = {
    id: 'ans-1',
    questionId: 'q-1',
    authorId: 'u-2',
    authorName: 'Priya Nambiar',
    authorRole: 'Campus Member',
    content: 'Here is a detailed explanation.',
    createdAt: '2026-10-24T12:00:00Z',
    helpfulCount: 2,
    isAccepted: false,
    hasUserMarkedHelpful: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useQAStore.setState({
      questions: [sampleQuestion],
      activeTab: 'For You',
      selectedTopic: 'All',
      searchQuery: '',
      isLoading: false,
      error: null,
      activeQuestionAnswers: { 'q-1': [sampleAnswer] },
      isLoadingAnswers: false,
    });
  });

  test('fetches questions successfully', async () => {
    jest.spyOn(qaService, 'getQuestions').mockResolvedValueOnce({
      success: true,
      data: [sampleQuestion],
      statusCode: 200,
    });

    await useQAStore.getState().fetchQuestions();
    const state = useQAStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.questions.length).toBe(1);
    expect(state.error).toBeNull();
  });

  test('toggles same doubt count optimistically', async () => {
    jest.spyOn(qaService, 'toggleSameDoubt').mockResolvedValueOnce({
      success: true,
      data: { hasMarked: true, count: 4 },
      statusCode: 200,
    });

    await useQAStore.getState().toggleSameDoubt('q-1');
    const updatedQ = useQAStore.getState().questions.find((q) => q.id === 'q-1')!;
    expect(updatedQ.hasUserMarkedSameDoubt).toBe(true);
    expect(updatedQ.sameDoubtCount).toBe(4);
  });

  test('posts answer and increments answer count', async () => {
    const newAnswer: Answer = {
      ...sampleAnswer,
      id: 'ans-2',
      content: 'New posted answer',
    };
    jest.spyOn(qaService, 'postAnswer').mockResolvedValueOnce({
      success: true,
      data: newAnswer,
      statusCode: 201,
    });

    const success = await useQAStore.getState().postAnswer('q-1', 'New posted answer');
    expect(success).toBe(true);

    const updatedQ = useQAStore.getState().questions.find((q) => q.id === 'q-1')!;
    expect(updatedQ.answerCount).toBe(2);
  });

  test('accepts answer solution optimistically', async () => {
    jest.spyOn(qaService, 'acceptAnswer').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });

    const acceptSuccess = await useQAStore.getState().acceptAnswer('q-1', 'ans-1');
    expect(acceptSuccess).toBe(true);

    const answers = useQAStore.getState().activeQuestionAnswers['q-1'];
    expect(answers[0].isAccepted).toBe(true);
  });
});
