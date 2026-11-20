import {
  validateEmail,
  validatePassword,
  validateFullName,
  validateInstitution,
  validateDepartment,
  validateGraduationYear,
  validateCgpa,
  validateBio,
  validateUrl,
  validateSkillName,
  validateProjectTitle,
  validateExperienceRole,
  validateExperienceCompany,
  validateDateOrder,
  validateCertificationName,
  validateCertificationIssuer,
  validateBookingTime,
  validateBookingTopic,
  validateQuestionTitle,
  validateQuestionDescription,
  validateQuestionTopics,
  validateAnswerContent,
  validateDocumentUrl,
  validateResumeTargetRole,
  validateAtsResumeText,
  validateChatMessage,
  validateAiPrompt,
  validateRequired,
} from '../../src/utils/validation';

describe('Client-Side Validation Engine', () => {
  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('Campus email address is required.');
      expect(validateEmail('   ')).toBe('Campus email address is required.');
    });

    it('returns error for invalid email format', () => {
      expect(validateEmail('invalid-email')).toContain('valid email');
      expect(validateEmail('user@')).toContain('valid email');
      expect(validateEmail('@domain.com')).toContain('valid email');
      expect(validateEmail('user@domain')).toContain('valid email');
    });

    it('returns null for valid campus email', () => {
      expect(validateEmail('student@campus.edu')).toBeNull();
      expect(validateEmail('aditya.verma@nit.ac.in')).toBeNull();
      expect(validateEmail('  test@example.com  ')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('validates required password on sign in', () => {
      expect(validatePassword('')).toBe('Password is required.');
      expect(validatePassword('secret123')).toBeNull();
    });

    it('enforces strong password rules for sign up', () => {
      expect(validatePassword('', true)).toBe('Password is required.');
      expect(validatePassword('short', true)).toBe('Password must be at least 8 characters long.');
      expect(validatePassword('nouppercase123!', true)).toContain('uppercase letter');
      expect(validatePassword('NOLOWERCASE123!', true)).toContain('lowercase letter');
      expect(validatePassword('NoDigitsOrSymbols', true)).toContain('number or special character');
      expect(validatePassword('StrongPass123!', true)).toBeNull();
    });
  });

  describe('validateFullName', () => {
    it('requires at least 2 valid characters', () => {
      expect(validateFullName('')).toBe('Full name is required.');
      expect(validateFullName('A')).toBe('Full name must be at least 2 characters.');
      expect(validateFullName('Aditya123')).toContain('letters, spaces, hyphens, and periods');
      expect(validateFullName('Aditya Verma')).toBeNull();
      expect(validateFullName("O'Connor")).toBeNull();
    });
  });

  describe('validateInstitution & validateDepartment', () => {
    it('validates institution correctly', () => {
      expect(validateInstitution('')).toBe('Institution / College name is required.');
      expect(validateInstitution('NIT')).toBeNull();
    });

    it('validates department correctly', () => {
      expect(validateDepartment('')).toBe('Department is required.');
      expect(validateDepartment('CSE')).toBeNull();
    });
  });

  describe('validateGraduationYear', () => {
    it('validates year bounds', () => {
      expect(validateGraduationYear('')).toBe('Graduation year is required.');
      expect(validateGraduationYear('abc')).toContain('valid 4-digit');
      expect(validateGraduationYear('2010')).toContain('must be between');
      expect(validateGraduationYear('2040')).toContain('must be between');
      expect(validateGraduationYear('2027')).toBeNull();
      expect(validateGraduationYear(2028)).toBeNull();
    });
  });

  describe('validateCgpa', () => {
    it('allows empty/optional CGPA', () => {
      expect(validateCgpa('')).toBeNull();
    });

    it('validates range and format', () => {
      expect(validateCgpa('8.84')).toBeNull();
      expect(validateCgpa('9.5 / 10')).toBeNull();
      expect(validateCgpa('10.0')).toBeNull();
      expect(validateCgpa('11.5')).toContain('between 0.0 and 10.0');
      expect(validateCgpa('-2')).toContain('between 0.0 and 10.0');
      expect(validateCgpa('invalid')).toContain('valid numeric score');
    });
  });

  describe('validateUrl', () => {
    it('validates URLs correctly', () => {
      expect(validateUrl('', 'Portfolio', false)).toBeNull();
      expect(validateUrl('', 'Portfolio', true)).toBe('Portfolio is required.');
      expect(validateUrl('https://github.com/user')).toBeNull();
      expect(validateUrl('invalid-url')).toContain('valid URL');
    });
  });

  describe('validateQuestionTitle & Description', () => {
    it('validates question title', () => {
      expect(validateQuestionTitle('')).toBe('Question title is required.');
      expect(validateQuestionTitle('How?')).toContain('at least 5 characters');
      expect(validateQuestionTitle('How to handle database transactions in Spring Boot?')).toBeNull();
    });

    it('validates question description', () => {
      expect(validateQuestionDescription('')).toBe('Detailed description is required.');
      expect(validateQuestionDescription('Short')).toContain('at least 15 characters');
      expect(
        validateQuestionDescription('This is a sufficiently long question description explaining the full context.')
      ).toBeNull();
    });

    it('validates question topics', () => {
      expect(validateQuestionTopics([])).toBe('Please select at least one topic tag.');
      expect(validateQuestionTopics(['1', '2', '3', '4', '5', '6'])).toContain('up to 5');
      expect(validateQuestionTopics(['DSA', 'Web Development'])).toBeNull();
    });
  });

  describe('validateAnswerContent', () => {
    it('validates answer length', () => {
      expect(validateAnswerContent('')).toBe('Answer cannot be empty.');
      expect(validateAnswerContent('ok')).toContain('at least 5 characters');
      expect(validateAnswerContent('You should use @Transactional with propagation required.')).toBeNull();
    });
  });

  describe('validateBooking', () => {
    it('validates time and topic', () => {
      expect(validateBookingTime('')).toBe('Preferred time or schedule is required.');
      expect(validateBookingTime('Mon 10am')).toBeNull();

      expect(validateBookingTopic('')).toBe('Discussion topic is required.');
      expect(validateBookingTopic('Hi')).toContain('at least 5 characters');
      expect(validateBookingTopic('Backend System Architecture')).toBeNull();
    });
  });

  describe('validateVerification', () => {
    it('validates document URL', () => {
      expect(validateDocumentUrl('')).toBe('Document URL or upload link is required.');
      expect(validateDocumentUrl('not-a-link')).toContain('valid document URL');
      expect(validateDocumentUrl('https://example.com/id.pdf')).toBeNull();
    });
  });

  describe('validateResume', () => {
    it('validates target role and ATS text', () => {
      expect(validateResumeTargetRole('')).toBe('Target job title is required.');
      expect(validateResumeTargetRole('Full Stack Engineer')).toBeNull();

      expect(validateAtsResumeText('')).toContain('required for ATS');
      expect(validateAtsResumeText('Short text')).toContain('at least 20 characters');
      expect(validateAtsResumeText('Experience building high performance React Native and Spring microservices.')).toBeNull();
    });
  });

  describe('validateChatMessage & AiPrompt', () => {
    it('validates chat and prompt', () => {
      expect(validateChatMessage('')).toBe('Message cannot be empty.');
      expect(validateChatMessage('   ')).toBe('Message cannot be empty.');
      expect(validateChatMessage('Hello peer!')).toBeNull();

      expect(validateAiPrompt('')).toBe('Prompt cannot be empty.');
      expect(validateAiPrompt('Explain Dijkstra algorithm')).toBeNull();
    });
  });
});
