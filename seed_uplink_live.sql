-- ===================================================================
-- UPLINK PRODUCTION LIVE SEED SCRIPT: seed_uplink_live.sql
-- Generated from Uplink-Backend/Docs/seed_blueprint.md
-- Strict Topological Ingestion: Tiers 1 -> 6 (Supabase PostgreSQL)
-- ===================================================================

BEGIN;

-- -------------------------------------------------------------------
-- STEP A: WIPE STALE DATA (42 TABLES)
-- -------------------------------------------------------------------
TRUNCATE TABLE
    audit_logs,
    ocr_jobs,
    documents,
    notifications,
    recommendations,
    skill_gaps,
    assessment_attempts,
    assessment_questions,
    assessments,
    likes,
    comments,
    posts,
    messages,
    conversation_members,
    conversations,
    application_status_history,
    applications,
    opportunity_sources,
    opportunity_skills,
    saved_opportunities,
    opportunities,
    recruiters,
    companies,
    answer_helpfuls,
    question_doubts,
    answers,
    questions,
    mentor_bookings,
    mentor_profiles,
    achievements,
    certifications,
    experiences,
    projects,
    user_skills,
    skills,
    education,
    profiles,
    admins,
    user_verifications,
    user_roles,
    users,
    roles
RESTART IDENTITY CASCADE;


-- -------------------------------------------------------------------
-- STEP B: TOPOLOGICAL INSERTION (TIERS 1 -> 5)
-- -------------------------------------------------------------------

-- TIER 1: ROLES
INSERT INTO roles (name, description) VALUES
('ROLE_STUDENT', 'Academic Student Candidate & Job Seeker'),
('ROLE_RECRUITER', 'Corporate Industry Recruiter'),
('ROLE_ADMIN', 'Platform Administrator'),
('ROLE_FACULTY', 'Academic Faculty Member'),
('ROLE_ALUMNI', 'University Alumni Mentor')
ON CONFLICT (name) DO NOTHING;


