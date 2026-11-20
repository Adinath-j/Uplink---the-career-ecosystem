/**
 * Uplink Client-Side Validation Engine
 *
 * Centralized, strongly-typed validators and formatters with user-friendly error messages
 * across all client modules: Auth, Profile, Mentors, Q&A, Resume Studio, Verification, Messaging, Settings.
 */

// RFC 5322 compliant email regex
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Standard web/CDN URL regex (http/https)
export const URL_REGEX =
  /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

// Permissive URL regex that accepts standard hostnames, ports, and query parameters
export const PERMISSIVE_URL_REGEX =
  /^(https?:\/\/)?(([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|localhost|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?(\/[^\s]*)?$/i;

// CGPA regex: 0.00 to 10.00 or 0.0 to 4.0
export const CGPA_REGEX = /^(10(\.0{1,2})?|[0-9](\.[0-9]{1,2})?)$/;

// ---------------------------------------------------------------------------
// 1. Auth Module Validators
// ---------------------------------------------------------------------------

export function validateEmail(email: string): string | null {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return 'Campus email address is required.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g. student@campus.edu).';
  }
  return null;
}

export function validatePassword(password: string, isSignUp = false): string | null {
  const val = password || '';
  if (!val) {
    return 'Password is required.';
  }
  if (!isSignUp) {
    // For sign in, just ensure non-empty
    return null;
  }
  if (val.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(val)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(val)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (!/[0-9]/.test(val) && !/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
    return 'Password must contain at least one number or special character.';
  }
  return null;
}

export function validateFullName(name: string): string | null {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return 'Full name is required.';
  }
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  if (trimmed.length > 80) {
    return 'Full name cannot exceed 80 characters.';
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return 'Full name should only contain letters, spaces, hyphens, and periods.';
  }
  return null;
}

export function validateInstitution(institution: string): string | null {
  const trimmed = (institution || '').trim();
  if (!trimmed) {
    return 'Institution / College name is required.';
  }
  if (trimmed.length < 2) {
    return 'Institution name must be at least 2 characters.';
  }
  if (trimmed.length > 120) {
    return 'Institution name cannot exceed 120 characters.';
  }
  return null;
}

export function validateDepartment(department: string): string | null {
  const trimmed = (department || '').trim();
  if (!trimmed) {
    return 'Department is required.';
  }
  if (trimmed.length < 2) {
    return 'Department must be at least 2 characters.';
  }
  if (trimmed.length > 80) {
    return 'Department cannot exceed 80 characters.';
  }
  return null;
}

export function validateGraduationYear(year: string | number): string | null {
  const str = String(year || '').trim();
  if (!str) {
    return 'Graduation year is required.';
  }
  const parsed = parseInt(str, 10);
  if (isNaN(parsed) || !/^\d{4}$/.test(str)) {
    return 'Please enter a valid 4-digit graduation year.';
  }
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 6; // e.g. 2020
  const maxYear = currentYear + 9; // e.g. 2035
  if (parsed < minYear || parsed > maxYear) {
    return `Graduation year must be between ${minYear} and ${maxYear}.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. Profile Module Validators
// ---------------------------------------------------------------------------

export function validateCgpa(cgpa: string): string | null {
  const trimmed = (cgpa || '').trim();
  if (!trimmed) {
    return null; // CGPA is optional
  }
  // Strip trailing "/ 10" or "/ 10.0" if user typed it
  const clean = trimmed.replace(/\s*\/\s*(10(\.0)?|4(\.0)?)$/, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num) || !/^-?\d+(\.\d+)?$/.test(clean)) {
    return 'CGPA must be a valid numeric score (e.g. 8.84 or 3.9).';
  }
  if (num < 0 || num > 10) {
    return 'CGPA must be between 0.0 and 10.0.';
  }
  return null;
}

export function validateBio(bio: string): string | null {
  const trimmed = (bio || '').trim();
  if (trimmed.length > 500) {
    return 'Bio cannot exceed 500 characters.';
  }
  return null;
}

export function validateUrl(url: string, fieldName = 'URL', required = false): string | null {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return required ? `${fieldName} is required.` : null;
  }
  if (trimmed.length > 500) {
    return `${fieldName} cannot exceed 500 characters.`;
  }
  if (!PERMISSIVE_URL_REGEX.test(trimmed)) {
    return `Please enter a valid URL (e.g. https://github.com/username).`;
  }
  return null;
}

export function validateSkillName(name: string): string | null {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return 'Skill name is required.';
  }
  if (trimmed.length < 2) {
    return 'Skill name must be at least 2 characters.';
  }
  if (trimmed.length > 50) {
    return 'Skill name cannot exceed 50 characters.';
  }
  return null;
}

export function validateSkillCategory(category: string): string | null {
  const trimmed = (category || '').trim();
  if (trimmed.length > 40) {
    return 'Category cannot exceed 40 characters.';
  }
  return null;
}

export function validateProjectTitle(title: string): string | null {
  const trimmed = (title || '').trim();
  if (!trimmed) {
    return 'Project title is required.';
  }
  if (trimmed.length < 3) {
    return 'Project title must be at least 3 characters.';
  }
  if (trimmed.length > 100) {
    return 'Project title cannot exceed 100 characters.';
  }
  return null;
}

export function validateProjectDescription(desc: string): string | null {
  const trimmed = (desc || '').trim();
  if (trimmed.length > 1000) {
    return 'Description cannot exceed 1000 characters.';
  }
  return null;
}

export function validateExperienceRole(role: string): string | null {
  const trimmed = (role || '').trim();
  if (!trimmed) {
    return 'Role / Job title is required.';
  }
  if (trimmed.length < 2) {
    return 'Role title must be at least 2 characters.';
  }
  if (trimmed.length > 100) {
    return 'Role title cannot exceed 100 characters.';
  }
  return null;
}

export function validateExperienceCompany(company: string): string | null {
  const trimmed = (company || '').trim();
  if (!trimmed) {
    return 'Company / Organization name is required.';
  }
  if (trimmed.length < 2) {
    return 'Company name must be at least 2 characters.';
  }
  if (trimmed.length > 100) {
    return 'Company name cannot exceed 100 characters.';
  }
  return null;
}

export function validateDateOrder(startDate?: string, endDate?: string): string | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
    return 'End date cannot be earlier than start date.';
  }
  return null;
}

