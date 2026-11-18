import { useMentorStore } from '../../src/store/mentorStore';
import { mentorService } from '../../src/services/mentorService';
import { Mentor, BookingRequest } from '../../src/types/models';

describe('MentorStore', () => {
  const sampleMentor: Mentor = {
    id: 'm-1',
    name: 'Kavita Sundaram',
    designation: 'Senior Infrastructure Engineer',
    organization: 'Google Cloud',
    bio: 'Alumna batch of 2018.',
    domains: ['Software Engineering', 'System Design'],
    skills: ['Go', 'Kubernetes'],
    yearsOfExperience: 7,
    isAvailable: true,
  };

  const sampleBooking: BookingRequest = {
    id: 'br-1',
    mentorId: 'm-1',
    mentorName: 'Kavita Sundaram',
    mentorRole: 'Senior SRE @ Google',
    preferredTime: 'Saturday 11 AM',
    topic: 'Systems Architecture',
    message: 'Looking for advice',
    status: 'REQUESTED',
    createdAt: '2026-10-24T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useMentorStore.setState({
      mentors: [],
      bookingRequests: [],
      selectedDomain: 'All',
      searchQuery: '',
      isLoading: false,
      isSubmittingBooking: false,
      error: null,
    });
  });

  test('fetches mentors directory', async () => {
    jest.spyOn(mentorService, 'getMentors').mockResolvedValueOnce({
      success: true,
      data: [sampleMentor],
      statusCode: 200,
    });

    await useMentorStore.getState().fetchMentors();
    const state = useMentorStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.mentors.length).toBe(1);
    expect(state.mentors[0].name).toBe('Kavita Sundaram');
    expect(state.error).toBeNull();
  });

  test('submits booking request successfully', async () => {
    jest.spyOn(mentorService, 'requestBooking').mockResolvedValueOnce({
      success: true,
      data: sampleBooking,
      statusCode: 201,
    });

    const res = await useMentorStore.getState().requestBooking({
      mentorId: 'm-1',
      mentorName: 'Kavita Sundaram',
      mentorRole: 'Senior SRE @ Google',
      preferredTime: 'Saturday 11 AM',
      topic: 'Systems Architecture',
      message: 'Looking for advice',
    });

    expect(res.success).toBe(true);
    expect(useMentorStore.getState().bookingRequests.length).toBe(1);
  });
});