-- TIER 1: USERS (Valid BCrypt Hashes: Student@123, Admin@123, Recruiter@123)
INSERT INTO users (id, email, password, full_name, phone, is_verified, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@uplink.edu', '$2a$10$WcM5xIX3aid4vAYiMRCBjeJhSQLjumAbSBecCqvWcF9lNekLUu5fK', 'Uplink Platform Admin', '+91-9876543201', TRUE, TRUE),
('22222222-2222-2222-2222-222222222222', 'ingestor@uplink.edu', '$2a$10$WcM5xIX3aid4vAYiMRCBjeJhSQLjumAbSBecCqvWcF9lNekLUu5fK', 'Uplink Opportunity Sync', '+91-9876543202', TRUE, TRUE),
('33333333-3333-3333-3333-333333333333', 'recruiter@uplink.edu', '$2a$10$mdYYLjUl3Z.J5r5Bvq27Ae2RJU0jT6oarBMma8qcySbbGRLBVf0Hu', 'Ananya Deshmukh', '+91-9876543203', TRUE, TRUE),
('44444444-4444-4444-4444-444444444444', 'student@uplink.edu', '$2a$10$mOlDuZoV4bNu8b.lGk/acuZSofvsdtlZldf70WCW5lQf9s1S8rpwa', 'Rohan Kulkarni', '+91-9876543204', TRUE, TRUE),
('55555555-5555-5555-5555-555555555555', 'peer1@uplink.edu', '$2a$10$mOlDuZoV4bNu8b.lGk/acuZSofvsdtlZldf70WCW5lQf9s1S8rpwa', 'Sneha Nair', '+91-9876543205', TRUE, TRUE),
('66666666-6666-6666-6666-666666666666', 'peer2@uplink.edu', '$2a$10$mOlDuZoV4bNu8b.lGk/acuZSofvsdtlZldf70WCW5lQf9s1S8rpwa', 'Karthik Subramanian', '+91-9876543206', FALSE, TRUE)
ON CONFLICT (email) DO NOTHING;


-- TIER 1: SKILLS
INSERT INTO skills (name, category) VALUES
('Python', 'Programming'),
('Java', 'Backend'),
('JavaScript', 'Frontend'),
('TypeScript', 'Programming'),
('C++', 'Programming'),
('C#', 'Programming'),
('SQL', 'Database'),
('HTML', 'Frontend'),
('CSS', 'Frontend'),
('React.js', 'Frontend'),
('AngularJS', 'Frontend'),
('React Native', 'Mobile'),
('Node.js', 'Backend'),
('Express.js', 'Backend'),
('Spring Boot', 'Backend'),
('FastAPI', 'Backend'),
('.NET Core', 'Backend'),
('Ruby on Rails', 'Backend'),
('MongoDB', 'Database'),
('PostgreSQL', 'Database'),
('MySQL', 'Database'),
('REST APIs', 'Backend'),
('Microservices Architecture', 'Architecture'),
('System Design', 'Architecture'),
('Distributed Systems', 'Architecture'),
('Machine Learning', 'AI/ML'),
('Large Language Models (LLMs)', 'AI/ML'),
('Natural Language Processing (NLP)', 'AI/ML'),
('Generative AI', 'AI/ML'),
('Agentic AI', 'AI/ML'),
('Prompt Engineering', 'AI/ML'),
('TensorFlow', 'AI/ML'),
('PyTorch', 'AI/ML'),
('Databricks', 'Cloud'),
('AWS', 'Cloud'),
('Docker', 'DevOps'),
('CI/CD Pipelines', 'DevOps'),
('Git', 'Tools'),
('Selenium', 'Testing'),
('PowerApps', 'Low-Code'),
('Data Analysis', 'Data'),
('Data Structures and Algorithms', 'Computer Science')
ON CONFLICT (name) DO NOTHING;

-- TIER 1: COMPANIES (Verified Employers + Portal Listing Employers)
INSERT INTO companies (name, type, website, is_verified, description) VALUES
('AccioJob', 'EdTech & Placement', 'https://acciojob.com/', TRUE, 'Full-stack training and off-campus job curation platform6'),
('Amadeus Labs', 'Travel Tech', 'https://www.hirist.tech/c/full-stack-jobs', TRUE, 'Travel technology R\&D center hiring SDE III Full Stack in Bengaluru9'),
('Appinventiv', 'Software Services', 'https://interndoor.com/', TRUE, 'Software development firm hiring CS/IT software interns5'),
('Ascendion', 'Digital Engineering', 'https://placement.acciojob.com/', TRUE, 'Global digital engineering and software services'),
('BIT Mesra', 'Academia', 'https://unstop.com/', TRUE, 'Birla Institute of Technology, Mesra, Ranchi1'),
('Baker Hughes', 'Energy Technology', 'https://interndoor.com/', TRUE, 'Energy technology firm hiring digital technology trainees5'),
('BizTranSights', 'Analytics & Tech', 'https://placement.acciojob.com/', FALSE, 'Technology analytics and web engineering'),
('Brackets', 'Software Development', 'https://placement.acciojob.com/', FALSE, 'Web applications and digital products'),
('BuildX', 'Tech Community', 'https://unstop.com/', FALSE, 'Organizer of CodeWarriors India 2026 National Hackathon2'),
('Codeatrix', 'EdTech / Software', 'https://unstop.com/', FALSE, 'Software engineering and development firm'),
('Coy', 'Tech Startup', 'https://unstop.com/', FALSE, 'Software technology employer hiring engineering interns'),
('Cropin', 'AgriTech', 'https://interndoor.com/', TRUE, 'AgriTech company hiring quality assurance interns5'),
('Cumulations Technologies', 'Mobile & Web', 'https://www.hirist.tech/', TRUE, 'MERN stack and mobile applications engineering'),
('CyberClipper InfoTech LLP', 'Software Development', 'https://placement.acciojob.com/', FALSE, 'Enterprise full stack and backend applications'),
('DataPure', 'Data Engineering', 'https://www.hirist.tech/', TRUE, 'Data systems and full stack engineering firm'),
('DevHarbour', 'Tech Community', 'https://unstop.com/', FALSE, 'Organizer of INNOVATE Hackathon 202640'),
('Developer bazaar Technologies', 'IT Services', 'https://placement.acciojob.com/', FALSE, 'Software development and web applications firm'),
('EduGuruCool Operating Systems Private Limited', 'EdTech / Systems', 'https://unstop.com/', FALSE, 'Operating systems and education software developer'),
('EduLinkUp', 'Tech Community', 'https://unstop.com/', FALSE, 'Organizer of ELU Build hackathon1'),
('Emerson', 'Industrial Automation', 'https://interndoor.com/', TRUE, 'Industrial software employer hiring software engineer trainees5'),
('Euphoric Thought', 'Tech Solutions', 'https://www.hirist.tech/', TRUE, 'Digital consulting and MERN stack software solutions'),
('Expinator Web Technology (P) Ltd.', 'Web Development', 'https://placement.acciojob.com/', FALSE, 'Web technology and software solutions'),
('FrontPage', 'Startup (YC)', 'https://www.workatastartup.com/jobs/122543', TRUE, 'Startup hiring engineering interns via YC Work at a Startup14'),
('GlobalLogic', 'Digital Engineering', 'https://www.hirist.tech/k/mern-stack-jobs', TRUE, 'Engineering firm hiring MERN stack developers in Hyderabad8'),
('Google', 'Enterprise Tech', 'https://www.google.com/about/careers/applications/jobs/results', TRUE, 'Global tech company hiring AI/ML engineers in Bengaluru and student researchers10'),
('HackWithPune', 'Tech Community', 'https://unstop.com/', FALSE, 'Organizer of CodeUnited India National Hackathon1'),
('HaystackAnalytics', 'HealthTech / Genomics', 'https://interndoor.com/', TRUE, 'Genomics analytics firm hiring genome variant analyst interns5'),
('Honeywell Technologies', 'Industrial & AI', 'https://interndoor.com/', TRUE, 'Engineering firm hiring postgraduate AI interns5'),
('IIIT Allahabad', 'Academia', 'https://unstop.com/', TRUE, 'Indian Institute of Information Technology Allahabad1'),
('IIIT Lucknow', 'Academia', 'https://unstop.com/', TRUE, 'Indian Institute of Information Technology, Lucknow3'),
('IIT Bhubaneswar', 'Academia', 'https://unstop.com/', TRUE, 'Indian Institute of Technology Bhubaneswar1'),
('IIT Bombay', 'Academia', 'https://unstop.com/', TRUE, 'Indian Institute of Technology Bombay, Powai1'),
('ImaginXP', 'Design & Tech', 'https://placement.acciojob.com/', FALSE, 'Digital experience and software technology platform'),
('IntelleQAcademy', 'EdTech', 'https://unstop.com/', FALSE, 'Technology training and software development academy'),
('JPMorganChase', 'FinTech / Banking', 'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs?location=India\&locationId=300000000289360\&locationLevel=country', TRUE, 'Global financial services firm hiring software engineers and Python analysts in India12'),
('K. J. Somaiya College of Engineering', 'Academia', 'https://unstop.com/', TRUE, 'Engineering school in Vidyavihar, Mumbai1'),
('Kriscent Techno Hub Pvt. Ltd.', 'IT Consulting', 'https://placement.acciojob.com/', FALSE, 'Custom software and web platform development'),
('Mondelēz International', 'FMCG', 'https://unstop.com/', TRUE, 'Global consumer goods firm hosting Maestros 20261'),
('Mphasis', 'IT Services', 'https://www.hirist.tech/c/full-stack-jobs', TRUE, 'IT services provider hiring Senior Full Stack AI Engineers9'),
('NITK Surathkal', 'Academia', 'https://unstop.com/', TRUE, 'National Institute of Technology Karnataka, Surathkal1'),
('NatWest', 'FinTech / Banking', 'https://www.hirist.tech/c/full-stack-jobs', TRUE, 'Banking technology hub hiring Principal Engineers in Gurugram9'),
('Nexicat', 'IT Services', 'https://unstop.com/', FALSE, 'Software and technology services provider'),
('Paytm', 'FinTech', 'https://interndoor.com/', TRUE, 'Indian payments and technology firm hiring backend interns in Noida/Remote5'),
('Procore', 'Construction SaaS', 'https://www.hirist.tech/c/full-stack-jobs', TRUE, 'SaaS firm hiring Staff Full Stack Engineers in Bengaluru9'),
('Publicis Sapient', 'Digital Consulting', 'https://www.hirist.tech/c/full-stack-jobs', TRUE, 'Digital consultancy hiring Python Full Stack Agentic AI developers9'),
('Requin Solutions Private Limited', 'Software Consulting', 'https://placement.acciojob.com/', FALSE, 'Full stack development and technical consulting'),
('Riwa Creatives', 'Event Organizer', 'https://unstop.com/', FALSE, 'Organizer of Hack Uttar Pradesh 20261'),
('Slonix Solution Private Limited', 'Software Development', 'https://unstop.com/', FALSE, 'Software technology development firm'),
('Solvative', 'Software Engineering', 'https://placement.acciojob.com/', FALSE, 'Full stack web and mobile software development'),
('Thermo Fisher Scientific', 'Life Sciences / Tech', 'https://interndoor.com/', TRUE, 'Global scientific technology firm hiring IT backend interns5'),
('Tringflow Private Limited', 'Software Services', 'https://unstop.com/', FALSE, 'Technology solutions and development firm'),
('TrutiAI', 'AI Systems', 'https://unstop.com/', FALSE, 'Artificial intelligence and technical writing firm'),
('Ubisar', 'Software Services', 'https://unstop.com/', FALSE, 'Software development and engineering company'),
('Unstop', 'Career Platform', 'https://unstop.com/', TRUE, 'Student competition, hackathon, and internship platform1'),
('Vedak', 'Expert Network', 'https://placement.acciojob.com/', TRUE, 'Business research and full stack engineering platform'),
('Vortizo AI', 'AI Startup', 'https://unstop.com/', FALSE, 'Artificial intelligence engineering startup'),
('Young Minds Technology Solutions Pvt Ltd', 'Software Services', 'https://placement.acciojob.com/', FALSE, 'Web applications and full stack solutions'),
('Zebra Technologies', 'Enterprise Tech', 'https://interndoor.com/', TRUE, 'Employer listed on InternDoor for AI systems and SWE internships5'),
('Zecser Business LLP', 'Enterprise Software', 'https://placement.acciojob.com/', FALSE, 'Business software and digital solutions'),
('Zeliot Pvt Ltd', 'Mobility SaaS', 'https://unstop.com/', TRUE, 'Host of Configure 2026 mobility hackathon1'),
('Zenotalent', 'Talent Acquisition', 'https://unstop.com/', FALSE, 'Tech recruitment and software hiring company'),
('pharma&', 'Healthcare / Pharma', 'https://interndoor.com/', TRUE, 'Pharmaceutical organization hiring PowerApps interns in Hyderabad5');

-- TIER 1: ASSESSMENTS (3 Active Canonical Quizzes)
INSERT INTO assessments (id, title, category, description, duration_minutes, is_active) VALUES
('b1111111-1111-1111-1111-111111111111'::uuid, 'Backend Engineering: Java, Spring Boot & PostgreSQL', 'Backend', 'Comprehensive evaluation of enterprise Java, Spring Boot transactions, JPA caching, and PostgreSQL isolation levels.', 20, TRUE),
('b2222222-2222-2222-2222-222222222222', 'Full-Stack MERN & TypeScript Fundamentals', 'Full Stack', 'Assess core knowledge across MongoDB schemas, Express APIs, React rendering lifecycle, and TypeScript type systems.', 20, TRUE),
('b3333333-3333-3333-3333-333333333333'::uuid, 'Applied AI, LLMs & RAG Architecture', 'AI/ML', 'Rigorous benchmark covering dense vector embeddings, chunking strategies, prompt engineering, and agentic workflows.', 15, TRUE)
ON CONFLICT (id) DO NOTHING;


-- TIER 1: CONVERSATIONS (Conv 1 Direct, Conv 2 Direct, Conv 3 Group)
INSERT INTO conversations (id, type) VALUES
('d1111111-1111-1111-1111-111111111111'::uuid, 'DIRECT'),
('d2222222-2222-2222-2222-222222222222'::uuid, 'DIRECT'),
('d3333333-3333-3333-3333-333333333333'::uuid, 'GROUP')
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------------
-- TIER 2: IDENTITY, PROFILES, RECRUITERS & ASSESSMENT QUESTIONS
-- -------------------------------------------------------------------

-- TIER 2: USER ROLES
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@uplink.edu' AND r.name = 'ROLE_ADMIN'
UNION ALL
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'ingestor@uplink.edu' AND r.name = 'ROLE_ADMIN'
UNION ALL
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'recruiter@uplink.edu' AND r.name = 'ROLE_RECRUITER'
UNION ALL
SELECT u.id, r.id FROM users u, roles r WHERE u.email IN ('student@uplink.edu', 'peer1@uplink.edu', 'peer2@uplink.edu') AND r.name = 'ROLE_STUDENT'
ON CONFLICT DO NOTHING;


-- TIER 2: ADMINS
INSERT INTO admins (user_id, department)
SELECT id, 'Placement & Industry Relations' FROM users WHERE email = 'admin@uplink.edu'
UNION ALL
SELECT id, 'Automated Opportunity Pipeline' FROM users WHERE email = 'ingestor@uplink.edu';


-- TIER 2: RECRUITERS (Google Talent Partner)
INSERT INTO recruiters (user_id, company_id, designation, is_verified)
SELECT u.id, c.id, 'University Talent Partner', TRUE
FROM users u, companies c
WHERE u.email = 'recruiter@uplink.edu' AND c.name = 'Google'
ON CONFLICT (user_id) DO NOTHING;


-- TIER 2: USER VERIFICATIONS
INSERT INTO user_verifications (user_id, type, document_url, status, verified_by, verified_at)
SELECT u.id, 'COLLEGE_ID', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'APPROVED', adm.id, NOW()
FROM users u, users adm WHERE u.email = 'student@uplink.edu' AND adm.email = 'admin@uplink.edu'
UNION ALL
SELECT u.id, 'IDENTITY_PROOF', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'APPROVED', adm.id, NOW()
FROM users u, users adm WHERE u.email = 'peer1@uplink.edu' AND adm.email = 'admin@uplink.edu'
UNION ALL
SELECT u.id, 'COLLEGE_ID', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'PENDING', NULL, NULL
FROM users u WHERE u.email = 'peer2@uplink.edu'
ON CONFLICT DO NOTHING;


-- TIER 2: PROFILES
INSERT INTO profiles (user_id, headline, bio, location, profile_picture)
SELECT id, 'Final-Year B.Tech CSE | Spring Boot & React Native Developer', 'Undergraduate at Vishwakarma Institute of Technology, Pune. Building distributed campus systems and real-time STOMP applications.', 'Pune, Maharashtra', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT id, 'AI & Machine Learning Engineer | Python & FastAPI', 'Pre-final year student at RV College of Engineering, Bengaluru. Passionate about LLMs, RAG pipelines, and open-source systems.', 'Bengaluru, Karnataka', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
FROM users WHERE email = 'peer1@uplink.edu'
UNION ALL
SELECT id, 'Frontend & Mobile Developer | React Native', 'B.E. student at CBIT Hyderabad. Exploring modern UI architectures and full-stack integration.', 'Hyderabad, Telangana', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
FROM users WHERE email = 'peer2@uplink.edu'
UNION ALL
SELECT id, 'University Talent Partner @ Google', 'Leading campus recruitment and internship programs across engineering institutions in India.', 'Bengaluru, Karnataka', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
FROM users WHERE email = 'recruiter@uplink.edu'
ON CONFLICT (user_id) DO NOTHING;


-- TIER 2: EDUCATION
INSERT INTO education (user_id, degree, college, branch, start_year, end_year, cgpa, is_current)
SELECT id, 'B.Tech', 'Vishwakarma Institute of Technology, Pune', 'Computer Science & Engineering', 2023, 2027, 8.92, TRUE FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT id, 'B.Tech', 'RV College of Engineering, Bengaluru', 'AI & Machine Learning', 2023, 2027, 9.15, TRUE FROM users WHERE email = 'peer1@uplink.edu'
UNION ALL
SELECT id, 'B.E.', 'CBIT Hyderabad', 'Information Technology', 2024, 2028, 8.40, TRUE FROM users WHERE email = 'peer2@uplink.edu';


-- TIER 2: USER SKILLS
INSERT INTO user_skills (user_id, skill_id, proficiency, years_of_exp, is_verified)
SELECT u.id, s.id, 'ADVANCED', 2.0, TRUE FROM users u, skills s WHERE u.email = 'student@uplink.edu' AND s.name = 'Java'
UNION ALL
SELECT u.id, s.id, 'INTERMEDIATE', 1.5, TRUE FROM users u, skills s WHERE u.email = 'student@uplink.edu' AND s.name = 'Spring Boot'
UNION ALL
SELECT u.id, s.id, 'INTERMEDIATE', 1.5, FALSE FROM users u, skills s WHERE u.email = 'student@uplink.edu' AND s.name = 'React Native'
UNION ALL
SELECT u.id, s.id, 'INTERMEDIATE', 1.5, FALSE FROM users u, skills s WHERE u.email = 'student@uplink.edu' AND s.name = 'TypeScript'
UNION ALL
SELECT u.id, s.id, 'INTERMEDIATE', 1.0, TRUE FROM users u, skills s WHERE u.email = 'student@uplink.edu' AND s.name = 'PostgreSQL'
UNION ALL
SELECT u.id, s.id, 'EXPERT', 2.5, TRUE FROM users u, skills s WHERE u.email = 'peer1@uplink.edu' AND s.name = 'Python'
UNION ALL
SELECT u.id, s.id, 'ADVANCED', 1.5, FALSE FROM users u, skills s WHERE u.email = 'peer1@uplink.edu' AND s.name = 'FastAPI'
UNION ALL
SELECT u.id, s.id, 'INTERMEDIATE', 1.0, FALSE FROM users u, skills s WHERE u.email = 'peer1@uplink.edu' AND s.name = 'Machine Learning'
ON CONFLICT (user_id, skill_id) DO NOTHING;


-- TIER 2: PROJECTS
INSERT INTO projects (user_id, title, description, tech_stack, github_url, live_url)
SELECT id, 'Campus Placement & STOMP Messaging Hub', 'High-concurrency mobile application and distributed microservice backend enabling real-time chat, AI resume generation, and verified student job tracking.', 'Spring Boot, React Native, PostgreSQL, WebSockets', 'https://github.com/uplink/uplink-hub', 'https://uplinkbackend-production.up.railway.app' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT id, 'ATS Resume Semantic Scorer', 'Vector embedding and natural language processing pipeline calculating ATS job-fit scores and keyword match indices.', 'Python, FastAPI, PostgreSQL', 'https://github.com/uplink/ats-scorer', NULL FROM users WHERE email = 'peer1@uplink.edu';


-- TIER 2: EXPERIENCES
INSERT INTO experiences (user_id, title, company, location, start_date, end_date, description)
SELECT id, 'Backend Engineering Intern', 'FinEdge Systems', 'Pune, Maharashtra', '2026-05-15'::date, '2026-07-31'::date, 'Engineered event-driven microservices using Spring Boot and Apache Kafka, reducing asynchronous processing latency by 35%.' FROM users WHERE email = 'student@uplink.edu';


-- TIER 2: CERTIFICATIONS
INSERT INTO certifications (user_id, title, issuer, issue_date, credential_url)
SELECT id, 'AWS Certified Cloud Practitioner', 'Amazon Web Services', '2026-03-10'::date, 'https://aws.amazon.com/verification/cred-102938' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT id, 'Deep Learning Specialization', 'DeepLearning.AI', '2026-01-20'::date, 'https://coursera.org/verify/specialization/dl-ai-8910' FROM users WHERE email = 'peer1@uplink.edu';


-- TIER 2: ACHIEVEMENTS
INSERT INTO achievements (user_id, title, description, date)
SELECT id, 'Smart India Hackathon Finalist', 'Top 5 national rank out of 10,000+ participating engineering teams.', '2025-12-18'::date FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT id, 'Top 5% Kaggle Tabular Playground', 'Achieved top 5 percentile in international competitive machine learning challenge.', '2026-04-05'::date FROM users WHERE email = 'peer1@uplink.edu';


-- TIER 2: ASSESSMENT QUESTIONS (15 Canonical Questions with valid JSON array options)
INSERT INTO assessment_questions (assessment_id, question, options, correct_answer, marks, order_index) VALUES
('b1111111-1111-1111-1111-111111111111'::uuid, 'What is the default transaction isolation level in PostgreSQL when used with Spring Boot?', '["READ COMMITTED", "READ UNCOMMITTED", "REPEATABLE READ", "SERIALIZABLE"]', 'READ COMMITTED', 1.0, 1),
('b1111111-1111-1111-1111-111111111111'::uuid, 'When should you use the @Version annotation in a Spring Data JPA entity?', '["For optimistic locking to detect concurrent updates without row-level locks", "To store the semantic API version string", "To track schema migrations", "To enable Hibernate second-level cache"]', 'For optimistic locking to detect concurrent updates without row-level locks', 1.0, 2),
('b1111111-1111-1111-1111-111111111111'::uuid, 'Which HikariCP configuration property defines the maximum time a thread waits for a connection from the pool?', '["connectionTimeout", "idleTimeout", "maxLifetime", "leakDetectionThreshold"]', 'connectionTimeout', 1.0, 3),
('b1111111-1111-1111-1111-111111111111'::uuid, 'What is the primary difference between SELECT FOR UPDATE and optimistic locking in PostgreSQL?', '["SELECT FOR UPDATE acquires an exclusive row lock at the database level", "Optimistic locking blocks other transactions immediately", "SELECT FOR UPDATE uses an entity version integer column", "Optimistic locking prevents dirty reads only"]', 'SELECT FOR UPDATE acquires an exclusive row lock at the database level', 1.0, 4),
('b1111111-1111-1111-1111-111111111111'::uuid, 'How does Hibernate 2nd-level cache interact with PostgreSQL under multi-instance deployments?', '["It requires a distributed cache provider like Redis or Hazelcast to prevent stale reads", "It synchronizes automatically via PostgreSQL WAL replication", "It disables standard SQL prepared statements", "It is stored inside the JDBC connection pool"]', 'It requires a distributed cache provider like Redis or Hazelcast to prevent stale reads', 1.0, 5),

('b2222222-2222-2222-2222-222222222222', 'How does the React Native Fabric architecture improve UI thread rendering performance?', '["By using synchronous C++ JSI bindings instead of the asynchronous JSON bridge", "By running all JavaScript directly inside the GPU thread", "By disabling shadow tree calculations", "By compiling JavaScript to native bytecode ahead of time"]', 'By using synchronous C++ JSI bindings instead of the asynchronous JSON bridge', 1.0, 1),
('b2222222-2222-2222-2222-222222222222', 'What is the purpose of the key prop when rendering dynamic lists in React?', '["To help React identify which items have changed, been added, or been removed during reconciliation", "To provide unique styling identifiers in CSS", "To trigger server-side re-rendering", "To bind Redux actions to list nodes"]', 'To help React identify which items have changed, been added, or been removed during reconciliation', 1.0, 2),
('b2222222-2222-2222-2222-222222222222', 'In TypeScript, what is a key distinction between an interface and a type alias regarding declaration merging?', '["Interfaces with the same name automatically merge declarations, while type aliases cannot be merged", "Type aliases support declaration merging but interfaces throw compilation errors", "Interfaces cannot extend object types", "Type aliases are converted to JavaScript classes at runtime"]', 'Interfaces with the same name automatically merge declarations, while type aliases cannot be merged', 1.0, 3),
('b2222222-2222-2222-2222-222222222222', 'How does the Node.js event loop handle asynchronous file I/O operations?', '["By delegating file operations to the libuv thread pool", "By executing them on the main V8 execution thread synchronously", "By spawning a separate child process for every file read", "By waiting in the poll phase until the disk read finishes"]', 'By delegating file operations to the libuv thread pool', 1.0, 4),
('b2222222-2222-2222-2222-222222222222', 'What is the primary advantage of MongoDB aggregation pipelines over basic find queries?', '["Multi-stage data transformation, grouping, projecting, and joining across collections via $lookup", "Faster simple single-field lookups on indexed primary keys", "Zero memory overhead on unindexed queries", "Automatic client-side JSON serialization"]', 'Multi-stage data transformation, grouping, projecting, and joining across collections via $lookup', 1.0, 5),

('b3333333-3333-3333-3333-333333333333'::uuid, 'In a Retrieval-Augmented Generation (RAG) system, why is text chunking necessary before generating vector embeddings?', '["To fit within embedding model token limits and maintain semantic relevance in vector search", "To compress the raw text into binary byte arrays", "To speed up network roundtrips over HTTP", "To encrypt proprietary documents before database storage"]', 'To fit within embedding model token limits and maintain semantic relevance in vector search', 1.0, 1),
('b3333333-3333-3333-3333-333333333333'::uuid, 'Which similarity metric is most commonly used for normalized dense embedding vector retrieval?', '["Cosine Similarity", "Manhattan Distance", "Levenshtein Distance", "Jaccard Index"]', 'Cosine Similarity', 1.0, 2),
('b3333333-3333-3333-3333-333333333333'::uuid, 'How does lowering the temperature parameter affect LLM generation during inference?', '["It makes outputs more deterministic, focused, and repeatable by narrowing the token probability distribution", "It increases creative randomness and halluncinations", "It disables top-p sampling completely", "It speeds up GPU memory allocation"]', 'It makes outputs more deterministic, focused, and repeatable by narrowing the token probability distribution', 1.0, 3),
('b3333333-3333-3333-3333-333333333333'::uuid, 'What is the primary function of a cross-encoder in a multi-stage retrieval pipeline?', '["To re-rank top candidate chunks by jointly attending over query and passage tokens", "To generate vector embeddings for initial ANN vector search", "To translate foreign language queries into English", "To compress context windows into key-value cache tokens"]', 'To re-rank top candidate chunks by jointly attending over query and passage tokens', 1.0, 4),
('b3333333-3333-3333-3333-333333333333'::uuid, 'How does prompt prefix caching optimize latency and cost in agentic LLM workflows?', '["By reusing pre-computed KV cache states for static system instructions and tools across turns", "By caching generated completion strings in local browser cookies", "By bypassing model temperature sampling", "By training the base model weights on historical conversation logs"]', 'By reusing pre-computed KV cache states for static system instructions and tools across turns', 1.0, 5)
ON CONFLICT DO NOTHING;


-- TIER 2: CONVERSATION MEMBERS
INSERT INTO conversation_members (conversation_id, user_id, role)
SELECT 'd1111111-1111-1111-1111-111111111111'::uuid, id, 'ADMIN' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'd1111111-1111-1111-1111-111111111111'::uuid, id, 'MEMBER' FROM users WHERE email = 'peer1@uplink.edu'
UNION ALL
SELECT 'd2222222-2222-2222-2222-222222222222'::uuid, id, 'ADMIN' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'd2222222-2222-2222-2222-222222222222'::uuid, id, 'MEMBER' FROM users WHERE email = 'recruiter@uplink.edu'
UNION ALL
SELECT 'd3333333-3333-3333-3333-333333333333'::uuid, id, 'ADMIN' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'd3333333-3333-3333-3333-333333333333'::uuid, id, 'MEMBER' FROM users WHERE email = 'peer1@uplink.edu'
UNION ALL
SELECT 'd3333333-3333-3333-3333-333333333333'::uuid, id, 'MEMBER' FROM users WHERE email = 'peer2@uplink.edu'
ON CONFLICT (conversation_id, user_id) DO NOTHING;


-- -------------------------------------------------------------------
-- TIER 3: EXACTLY 66 VERIFIED LIVE OPPORTUNITIES & CORE CONTENT
-- -------------------------------------------------------------------

-- Total opportunities to insert: 66
INSERT INTO opportunities (id, company_id, created_by, type, title, description, location, work_mode, experience_level, stipend_min, stipend_max, application_url, deadline, is_active, is_verified) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM companies WHERE name = 'IIIT Lucknow' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'AI Kaushal Hackathon 2026', 'Verified live competition on Unstop. Compete in AI Kaushal Hackathon 2026 hosted by IIIT Lucknow. Work mode: HYBRID. Location: Lucknow, UP. Prize pool, mentorship, and national engineering rankings awarded.', 'Lucknow, UP', 'HYBRID', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons/ai-kaushal-hackathon-2026-indian-institute-of-information-technology-iiit-lucknow-1817798', '2026-11-20'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM companies WHERE name = 'BuildX' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'CodeWarriors India 2026 - National Hackathon', 'Verified live competition on Unstop. Compete in CodeWarriors India 2026 - National Hackathon hosted by BuildX. Work mode: REMOTE. Location: India. Prize pool, mentorship, and national engineering rankings awarded.', 'India', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons/codewarriors-india-2026-national-hackathon-buildx-1817737', '2026-12-03'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000003', (SELECT id FROM companies WHERE name = 'HackWithPune' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'CodeUnited India - National Hackathon', 'Verified live competition on Unstop. Compete in CodeUnited India - National Hackathon hosted by HackWithPune. Work mode: REMOTE. Location: India. Prize pool, mentorship, and national engineering rankings awarded.', 'India', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons/codeunited-india-national-hackathon-hackwithpune-1817749', '2026-12-01'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000004', (SELECT id FROM companies WHERE name = 'DevHarbour' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'INNOVATE - Hackathon 2026', 'Verified live competition on Unstop. Compete in INNOVATE - Hackathon 2026 hosted by DevHarbour. Work mode: REMOTE. Location: India. Prize pool, mentorship, and national engineering rankings awarded.', 'India', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons/innovate-hackathon-2026-devharbour-1792025', '2026-12-06'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000005', (SELECT id FROM companies WHERE name = 'NITK Surathkal' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'Silicon Sprint 2026', 'Verified live competition on Unstop. Compete in Silicon Sprint 2026 hosted by NITK Surathkal. Work mode: REMOTE. Location: Surathkal. Prize pool, mentorship, and national engineering rankings awarded.', 'Surathkal', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-11-23'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000006', (SELECT id FROM companies WHERE name = 'IIIT Allahabad' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'OpenCode 2026', 'Verified live competition on Unstop. Compete in OpenCode 2026 hosted by IIIT Allahabad. Work mode: REMOTE. Location: Prayagraj. Prize pool, mentorship, and national engineering rankings awarded.', 'Prayagraj', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-12-11'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000007', (SELECT id FROM companies WHERE name = 'BIT Mesra' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'COMPETITION', 'CTF Cicada 2026', 'Verified live competition on Unstop. Compete in CTF Cicada 2026 hosted by BIT Mesra. Work mode: REMOTE. Location: Ranchi. Prize pool, mentorship, and national engineering rankings awarded.', 'Ranchi', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-12-08'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000008', (SELECT id FROM companies WHERE name = 'IIT Bhubaneswar' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'Code Relay 5.0', 'Verified live competition on Unstop. Compete in Code Relay 5.0 hosted by IIT Bhubaneswar. Work mode: ONSITE. Location: Bhubaneswar. Prize pool, mentorship, and national engineering rankings awarded.', 'Bhubaneswar', 'ONSITE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-12-10'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000009', (SELECT id FROM companies WHERE name = 'K. J. Somaiya College of Engineering' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'Agri-Tech Hackathon 2027: 24 Hours to Hack the Harvest', 'Verified live competition on Unstop. Compete in Agri-Tech Hackathon 2027: 24 Hours to Hack the Harvest hosted by K. J. Somaiya College of Engineering. Work mode: ONSITE. Location: Mumbai, MH. Prize pool, mentorship, and national engineering rankings awarded.', 'Mumbai, MH', 'ONSITE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-12-12'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000010', (SELECT id FROM companies WHERE name = 'IIT Bombay' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'COMPETITION', 'The Algo Trading Innovation Challenge', 'Verified live competition on Unstop. Compete in The Algo Trading Innovation Challenge hosted by IIT Bombay. Work mode: ONSITE. Location: Mumbai, MH. Prize pool, mentorship, and national engineering rankings awarded.', 'Mumbai, MH', 'ONSITE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-11-24'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000011', (SELECT id FROM companies WHERE name = 'Zeliot Pvt Ltd' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'Configure 2026: A Mobility Hackathon', 'Verified live competition on Unstop. Compete in Configure 2026: A Mobility Hackathon hosted by Zeliot Pvt Ltd. Work mode: REMOTE. Location: India. Prize pool, mentorship, and national engineering rankings awarded.', 'India', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-11-20'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000012', (SELECT id FROM companies WHERE name = 'EduLinkUp' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'ELU Build', 'Verified live competition on Unstop. Compete in ELU Build hosted by EduLinkUp. Work mode: REMOTE. Location: India. Prize pool, mentorship, and national engineering rankings awarded.', 'India', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-12-15'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000013', (SELECT id FROM companies WHERE name = 'Riwa Creatives' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'HACKATHON', 'Hack Uttar Pradesh 2026', 'Verified live competition on Unstop. Compete in Hack Uttar Pradesh 2026 hosted by Riwa Creatives. Work mode: ONSITE. Location: Uttar Pradesh. Prize pool, mentorship, and national engineering rankings awarded.', 'Uttar Pradesh', 'ONSITE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-12-17'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000014', (SELECT id FROM companies WHERE name = 'Mondelēz International' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'COMPETITION', 'Mondelēz Maestros 2026 - Commercial Track', 'Verified live competition on Unstop. Compete in Mondelēz Maestros 2026 - Commercial Track hosted by Mondelēz International. Work mode: REMOTE. Location: India. Prize pool, mentorship, and national engineering rankings awarded.', 'India', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/hackathons', '2026-12-12'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000015', (SELECT id FROM companies WHERE name = 'Coy' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Engineer Intern', 'Verified software development internship listing on Unstop. Join Coy as a Software Engineer Intern. Work mode: HYBRID. Location: Gurgaon, HR. Monthly stipend: 45000 - 45000 INR/month.', 'Gurgaon, HR', 'HYBRID', 'Student / Fresher', 45000, 45000, 'https://unstop.com/internship/software-development-internship', '2026-11-23'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000016', (SELECT id FROM companies WHERE name = 'Vortizo AI' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Python Developer Internship', 'Verified software development internship listing on Unstop. Join Vortizo AI as a Python Developer Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: 40000 - 40000 INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', 40000, 40000, 'https://unstop.com/internship/software-development-internship', '2026-11-22'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000017', (SELECT id FROM companies WHERE name = 'Ubisar' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Tech Internship', 'Verified software development internship listing on Unstop. Join Ubisar as a Tech Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: 30000 - 30000 INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', 30000, 30000, 'https://unstop.com/internship/software-development-internship', '2026-11-23'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000018', (SELECT id FROM companies WHERE name = 'Slonix Solution Private Limited' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Developer Internship', 'Verified software development internship listing on Unstop. Join Slonix Solution Private Limited as a Software Developer Internship. Work mode: ONSITE. Location: Bengaluru, KA. Monthly stipend: 18000 - 30000 INR/month.', 'Bengaluru, KA', 'ONSITE', 'Student / Fresher', 18000, 30000, 'https://unstop.com/internship/software-development-internship', '2026-11-29'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000019', (SELECT id FROM companies WHERE name = 'Zenotalent' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Python Internship', 'Verified software development internship listing on Unstop. Join Zenotalent as a Python Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: 25000 - 25000 INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', 25000, 25000, 'https://unstop.com/internship/software-development-internship', '2026-11-22'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000020', (SELECT id FROM companies WHERE name = 'Codeatrix' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Java Developer Internship', 'Verified software development internship listing on Unstop. Join Codeatrix as a Java Developer Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: 15000 - 20000 INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', 15000, 20000, 'https://unstop.com/internship/software-development-internship', '2026-12-09'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000021', (SELECT id FROM companies WHERE name = 'IntelleQAcademy' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Python Development Internship', 'Verified software development internship listing on Unstop. Join IntelleQAcademy as a Python Development Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: 10000 - 15000 INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', 10000, 15000, 'https://unstop.com/internship/software-development-internship', '2026-11-22'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000022', (SELECT id FROM companies WHERE name = 'IntelleQAcademy' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Java Development Internship', 'Verified software development internship listing on Unstop. Join IntelleQAcademy as a Java Development Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: 10000 - 15000 INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', 10000, 15000, 'https://unstop.com/internship/software-development-internship', '2026-11-22'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000023', (SELECT id FROM companies WHERE name = 'Nexicat' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Development Engineer Internship', 'Verified software development internship listing on Unstop. Join Nexicat as a Software Development Engineer Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: 5000 - 5000 INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', 5000, 5000, 'https://unstop.com/internship/software-development-internship', '2026-11-23'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000024', (SELECT id FROM companies WHERE name = 'EduGuruCool Operating Systems Private Limited' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Product & Technology Internship', 'Verified software development internship listing on Unstop. Join EduGuruCool Operating Systems Private Limited as a Product & Technology Internship. Work mode: REMOTE. Location: Pan India. Monthly stipend: 2000 - 2000 INR/month.', 'Pan India', 'REMOTE', 'Student / Fresher', 2000, 2000, 'https://unstop.com/internship/software-development-internship', '2026-11-26'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000025', (SELECT id FROM companies WHERE name = 'TrutiAI' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Development and Technical Writing Internship', 'Verified software development internship listing on Unstop. Join TrutiAI as a Software Development and Technical Writing Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: NULL - NULL INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/internship/software-development-internship', '2026-11-30'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000026', (SELECT id FROM companies WHERE name = 'Unstop' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Content Development Intern - Tech', 'Verified software development internship listing on Unstop. Join Unstop as a Content Development Intern - Tech. Work mode: HYBRID. Location: South Delhi. Monthly stipend: NULL - NULL INR/month.', 'South Delhi', 'HYBRID', 'Student / Fresher', NULL, NULL, 'https://unstop.com/internship/software-development-internship', '2026-12-16'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000027', (SELECT id FROM companies WHERE name = 'Tringflow Private Limited' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Internship', 'Verified software development internship listing on Unstop. Join Tringflow Private Limited as a Software Internship. Work mode: REMOTE. Location: Remote (India). Monthly stipend: NULL - NULL INR/month.', 'Remote (India)', 'REMOTE', 'Student / Fresher', NULL, NULL, 'https://unstop.com/internship/software-development-internship', '2026-11-23'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000028', (SELECT id FROM companies WHERE name = 'Zebra Technologies' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Intern II - AI Systems Development', 'Verified technical role on InternDoor engineering board. Zebra Technologies is actively hiring for Intern II - AI Systems Development. Location: India. Work mode: HYBRID. Level: Fresher / Student.', 'India', 'HYBRID', 'Fresher / Student', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000029', (SELECT id FROM companies WHERE name = 'Paytm' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Backend Intern', 'Verified technical role on InternDoor engineering board. Paytm is actively hiring for Backend Intern. Location: Noida, UP. Work mode: REMOTE. Level: Fresher / Student.', 'Noida, UP', 'REMOTE', 'Fresher / Student', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000030', (SELECT id FROM companies WHERE name = 'Thermo Fisher Scientific' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'IT Intern - Backend Development', 'Verified technical role on InternDoor engineering board. Thermo Fisher Scientific is actively hiring for IT Intern - Backend Development. Location: India. Work mode: ONSITE. Level: UG / PG B.Tech.', 'India', 'ONSITE', 'UG / PG B.Tech', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000031', (SELECT id FROM companies WHERE name = 'Honeywell Technologies' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'AI Intern (Algorithm Development)', 'Verified technical role on InternDoor engineering board. Honeywell Technologies is actively hiring for AI Intern (Algorithm Development). Location: India. Work mode: ONSITE. Level: Postgraduate.', 'India', 'ONSITE', 'Postgraduate', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000032', (SELECT id FROM companies WHERE name = 'Zebra Technologies' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Engineering Intern (6 Months)', 'Verified technical role on InternDoor engineering board. Zebra Technologies is actively hiring for Software Engineering Intern (6 Months). Location: India. Work mode: HYBRID. Level: Pursuing CS / DS / Stats.', 'India', 'HYBRID', 'Pursuing CS / DS / Stats', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000033', (SELECT id FROM companies WHERE name = 'Appinventiv' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Intern', 'Verified technical role on InternDoor engineering board. Appinventiv is actively hiring for Software Intern. Location: India. Work mode: ONSITE. Level: Pursuing CS / IT.', 'India', 'ONSITE', 'Pursuing CS / IT', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000034', (SELECT id FROM companies WHERE name = 'pharma&' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'PowerApps Developer Intern (6 Months)', 'Verified technical role on InternDoor engineering board. pharma& is actively hiring for PowerApps Developer Intern (6 Months). Location: Hyderabad, TS. Work mode: ONSITE. Level: UG / PG CS.', 'Hyderabad, TS', 'ONSITE', 'UG / PG CS', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000035', (SELECT id FROM companies WHERE name = 'Baker Hughes' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Digital Technology Trainee (6–12 Months)', 'Verified technical role on InternDoor engineering board. Baker Hughes is actively hiring for Digital Technology Trainee (6–12 Months). Location: India. Work mode: ONSITE. Level: UG Engineering.', 'India', 'ONSITE', 'UG Engineering', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000036', (SELECT id FROM companies WHERE name = 'Cropin' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Quality Assurance Intern', 'Verified technical role on InternDoor engineering board. Cropin is actively hiring for Quality Assurance Intern. Location: India. Work mode: ONSITE. Level: UG BCA / MCA / BE.', 'India', 'ONSITE', 'UG BCA / MCA / BE', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000037', (SELECT id FROM companies WHERE name = 'HaystackAnalytics' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Genome Variant Analyst Intern', 'Verified technical role on InternDoor engineering board. HaystackAnalytics is actively hiring for Genome Variant Analyst Intern. Location: India. Work mode: ONSITE. Level: PG (0–1 yrs exp).', 'India', 'ONSITE', 'PG (0–1 yrs exp)', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000038', (SELECT id FROM companies WHERE name = 'Emerson' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Software Engineer Trainee', 'Verified technical role on InternDoor engineering board. Emerson is actively hiring for Software Engineer Trainee. Location: India. Work mode: ONSITE. Level: UG / PG B.Tech / M.Tech.', 'India', 'ONSITE', 'UG / PG B.Tech / M.Tech', NULL, NULL, 'https://interndoor.com/', '2026-12-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000039', (SELECT id FROM companies WHERE name = 'Google' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Software Engineer, AI/ML, PhD, Early Career, 2026', 'Verified live listing from Google Careers. Google is looking for a Software Engineer, AI/ML, PhD, Early Career, 2026. Work mode: ONSITE. Location: Bengaluru, KA. Experience required: Early Career (PhD). Compensation: Undisclosed / Rolling.', 'Bengaluru, KA', 'ONSITE', 'Early Career (PhD)', NULL, NULL, 'https://www.google.com/about/careers/applications/jobs/results/127602843300307654-software-engineer-aiml-phd-early-career-2026', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000040', (SELECT id FROM companies WHERE name = 'Google' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'RESEARCH', 'Student Researcher, BS/MS, Fall 2026', 'Verified live listing from Google Careers. Google is looking for a Student Researcher, BS/MS, Fall 2026. Work mode: ONSITE. Location: Global / US. Experience required: BS / MS Student. Compensation: Deadline 2026-11-27.', 'Global / US', 'ONSITE', 'BS / MS Student', NULL, NULL, 'https://www.google.com/about/careers/applications/jobs/results/132362676918461126-student-researcher-bsms-fall-2026', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000041', (SELECT id FROM companies WHERE name = 'JPMorganChase' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Software Engineer III (Consumer)', 'Verified live listing from JPMC Oracle Cloud. JPMorganChase is looking for a Software Engineer III (Consumer). Work mode: ONSITE. Location: India. Experience required: Mid-Senior. Compensation: Undisclosed / Rolling.', 'India', 'ONSITE', 'Mid-Senior', NULL, NULL, 'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/210808578', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000042', (SELECT id FROM companies WHERE name = 'JPMorganChase' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Python Developer (Analyst) - STO', 'Verified live listing from JPMC Oracle Cloud. JPMorganChase is looking for a Python Developer (Analyst) - STO. Work mode: ONSITE. Location: India. Experience required: Analyst. Compensation: Undisclosed / Rolling.', 'India', 'ONSITE', 'Analyst', NULL, NULL, 'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs?location=India\&locationId=300000000289360\&locationLevel=country', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000043', (SELECT id FROM companies WHERE name = 'FrontPage' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Engineering Intern: Testing, Automation & Development', 'Verified live listing from Work at a Startup. FrontPage is looking for a Engineering Intern: Testing, Automation & Development. Work mode: ONSITE. Location: Undisclosed. Experience required: Student / Intern. Compensation: Undisclosed / Rolling.', 'Undisclosed', 'ONSITE', 'Student / Intern', NULL, NULL, 'https://www.workatastartup.com/jobs/122543', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000044', (SELECT id FROM companies WHERE name = 'AccioJob' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'TRAINING', 'MERN Full Stack Development With GenAI', 'Verified live listing from AccioJob. AccioJob is looking for a MERN Full Stack Development With GenAI. Work mode: REMOTE. Location: India. Experience required: All Backgrounds. Compensation: Course fee ₹55,0006.', 'India', 'REMOTE', 'All Backgrounds', NULL, NULL, 'https://acciojob.com/self-paced', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000045', (SELECT id FROM companies WHERE name = 'Requin Solutions Private Limited' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Requin Solutions Private Limited is looking for a Full Stack Developer. Work mode: ONSITE. Location: Jaipur, RJ. Experience required: Fresher. Compensation: Posted Nov 14, 2026.', 'Jaipur, RJ', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000046', (SELECT id FROM companies WHERE name = 'CyberClipper InfoTech LLP' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Full Stack Developer', 'Verified live listing from AccioJob Board. CyberClipper InfoTech LLP is looking for a Full Stack Developer. Work mode: ONSITE. Location: Dehradun, UK. Experience required: Fresher. Compensation: Posted Nov 4, 2026.', 'Dehradun, UK', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000047', (SELECT id FROM companies WHERE name = 'Zecser Business LLP' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Zecser Business LLP is looking for a Full Stack Developer. Work mode: ONSITE. Location: Kochi, KL. Experience required: Fresher. Compensation: Posted Oct 26, 2026.', 'Kochi, KL', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000048', (SELECT id FROM companies WHERE name = 'BizTranSights' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Full Stack Developer', 'Verified live listing from AccioJob Board. BizTranSights is looking for a Full Stack Developer. Work mode: ONSITE. Location: Nagpur, MH. Experience required: Fresher. Compensation: Posted Oct 26, 2026.', 'Nagpur, MH', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000049', (SELECT id FROM companies WHERE name = 'Vedak' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'INTERNSHIP', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Vedak is looking for a Full Stack Developer. Work mode: ONSITE. Location: Karnataka. Experience required: Fresher. Compensation: Posted Oct 22, 2026.', 'Karnataka', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000050', (SELECT id FROM companies WHERE name = 'Young Minds Technology Solutions Pvt Ltd' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Young Minds Technology Solutions Pvt Ltd is looking for a Full Stack Developer. Work mode: ONSITE. Location: Tirupati, AP. Experience required: Fresher. Compensation: Posted Nov 13, 2026.', 'Tirupati, AP', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000051', (SELECT id FROM companies WHERE name = 'Kriscent Techno Hub Pvt. Ltd.' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Kriscent Techno Hub Pvt. Ltd. is looking for a Full Stack Developer. Work mode: ONSITE. Location: Kota, RJ. Experience required: Fresher. Compensation: Posted Nov 13, 2026.', 'Kota, RJ', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000052', (SELECT id FROM companies WHERE name = 'ImaginXP' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. ImaginXP is looking for a Full Stack Developer. Work mode: ONSITE. Location: Gujarat. Experience required: Fresher. Compensation: Posted Nov 3, 2026.', 'Gujarat', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000053', (SELECT id FROM companies WHERE name = 'Solvative' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Solvative is looking for a Full Stack Developer. Work mode: ONSITE. Location: Gujarat. Experience required: Fresher. Compensation: Posted Oct 31, 2026.', 'Gujarat', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000054', (SELECT id FROM companies WHERE name = 'Ascendion' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Ascendion is looking for a Full Stack Developer. Work mode: ONSITE. Location: India. Experience required: Fresher. Compensation: Posted Oct 24, 2026.', 'India', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000055', (SELECT id FROM companies WHERE name = 'Brackets' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Brackets is looking for a Full Stack Developer. Work mode: ONSITE. Location: West Bengal. Experience required: Fresher. Compensation: Posted Oct 21, 2026.', 'West Bengal', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000056', (SELECT id FROM companies WHERE name = 'Expinator Web Technology (P) Ltd.' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Expinator Web Technology (P) Ltd. is looking for a Full Stack Developer. Work mode: ONSITE. Location: Mohali, PB. Experience required: Fresher. Compensation: Posted Oct 21, 2026.', 'Mohali, PB', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000057', (SELECT id FROM companies WHERE name = 'Developer bazaar Technologies' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer', 'Verified live listing from AccioJob Board. Developer bazaar Technologies is looking for a Full Stack Developer. Work mode: ONSITE. Location: Indore, MP. Experience required: Fresher. Compensation: Posted Oct 18, 2026.', 'Indore, MP', 'ONSITE', 'Fresher', NULL, NULL, 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000058', (SELECT id FROM companies WHERE name = 'Cumulations Technologies' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Full Stack Developer - MERN Stack', 'Verified live listing from Hirist. Cumulations Technologies is looking for a Full Stack Developer - MERN Stack. Work mode: ONSITE. Location: Bengaluru, KA. Experience required: 1–3 yrs. Compensation: Undisclosed (Posted \1 mo).', 'Bengaluru, KA', 'ONSITE', '1–3 yrs', NULL, NULL, 'https://www.hirist.tech/k/mern-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000059', (SELECT id FROM companies WHERE name = 'DataPure' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'MEAN/MERN Stack Developer', 'Verified live listing from Hirist. DataPure is looking for a MEAN/MERN Stack Developer. Work mode: ONSITE. Location: Indore, MP. Experience required: 3–5 yrs. Compensation: Undisclosed (Posted \3d).', 'Indore, MP', 'ONSITE', '3–5 yrs', NULL, NULL, 'https://www.hirist.tech/k/mern-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000060', (SELECT id FROM companies WHERE name = 'Euphoric Thought' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'MERN Stack Developer', 'Verified live listing from Hirist. Euphoric Thought is looking for a MERN Stack Developer. Work mode: ONSITE. Location: Bengaluru, KA. Experience required: 4–5 yrs. Compensation: Undisclosed (Posted \2w).', 'Bengaluru, KA', 'ONSITE', '4–5 yrs', NULL, NULL, 'https://www.hirist.tech/k/mern-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000061', (SELECT id FROM companies WHERE name = 'GlobalLogic' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'MERN Stack Developer - React.js/Node.js', 'Verified live listing from Hirist. GlobalLogic is looking for a MERN Stack Developer - React.js/Node.js. Work mode: ONSITE. Location: Hyderabad, TS. Experience required: 5–10 yrs. Compensation: Undisclosed (Posted \1w).', 'Hyderabad, TS', 'ONSITE', '5–10 yrs', NULL, NULL, 'https://www.hirist.tech/k/mern-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000062', (SELECT id FROM companies WHERE name = 'Publicis Sapient' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Python Full Stack Agentic AI Developer', 'Verified live listing from Hirist. Publicis Sapient is looking for a Python Full Stack Agentic AI Developer. Work mode: HYBRID. Location: Multiple (India). Experience required: 5–15 yrs. Compensation: Undisclosed (Posted \2d).', 'Multiple (India)', 'HYBRID', '5–15 yrs', NULL, NULL, 'https://www.hirist.tech/c/full-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000063', (SELECT id FROM companies WHERE name = 'Amadeus Labs' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Software Development Engineer III - Full Stack', 'Verified live listing from Hirist. Amadeus Labs is looking for a Software Development Engineer III - Full Stack. Work mode: ONSITE. Location: Bengaluru, KA. Experience required: 7–10 yrs. Compensation: Undisclosed (Posted Nov 2026\).', 'Bengaluru, KA', 'ONSITE', '7–10 yrs', NULL, NULL, 'https://www.hirist.tech/c/full-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000064', (SELECT id FROM companies WHERE name = 'Mphasis' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Senior Full Stack AI Engineer', 'Verified live listing from Hirist. Mphasis is looking for a Senior Full Stack AI Engineer. Work mode: HYBRID. Location: Bengaluru / Hyderabad. Experience required: 6–9 yrs. Compensation: Undisclosed (Posted \1d).', 'Bengaluru / Hyderabad', 'HYBRID', '6–9 yrs', NULL, NULL, 'https://www.hirist.tech/c/full-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000065', (SELECT id FROM companies WHERE name = 'NatWest' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Principal Engineer - .Net/React.js', 'Verified live listing from Hirist. NatWest is looking for a Principal Engineer - .Net/React.js. Work mode: HYBRID. Location: Gurugram, HR. Experience required: 12–20 yrs. Compensation: 3500000.00 – 5000000.00 INR/yr.', 'Gurugram, HR', 'HYBRID', '12–20 yrs', 3500000, 5000000, 'https://www.hirist.tech/c/full-stack-jobs', '2027-01-31'::date, TRUE, TRUE),
('00000000-0000-0000-0000-000000000066', (SELECT id FROM companies WHERE name = 'Procore' LIMIT 1), (SELECT id FROM users WHERE email = 'ingestor@uplink.edu' LIMIT 1), 'JOB', 'Staff Software Engineer - Full Stack Development', 'Verified live listing from Hirist. Procore is looking for a Staff Software Engineer - Full Stack Development. Work mode: ONSITE. Location: Bengaluru, KA. Experience required: 9–11 yrs. Compensation: Undisclosed (Posted \6d).', 'Bengaluru, KA', 'ONSITE', '9–11 yrs', NULL, NULL, 'https://www.hirist.tech/c/full-stack-jobs', '2027-01-31'::date, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- TIER 3: POSTS
INSERT INTO posts (id, user_id, content, type)
SELECT 'e1111111-1111-1111-1111-111111111111'::uuid, id, 'AI Kaushal Hackathon 2026 closes Nov 20; CodeWarriors India 2026 open until Dec 3. Make sure your resumes and team profiles are verified on Uplink!', 'NOTICE' FROM users WHERE email = 'admin@uplink.edu'
UNION ALL
SELECT 'e2222222-2222-2222-2222-222222222222'::uuid, id, 'Looking for 1 React Native and 1 Spring Boot teammate for CodeWarriors India 2026 Agentic AI track. DM if interested!', 'POST' FROM users WHERE email = 'peer1@uplink.edu'
UNION ALL
SELECT 'e3333333-3333-3333-3333-333333333333'::uuid, id, 'What technical interviewers look for in backend and AI internships: deep fundamentals in concurrency, clean REST APIs, and hands-on distributed project experience.', 'BLOG' FROM users WHERE email = 'recruiter@uplink.edu'
ON CONFLICT (id) DO NOTHING;


-- TIER 3: QUESTIONS (Q1 by student, Q2 by peer2, Q3 by peer1)
INSERT INTO questions (id, author_id, title, description, topic_tags, answer_count, same_doubt_count, is_unanswered)
SELECT 'f1111111-1111-1111-1111-111111111111'::uuid, id, 'How to avoid Hibernate 7 lower(bytea) errors with nullable search filters in PostgreSQL?', 'When querying bytea or case-insensitive text filters with Hibernate 7 and PostgreSQL, lower() fails on byte array columns. What is the clean JPA specification or native cast approach?', 'hibernate,postgresql,spring-boot,java', 1, 2, FALSE FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'f2222222-2222-2222-2222-222222222222'::uuid, id, 'Should freshers apply to Hirist MERN jobs requiring 1–3 yrs experience?', 'Many Hirist off-campus openings list 1-3 years experience for MERN stack roles. Can final-year students with production hackathon projects and internship experience apply?', 'career,hiring,mern,freshers', 1, 1, FALSE FROM users WHERE email = 'peer2@uplink.edu'
UNION ALL
SELECT 'f3333333-3333-3333-3333-333333333333'::uuid, id, 'Best deployment setup for STOMP /ws-raw on 512MB vs 2GB containers?', 'We are deploying Spring Boot with WebSocket STOMP messaging over Railway. Should we scale horizontal instances or increase container RAM for concurrent socket connections?', 'websocket,stomp,devops,railway', 0, 1, TRUE FROM users WHERE email = 'peer1@uplink.edu'
ON CONFLICT (id) DO NOTHING;


-- TIER 3: DOCUMENTS
INSERT INTO documents (id, user_id, name, file_url, type, status)
SELECT '91111111-1111-1111-1111-111111111111'::uuid, id, 'Rohan_Kulkarni_ATS_Resume.pdf', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'RESUME', 'VERIFIED' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT '92222222-2222-2222-2222-222222222222'::uuid, id, 'College_ID_Card.pdf', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'IDENTITY_PROOF', 'VERIFIED' FROM users WHERE email = 'student@uplink.edu'
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------------
-- TIER 4: OPPORTUNITY SOURCES, SKILLS, FEEDBACK & INTERACTIONS
-- -------------------------------------------------------------------

-- TIER 4: OPPORTUNITY SOURCES (66 Portal Source Records)
INSERT INTO opportunity_sources (opportunity_id, source_name, source_url) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Unstop', 'https://unstop.com/hackathons/ai-kaushal-hackathon-2026-indian-institute-of-information-technology-iiit-lucknow-1817798'),
('00000000-0000-0000-0000-000000000002'::uuid, 'Unstop', 'https://unstop.com/hackathons/codewarriors-india-2026-national-hackathon-buildx-1817737'),
('00000000-0000-0000-0000-000000000003'::uuid, 'Unstop', 'https://unstop.com/hackathons/codeunited-india-national-hackathon-hackwithpune-1817749'),
('00000000-0000-0000-0000-000000000004'::uuid, 'Unstop', 'https://unstop.com/hackathons/innovate-hackathon-2026-devharbour-1792025'),
('00000000-0000-0000-0000-000000000005'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000006'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000007'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000008'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000009'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000010'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000011'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000012'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000013'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000014'::uuid, 'Unstop', 'https://unstop.com/hackathons'),
('00000000-0000-0000-0000-000000000015'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000016'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000017'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000018'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000019'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000020'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000021'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000022'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000023'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000024'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000025'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000026'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000027'::uuid, 'Unstop', 'https://unstop.com/internship/software-development-internship'),
('00000000-0000-0000-0000-000000000028'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000029'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000030'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000031'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000032'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000033'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000034'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000035'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000036'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000037'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000038'::uuid, 'InternDoor', 'https://interndoor.com/'),
('00000000-0000-0000-0000-000000000039'::uuid, 'Google Careers', 'https://www.google.com/about/careers/applications/jobs/results/127602843300307654-software-engineer-aiml-phd-early-career-2026'),
('00000000-0000-0000-0000-000000000040'::uuid, 'Google Careers', 'https://www.google.com/about/careers/applications/jobs/results/132362676918461126-student-researcher-bsms-fall-2026'),
('00000000-0000-0000-0000-000000000041'::uuid, 'JPMC Oracle Cloud', 'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/210808578'),
('00000000-0000-0000-0000-000000000042'::uuid, 'JPMC Oracle Cloud', 'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs?location=India\&locationId=300000000289360\&locationLevel=country'),
('00000000-0000-0000-0000-000000000043'::uuid, 'Work at a Startup', 'https://www.workatastartup.com/jobs/122543'),
('00000000-0000-0000-0000-000000000044'::uuid, 'AccioJob', 'https://acciojob.com/self-paced'),
('00000000-0000-0000-0000-000000000045'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000046'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000047'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000048'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000049'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000050'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000051'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000052'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000053'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000054'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000055'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000056'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000057'::uuid, 'AccioJob Board', 'https://placement.acciojob.com/jobs/?category=OFF_CAMPUS\&role=full-stack-developer\&location=other'),
('00000000-0000-0000-0000-000000000058'::uuid, 'Hirist', 'https://www.hirist.tech/k/mern-stack-jobs'),
('00000000-0000-0000-0000-000000000059'::uuid, 'Hirist', 'https://www.hirist.tech/k/mern-stack-jobs'),
('00000000-0000-0000-0000-000000000060'::uuid, 'Hirist', 'https://www.hirist.tech/k/mern-stack-jobs'),
('00000000-0000-0000-0000-000000000061'::uuid, 'Hirist', 'https://www.hirist.tech/k/mern-stack-jobs'),
('00000000-0000-0000-0000-000000000062'::uuid, 'Hirist', 'https://www.hirist.tech/c/full-stack-jobs'),
('00000000-0000-0000-0000-000000000063'::uuid, 'Hirist', 'https://www.hirist.tech/c/full-stack-jobs'),
('00000000-0000-0000-0000-000000000064'::uuid, 'Hirist', 'https://www.hirist.tech/c/full-stack-jobs'),
('00000000-0000-0000-0000-000000000065'::uuid, 'Hirist', 'https://www.hirist.tech/c/full-stack-jobs'),
('00000000-0000-0000-0000-000000000066'::uuid, 'Hirist', 'https://www.hirist.tech/c/full-stack-jobs');

-- TIER 4: OPPORTUNITY SKILLS (Evidence-based skill mapping)
-- Map Skills based on title and listing explicitly stated skills
INSERT INTO opportunity_skills (opportunity_id, skill_id, is_mandatory, proficiency_required)
SELECT o.id, s.id, TRUE, 'INTERMEDIATE'
FROM opportunities o, skills s
WHERE (o.title ILIKE '%' || s.name || '%' OR o.description ILIKE '%' || s.name || '%')
  AND s.name IN ('Java', 'Python', 'React.js', 'React Native', 'Node.js', 'Spring Boot', 'SQL', 'PostgreSQL', 'Machine Learning', 'Large Language Models (LLMs)', 'Generative AI', 'Agentic AI', 'Prompt Engineering', 'TypeScript', 'C++', 'C#', '.NET Core', 'MongoDB', 'Express.js', 'FastAPI', 'Docker', 'Git', 'REST APIs', 'Microservices Architecture', 'System Design', 'Distributed Systems', 'Selenium', 'PowerApps')
ON CONFLICT (opportunity_id, skill_id) DO NOTHING;


-- TIER 4: COMMENTS & LIKES
INSERT INTO comments (post_id, user_id, content)
SELECT 'e2222222-2222-2222-2222-222222222222'::uuid, id, 'Interested! I have the backend and STOMP messaging setup ready.' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'e2222222-2222-2222-2222-222222222222'::uuid, id, 'Count me in for mobile UI components!' FROM users WHERE email = 'peer2@uplink.edu';

INSERT INTO likes (post_id, user_id)
SELECT 'e2222222-2222-2222-2222-222222222222'::uuid, id FROM users WHERE email IN ('student@uplink.edu', 'peer1@uplink.edu', 'peer2@uplink.edu', 'recruiter@uplink.edu')
ON CONFLICT (post_id, user_id) DO NOTHING;


-- TIER 4: ANSWERS & DOUBTS
INSERT INTO answers (id, question_id, author_id, content, is_accepted, helpful_count)
SELECT '81111111-1111-1111-1111-111111111111'::uuid, 'f1111111-1111-1111-1111-111111111111'::uuid, id, 'Cast the parameter explicitly or use CriteriaBuilder.function(''lower'', String.class, ...). In PostgreSQL, avoid wrapping bytea columns in lower(); ensure your JPA entity maps the attribute strictly as String with columnDefinition=''text''.', TRUE, 2 FROM users WHERE email = 'peer1@uplink.edu'
UNION ALL
SELECT '82222222-2222-2222-2222-222222222222'::uuid, 'f2222222-2222-2222-2222-222222222222'::uuid, id, 'Yes, absolutely! 1-3 years experience requirements on portals like Hirist often include relevant internships, open-source contributions, and verified live projects like those tracked on Uplink.', FALSE, 1 FROM users WHERE email = 'recruiter@uplink.edu'
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_doubts (question_id, user_id)
SELECT 'f1111111-1111-1111-1111-111111111111'::uuid, id FROM users WHERE email IN ('peer1@uplink.edu', 'peer2@uplink.edu')
UNION ALL
SELECT 'f2222222-2222-2222-2222-222222222222'::uuid, id FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'f3333333-3333-3333-3333-333333333333'::uuid, id FROM users WHERE email = 'student@uplink.edu'
ON CONFLICT (question_id, user_id) DO NOTHING;


-- TIER 4: MESSAGES (Real-Time Chat Thread with is_read = FALSE for unread badge)
INSERT INTO messages (conversation_id, sender_id, content, is_read, message_type)
-- Conv 1
SELECT 'd1111111-1111-1111-1111-111111111111'::uuid, id, 'Hey Sneha, are you participating in CodeWarriors India 2026 National Hackathon?', TRUE, 'TEXT' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'd1111111-1111-1111-1111-111111111111'::uuid, id, 'Yes Rohan! I saw the Agentic AI track. We should team up with our Spring Boot and React Native stack.', TRUE, 'TEXT' FROM users WHERE email = 'peer1@uplink.edu'
UNION ALL
SELECT 'd1111111-1111-1111-1111-111111111111'::uuid, id, 'Awesome, I just saved the hackathon on Uplink. Let''s draft the problem statement tonight.', TRUE, 'TEXT' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'd1111111-1111-1111-1111-111111111111'::uuid, id, 'Sounds great! I will prepare the initial system design diagram for our submission.', FALSE, 'TEXT' FROM users WHERE email = 'peer1@uplink.edu'
-- Conv 2
UNION ALL
SELECT 'd2222222-2222-2222-2222-222222222222'::uuid, id, 'Hello Ananya, thank you for reviewing my profile for the software engineering internships.', TRUE, 'TEXT' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'd2222222-2222-2222-2222-222222222222'::uuid, id, 'Hi Rohan, your distributed systems projects look solid. Be sure to review concurrency and JPA locking before the interview round.', TRUE, 'TEXT' FROM users WHERE email = 'recruiter@uplink.edu'
-- Conv 3
UNION ALL
SELECT 'd3333333-3333-3333-3333-333333333333'::uuid, id, 'Welcome Karthik and Sneha! Let''s use this thread for upcoming national hackathons.', TRUE, 'TEXT' FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'd3333333-3333-3333-3333-333333333333'::uuid, id, 'Excited to collaborate! Let me know which UI screens I can take up.', TRUE, 'TEXT' FROM users WHERE email = 'peer2@uplink.edu';


-- TIER 4: APPLICATIONS & SAVED OPPORTUNITIES
-- 3 Applications for student@uplink.edu (Zebra Technologies, Paytm, JPMorganChase)
INSERT INTO applications (opportunity_id, user_id, status, expected_ctc)
SELECT o.id, u.id, 'SHORTLISTED', 35000.00
FROM opportunities o, users u
WHERE o.title ILIKE '%AI Systems Development%' AND u.email = 'student@uplink.edu'
LIMIT 1;

INSERT INTO applications (opportunity_id, user_id, status, expected_ctc)
SELECT o.id, u.id, 'UNDER_REVIEW', 30000.00
FROM opportunities o, users u
WHERE o.title ILIKE '%Backend Intern%' AND u.email = 'student@uplink.edu'
LIMIT 1;

INSERT INTO applications (opportunity_id, user_id, status, expected_ctc)
SELECT o.id, u.id, 'APPLIED', 1400000.00
FROM opportunities o, users u
WHERE o.title ILIKE '%Python Developer (Analyst)%' AND u.email = 'student@uplink.edu'
LIMIT 1;

-- Saved Opportunities
INSERT INTO saved_opportunities (opportunity_id, user_id)
SELECT o.id, u.id
FROM opportunities o, users u
WHERE o.title ILIKE '%CodeWarriors India 2026%' AND u.email = 'student@uplink.edu'
LIMIT 1;

INSERT INTO saved_opportunities (opportunity_id, user_id)
SELECT o.id, u.id
FROM opportunities o, users u
WHERE o.title ILIKE '%Software Engineer Intern%' AND o.location ILIKE '%Gurgaon%' AND u.email = 'student@uplink.edu'
LIMIT 1;

INSERT INTO saved_opportunities (opportunity_id, user_id)
SELECT o.id, u.id
FROM opportunities o, users u
WHERE o.title ILIKE '%IT Intern - Backend Development%' AND u.email = 'peer1@uplink.edu'
LIMIT 1;


-- TIER 4: ASSESSMENT ATTEMPTS, SKILL GAPS, RECOMMENDATIONS, NOTIFICATIONS
-- Completed Quiz Attempts
INSERT INTO assessment_attempts (assessment_id, user_id, score)
SELECT 'b1111111-1111-1111-1111-111111111111'::uuid, id, 4.00 FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT 'b3333333-3333-3333-3333-333333333333'::uuid, id, 5.00 FROM users WHERE email = 'peer1@uplink.edu';

-- Skill Gaps
INSERT INTO skill_gaps (user_id, target_role, gap_data)
SELECT id, 'Full-Stack & AI Systems Intern', '{"target_role":"Full-Stack & AI Systems Intern","missing_skills":["Docker","CI/CD Pipelines","Large Language Models (LLMs)"],"study_plan":[{"skill":"Docker","resource":"Containerizing Spring Boot & Postgres","duration":"1 week"},{"skill":"CI/CD Pipelines","resource":"GitHub Actions & Railway Deployment","duration":"1 week"},{"skill":"Large Language Models (LLMs)","resource":"LangChain & RAG Vector Search Basics","duration":"2 weeks"}]}'
FROM users WHERE email = 'student@uplink.edu';

-- Recommendations (2 OPPORTUNITY, 1 SKILL)
INSERT INTO recommendations (user_id, type, ref_id, score, reason)
SELECT u.id, 'OPPORTUNITY', o.id, 91.50, 'Matches your AI Systems and Systems Engineering interests.'
FROM users u, opportunities o
WHERE u.email = 'student@uplink.edu' AND o.title ILIKE '%AI Systems Development%'
LIMIT 1;

INSERT INTO recommendations (user_id, type, ref_id, score, reason)
SELECT u.id, 'OPPORTUNITY', o.id, 88.00, 'Matches your Java & Spring Boot backend skills.'
FROM users u, opportunities o
WHERE u.email = 'student@uplink.edu' AND o.title ILIKE '%Java Developer Internship%'
LIMIT 1;

INSERT INTO recommendations (user_id, type, ref_id, score, reason)
SELECT u.id, 'SKILL', s.id, 85.00, 'High market demand for engineering interns with LLM / RAG expertise.'
FROM users u, skills s
WHERE u.email = 'student@uplink.edu' AND s.name = 'Large Language Models (LLMs)'
LIMIT 1;

-- Notifications
INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT id, 'Application Shortlisted', 'Your application for Zebra Technologies Intern II - AI Systems Development has been shortlisted!', 'APPLICATION', FALSE FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT id, 'Hackathon Registration Closing', 'AI Kaushal Hackathon 2026 closes registration soon. Submit your team entry!', 'EVENT', FALSE FROM users WHERE email = 'student@uplink.edu'
UNION ALL
SELECT id, 'Assessment Completed', 'You scored 80% on Backend Engineering: Java, Spring Boot & PostgreSQL.', 'ASSESSMENT', TRUE FROM users WHERE email = 'student@uplink.edu';


-- -------------------------------------------------------------------
-- TIER 5: APPLICATION STATUS HISTORY & ANSWER HELPFULS
-- -------------------------------------------------------------------
INSERT INTO application_status_history (application_id, status, remarks, changed_by)
SELECT a.id, 'APPLIED', 'Application submitted via Uplink portal.', u.id
FROM applications a, users u, opportunities o
WHERE a.opportunity_id = o.id AND o.title ILIKE '%AI Systems Development%' AND u.email = 'student@uplink.edu'
UNION ALL
SELECT a.id, 'UNDER_REVIEW', 'Candidate portfolio and assessment scores reviewed by technical recruiter.', r.id
FROM applications a, users r, opportunities o
WHERE a.opportunity_id = o.id AND o.title ILIKE '%AI Systems Development%' AND r.email = 'recruiter@uplink.edu'
UNION ALL
SELECT a.id, 'SHORTLISTED', 'Shortlisted for Round 1 technical interview.', r.id
FROM applications a, users r, opportunities o
WHERE a.opportunity_id = o.id AND o.title ILIKE '%AI Systems Development%' AND r.email = 'recruiter@uplink.edu'
UNION ALL
SELECT a.id, 'APPLIED', 'Application submitted via Uplink portal.', u.id
FROM applications a, users u, opportunities o
WHERE a.opportunity_id = o.id AND o.title ILIKE '%Backend Intern%' AND u.email = 'student@uplink.edu'
UNION ALL
SELECT a.id, 'UNDER_REVIEW', 'Resume under review by engineering team.', r.id
FROM applications a, users r, opportunities o
WHERE a.opportunity_id = o.id AND o.title ILIKE '%Backend Intern%' AND r.email = 'recruiter@uplink.edu'
UNION ALL
SELECT a.id, 'APPLIED', 'Application submitted via Uplink portal.', u.id
FROM applications a, users u, opportunities o
WHERE a.opportunity_id = o.id AND o.title ILIKE '%Python Developer (Analyst)%' AND u.email = 'student@uplink.edu';

INSERT INTO answer_helpfuls (answer_id, user_id)
SELECT '81111111-1111-1111-1111-111111111111'::uuid, id FROM users WHERE email IN ('student@uplink.edu', 'peer2@uplink.edu')
UNION ALL
SELECT '82222222-2222-2222-2222-222222222222'::uuid, id FROM users WHERE email = 'peer2@uplink.edu'
ON CONFLICT (answer_id, user_id) DO NOTHING;


-- -------------------------------------------------------------------
-- COUNTER SYNCHRONIZATION
-- -------------------------------------------------------------------
UPDATE questions q
SET answer_count = (SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id),
    same_doubt_count = (SELECT COUNT(*) FROM question_doubts d WHERE d.question_id = q.id),
    is_unanswered = ((SELECT COUNT(*) FROM answers a WHERE a.question_id = q.id) = 0);

UPDATE answers a
SET helpful_count = (SELECT COUNT(*) FROM answer_helpfuls h WHERE h.answer_id = a.id);


-- -------------------------------------------------------------------
-- TIER 6: FUTURE-SCOPE MODULES & AUDIT LOG
-- -------------------------------------------------------------------
-- Keep mentor_bookings and ocr_jobs strictly 0 rows
DELETE FROM mentor_bookings;
DELETE FROM ocr_jobs;
DELETE FROM mentor_profiles;

INSERT INTO audit_logs (id, action, entity, metadata) VALUES
('f0000000-0000-0000-0000-000000000001', 'SEED_INITIALIZED', 'SYSTEM', '{"status":"SUCCESS","total_opportunities":66,"mentor_bookings":0,"ocr_jobs":0,"mentor_profiles":0}');


COMMIT;