export function validateCertificationName(name: string): string | null {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return 'Certification name is required.';
  }
  if (trimmed.length < 2) {
    return 'Certification name must be at least 2 characters.';
  }
  if (trimmed.length > 120) {
    return 'Certification name cannot exceed 120 characters.';
  }
  return null;
}

export function validateCertificationIssuer(issuer: string): string | null {
  const trimmed = (issuer || '').trim();
  if (!trimmed) {
    return 'Issuing organization is required.';
  }
  if (trimmed.length < 2) {
    return 'Issuing organization must be at least 2 characters.';
  }
  if (trimmed.length > 100) {
    return 'Issuing organization cannot exceed 100 characters.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. Mentorship Module Validators
// ---------------------------------------------------------------------------

export function validateBookingTime(time: string): string | null {
  const trimmed = (time || '').trim();
  if (!trimmed) {
    return 'Preferred time or schedule is required.';
  }
  if (trimmed.length < 3) {
    return 'Please specify a valid time window.';
  }
  if (trimmed.length > 100) {
    return 'Time window description cannot exceed 100 characters.';
  }
  return null;
}

export function validateBookingTopic(topic: string): string | null {
  const trimmed = (topic || '').trim();
  if (!trimmed) {
    return 'Discussion topic is required.';
  }
  if (trimmed.length < 5) {
    return 'Discussion topic must be at least 5 characters.';
  }
  if (trimmed.length > 120) {
    return 'Discussion topic cannot exceed 120 characters.';
  }
  return null;
}

export function validateBookingMessage(message: string): string | null {
  const trimmed = (message || '').trim();
  if (trimmed.length > 600) {
    return 'Message cannot exceed 600 characters.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// 4. Q&A Module Validators
// ---------------------------------------------------------------------------

export function validateQuestionTitle(title: string): string | null {
  const trimmed = (title || '').trim();
  if (!trimmed) {
    return 'Question title is required.';
  }
  if (trimmed.length < 5) {
    return 'Question title must be at least 5 characters long.';
  }
  if (trimmed.length > 160) {
    return 'Question title cannot exceed 160 characters.';
  }
  return null;
}

export function validateQuestionDescription(desc: string): string | null {
  const trimmed = (desc || '').trim();
  if (!trimmed) {
    return 'Detailed description is required.';
  }
  if (trimmed.length < 15) {
    return 'Please provide more details (at least 15 characters).';
  }
  if (trimmed.length > 4000) {
    return 'Description cannot exceed 4000 characters.';
  }
  return null;
}

export function validateQuestionTopics(topics: string[]): string | null {
  if (!Array.isArray(topics) || topics.length === 0) {
    return 'Please select at least one topic tag.';
  }
  if (topics.length > 5) {
    return 'You can select up to 5 topic tags per question.';
  }
  return null;
}

export function validateAnswerContent(answer: string): string | null {
  const trimmed = (answer || '').trim();
  if (!trimmed) {
    return 'Answer cannot be empty.';
  }
  if (trimmed.length < 5) {
    return 'Answer must be at least 5 characters long.';
  }
  if (trimmed.length > 4000) {
    return 'Answer cannot exceed 4000 characters.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// 5. Verification Module Validators
// ---------------------------------------------------------------------------

export function validateDocumentUrl(url: string): string | null {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return 'Document URL or upload link is required.';
  }
  if (!PERMISSIVE_URL_REGEX.test(trimmed)) {
    return 'Please provide a valid document URL (starting with http:// or https://).';
  }
  return null;
}

export function validateVerificationRemarks(remarks: string): string | null {
  const trimmed = (remarks || '').trim();
  if (trimmed.length > 400) {
    return 'Remarks cannot exceed 400 characters.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// 6. Resume Studio Module Validators
// ---------------------------------------------------------------------------

export function validateResumeTargetRole(role: string): string | null {
  const trimmed = (role || '').trim();
  if (!trimmed) {
    return 'Target job title is required.';
  }
  if (trimmed.length < 3) {
    return 'Target job title must be at least 3 characters.';
  }
  if (trimmed.length > 100) {
    return 'Target job title cannot exceed 100 characters.';
  }
  return null;
}

export function validateAtsResumeText(text: string): string | null {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return 'Resume text or bullet points are required for ATS evaluation.';
  }
  if (trimmed.length < 20) {
    return 'Please paste at least 20 characters of resume content.';
  }
  if (trimmed.length > 15000) {
    return 'Resume text exceeds maximum limit (15,000 characters).';
  }
  return null;
}

// ---------------------------------------------------------------------------
// 7. Messaging & AI Chat Module Validators
// ---------------------------------------------------------------------------

export function validateChatMessage(text: string): string | null {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return 'Message cannot be empty.';
  }
  if (trimmed.length > 2000) {
    return 'Message exceeds maximum length of 2000 characters.';
  }
  return null;
}

export function validateAiPrompt(prompt: string): string | null {
  const trimmed = (prompt || '').trim();
  if (!trimmed) {
    return 'Prompt cannot be empty.';
  }
  if (trimmed.length > 2000) {
    return 'Prompt exceeds maximum length of 2000 characters.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// 8. General Purpose Validators
// ---------------------------------------------------------------------------

export function validateRequired(
  value: string,
  fieldName: string,
  minLength = 1,
  maxLength?: number
): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters.`;
  }
  if (maxLength && trimmed.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters.`;
  }
  return null;
}
