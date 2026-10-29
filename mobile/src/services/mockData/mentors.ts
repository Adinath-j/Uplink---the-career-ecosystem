import { Mentor, BookingRequest } from '../../types/models';

/**
 * SAMPLE MENTORS DATA
 *
 * Seed data for verifying the Find Mentors directory and booking workflow.
 * Clearly labeled as sample data.
 */

export const MOCK_MENTORS: Mentor[] = [
  {
    id: 'm-1',
    name: 'Kavita Sundaram',
    designation: 'Senior Infrastructure Engineer',
    organization: 'Google Cloud',
    bio: 'Alumna batch of 2018. Over 7 years of industry experience across distributed tracing, Kubernetes platforms, and reliability engineering. Glad to assist with systems architecture and backend career roadmaps.',
    domains: ['Software Engineering', 'System Design'],
    skills: ['Go', 'Kubernetes', 'Distributed Systems', 'Site Reliability', 'Microservices'],
    yearsOfExperience: 7,
    isAvailable: true,
    availableDays: 'Saturdays, 10:00 AM - 1:00 PM IST',
  },
  {
    id: 'm-2',
    name: 'Sameer Joshi',
    designation: 'Lead Product Manager',
    organization: 'Microsoft Teams',
    bio: 'Focusing on collaboration tools, telemetry-driven feature prioritization, and developer experience. Mentoring students on product thinking, case interviews, and resume structuring.',
    domains: ['Product Management', 'Career Guidance'],
    skills: ['Product Strategy', 'User Research', 'Metrics Definition', 'Roadmapping'],
    yearsOfExperience: 9,
    isAvailable: true,
    availableDays: 'Friday evenings, 6:00 PM - 8:00 PM IST',
  },
  {
    id: 'm-3',
    name: 'Dr. Tarun Nambiar',
    designation: 'Principal Applied Scientist',
    organization: 'Amazon AWS AI Labs',
    bio: 'PhD from IISc. Research interests span LLM inference efficiency, multilingual tokenization, and vector databases. Guiding students interested in AI research and postgraduate studies.',
    domains: ['Data Science & AI', 'Software Engineering'],
    skills: ['PyTorch', 'Deep Learning', 'Transformers', 'MLOps', 'Vector Search'],
    yearsOfExperience: 11,
    isAvailable: true,
    availableDays: 'Sunday mornings, 11:00 AM - 1:00 PM IST',
  },
  {
    id: 'm-4',
    name: 'Rashmi Kulkarni',
    designation: 'Staff Product Designer',
    organization: 'Razorpay',
    bio: 'Designing financial workflows and accessible design systems. Available for student portfolio critiques, interface usability principles, and design interview preparation.',
    domains: ['UI/UX', 'Product Management'],
    skills: ['Design Systems', 'Figma', 'User Research', 'Accessibility', 'Interaction Design'],
    yearsOfExperience: 6,
    isAvailable: true,
    availableDays: 'Thursday afternoons, 4:00 PM - 6:00 PM IST',
  },
  {
    id: 'm-5',
    name: 'Harsh Vardhan',
    designation: 'Engineering Manager',
    organization: 'Swiggy',
    bio: 'Heading real-time delivery dispatch algorithms. Can review coding interview approaches, system design trade-offs, and transitions from university to high-growth tech roles.',
    domains: ['Software Engineering', 'System Design', 'Career Guidance'],
    skills: ['Java', 'Spring Boot', 'Kafka', 'System Architecture', 'Career Navigation'],
    yearsOfExperience: 10,
    isAvailable: false,
    availableDays: 'Currently at capacity for this month',
  },
];

export const MOCK_BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: 'br-1',
    mentorId: 'm-1',
    mentorName: 'Kavita Sundaram',
    mentorRole: 'Senior Infrastructure Engineer @ Google Cloud',
    preferredTime: 'Saturday, Nov 07 • 11:00 AM IST',
    topic: 'Backend Architecture & SRE Career Transition',
    message: 'I have built a microservices project using Spring Boot and Docker. Would love feedback on telemetry and how to prepare for cloud platform roles.',
    status: 'CONFIRMED',
    createdAt: '2026-10-24T10:00:00Z',
  },
];
