import { useMentorStore } from '../../src/store/mentorStore';

describe('MentorStore', () => {
  beforeEach(() => {
    useMentorStore.setState({
      mentors: [],
      selectedDomain: 'All',
      searchQuery: '',
      isLoading: false,
      error: null,
    });
  });

  test('fetches mentors directory', async () => {
    await useMentorStore.getState().fetchMentors();
    const state = useMentorStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.mentors.length).toBeGreaterThan(0);
    expect(state.error).toBeNull();
  });

  test('submits booking request successfully', async () => {
    const res = await useMentorStore.getState().requestBooking({
      mentorId: 'm-1',
      mentorName: 'Kavita Sundaram',
      mentorRole: 'Senior SRE @ Google',
      preferredTime: 'Saturday 11 AM',
      topic: 'Systems Architecture',
      message: 'Looking for advice',
    });

    expect(res.success).toBe(true);
    expect(useMentorStore.getState().bookingRequests.length).toBeGreaterThan(0);
  });
});
