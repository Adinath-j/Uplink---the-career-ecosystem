import { StudentProfile } from '../../types/models';

/**
 * SAMPLE STUDENT PROFILE DATA
 *
 * Seed data for verifying student profile presentation, skill display,
 * project showcase, and profile edit workflows.
 */

export const MOCK_STUDENT_PROFILE: StudentProfile = {
  id: 'u-current',
  email: 'aditya.verma@campus.edu',
  fullName: 'Aditya Verma',
  role: 'STUDENT',
  institution: 'National Institute of Technology',
  department: 'Computer Science and Engineering',
  program: 'Bachelor of Technology (B.Tech)',
  graduationYear: 2027,
  cgpa: '8.84 / 10.0',
  bio: 'Undergraduate software developer interested in distributed backend systems, API design, and cloud-native applications. Active open-source contributor.',
  skills: [
    'Java',
    'Spring Boot',
    'TypeScript',
    'React Native',
    'PostgreSQL',
    'Docker',
    'Git',
    'Data Structures & Algorithms',
    'System Design Basics',
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Distributed Task Queue & Scheduler',
      description:
        'A lightweight job execution engine in Java and Redis featuring retry backoff, dead-letter exchanges, and worker heartbeat telemetry.',
      technologies: ['Java 21', 'Spring Boot', 'Redis', 'Docker'],
      link: 'https://github.com/aditya/task-scheduler',
      startDate: 'Aug 2026',
      endDate: 'Oct 2026',
    },
    {
      id: 'proj-2',
      title: 'Campus Peer Resource Marketplace',
      description:
        'Mobile application connecting university peers for textbook exchanges and laboratory equipment sharing with real-time push notifications.',
      technologies: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL'],
      link: 'https://github.com/aditya/campus-exchange',
      startDate: 'Jan 2026',
      endDate: 'May 2026',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Backend Engineering Intern',
      organization: 'Vanguard Systems Lab',
      location: 'Bengaluru (Remote)',
      duration: 'May 2026 – Jul 2026',
      description:
        'Developed RESTful endpoints for enterprise inventory synchronization. Reduced API response latency by 32% through index reorganization and Redis query caching.',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Oracle Certified Associate, Java SE 17 Developer',
      issuingOrganization: 'Oracle Corporation',
      issueDate: 'March 2026',
      credentialUrl: 'https://cert.oracle.com/verify/1029482',
    },
  ],
  achievements: [
    'Ranked 14th out of 450+ participants in Inter-College Algorithmic Hackathon 2026.',
    'Department Academic Merit Scholarship recipient (2025-2026).',
    'Maintainer for College Open Source Club with 120+ student members.',
  ],
};
