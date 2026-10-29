/**
 * Domain Models for UPLINK
 * Source of truth: docs/REQUIREMENTS.md, docs/PROJECT.md, docs/FEATURES.md
 */

export type UserRole = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  location?: string;
  duration: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  institution: string;
  department: string;
  program: string;
  graduationYear: number;
  cgpa?: string;
  bio?: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
  achievements: string[];
}

export type OpportunityCategory =
  | 'Internship'
  | 'Job'
  | 'Hackathon'
  | 'Competition'
  | 'Scholarship'
  | 'Workshop'
  | 'Certification'
  | 'Training'
  | 'Research'
  | 'Apprenticeship';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export interface Opportunity {
  id: string;
  type: OpportunityCategory;
  title: string;
  organization: string;
  organizationLogo?: string;
  location: string;
  workMode: WorkMode;
  stipendOrSalary?: string;
  deadline: string; // ISO date string or formatted date
  description: string;
  eligibility: string;
  requiredSkills: string[];
  applicationMethod: 'INTERNAL' | 'EXTERNAL';
  externalUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'ACCEPTED';

export interface ApplicationRecord {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  organization: string;
  type: OpportunityCategory;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
}

export type QAFeedTab = 'For You' | 'Unanswered' | 'Trending' | 'My Questions';

export type QATopic =
  | 'DSA'
  | 'Web Development'
  | 'AI/ML'
  | 'Placements'
  | 'Academics'
  | 'Project Help'
  | 'Resume'
  | 'System Design'
  | 'DevOps';

export interface Question {
  id: string;
  title: string;
  description: string;
  topicTags: string[];
  authorId: string;
  authorName: string;
  authorAcademicContext: string;
  authorAvatar?: string;
  createdAt: string;
  answerCount: number;
  sameDoubtCount: number;
  hasUserMarkedSameDoubt: boolean;
  isUnanswered: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  helpfulCount: number;
  isAccepted: boolean;
  hasUserMarkedHelpful: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  designation: string;
  organization: string;
  avatar?: string;
  bio: string;
  domains: string[];
  skills: string[];
  yearsOfExperience: number;
  isAvailable: boolean;
  availableDays?: string;
}

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'DECLINED'
  | 'COMPLETED';

export interface BookingRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  preferredTime: string;
  topic: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  location: string;
  category: string;
  link?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'APPLICATION' | 'QA' | 'MENTORSHIP' | 'ANNOUNCEMENT';
  createdAt: string;
  isRead: boolean;
  targetId?: string;
}
