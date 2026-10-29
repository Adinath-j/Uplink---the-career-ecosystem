import { Question, Answer } from '../../types/models';

/**
 * SAMPLE Q&A DATA
 *
 * Seed data for verifying the Q&A knowledge sharing workflow.
 * Clearly labeled as sample data.
 */

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    title: 'How should I structure database indexing for high write-rate telemetry tables?',
    description:
      'We are designing an IoT time-series tracker for our capstone project using PostgreSQL. The table receives around 2,000 inserts per minute. What indexing strategy (B-Tree vs BRIN) and partitioning approach would you recommend without causing excessive write latency?',
    topicTags: ['System Design', 'Web Development'],
    authorId: 'u-101',
    authorName: 'Rohan Sharma',
    authorAcademicContext: 'B.Tech CSE • Year 4',
    createdAt: '2026-10-25T11:40:00Z',
    answerCount: 2,
    sameDoubtCount: 14,
    hasUserMarkedSameDoubt: false,
    isUnanswered: false,
  },
  {
    id: 'q-2',
    title: 'Which dynamic programming patterns are most commonly asked in campus placement online tests?',
    description:
      'I am preparing for upcoming internship drives in November. I have practiced 0/1 Knapsack and LCS variants. What other DP sub-patterns (e.g. interval DP, bitmask, trees) have frequently appeared in recent on-campus rounds for tier-1 tech companies?',
    topicTags: ['DSA', 'Placements'],
    authorId: 'u-102',
    authorName: 'Priya Patel',
    authorAcademicContext: 'B.Tech IT • Year 3',
    createdAt: '2026-10-26T08:15:00Z',
    answerCount: 3,
    sameDoubtCount: 28,
    hasUserMarkedSameDoubt: true,
    isUnanswered: false,
  },
  {
    id: 'q-3',
    title: 'Differences between Spring Boot 3 Native Images and standard JVM deployment in memory-constrained environments?',
    description:
      'Trying to understand whether GraalVM native compilation is worth configuring for a campus microservice with 256MB RAM limit. Does reflection handling and build-time configuration offset the fast startup benefits?',
    topicTags: ['DevOps', 'Web Development'],
    authorId: 'u-103',
    authorName: 'Arjun Das',
    authorAcademicContext: 'B.Tech CSE • Year 4',
    createdAt: '2026-10-26T14:00:00Z',
    answerCount: 0,
    sameDoubtCount: 8,
    hasUserMarkedSameDoubt: false,
    isUnanswered: true,
  },
  {
    id: 'q-4',
    title: 'How to effectively represent non-trivial open source contributions on a student resume?',
    description:
      'I contributed documentation and bug fixes to two Apache Foundation projects over the summer. Should I list these under Experience or under Projects? How do recruiter screeners evaluate GitHub pull request links?',
    topicTags: ['Resume', 'Placements'],
    authorId: 'u-current',
    authorName: 'Aditya Verma',
    authorAcademicContext: 'B.Tech CSE • Year 3',
    createdAt: '2026-10-24T16:20:00Z',
    answerCount: 1,
    sameDoubtCount: 19,
    hasUserMarkedSameDoubt: false,
    isUnanswered: false,
  },
  {
    id: 'q-5',
    title: 'Undergraduate research submission deadlines for ACL and EMNLP: how to manage academic semester clashes?',
    description:
      'Looking for advice from seniors who balanced major semester examinations alongside paper rebuttals and camera-ready deadlines.',
    topicTags: ['Academics', 'AI/ML'],
    authorId: 'u-104',
    authorName: 'Neha Sen',
    authorAcademicContext: 'M.Tech AI • Year 1',
    createdAt: '2026-10-23T09:30:00Z',
    answerCount: 0,
    sameDoubtCount: 5,
    hasUserMarkedSameDoubt: false,
    isUnanswered: true,
  },
];

export const MOCK_ANSWERS: Record<string, Answer[]> = {
  'q-1': [
    {
      id: 'ans-101',
      questionId: 'q-1',
      authorId: 'm-201',
      authorName: 'Vikram Sethi',
      authorRole: 'Senior Staff Engineer • CloudScale',
      content:
        'For high-frequency write telemetry, BRIN (Block Range Index) is drastically superior to B-Tree in PostgreSQL. BRIN indexes occupy a fraction of the disk space (often kilobytes instead of gigabytes) and have minimal impact on insertion throughput because updates only occur when new block ranges are allocated.\n\nPair this with native declarative range partitioning on your `timestamp` column (e.g. daily or weekly tables) and you can drop historical partitions instantaneously without VACUUM overhead.',
      createdAt: '2026-10-25T13:20:00Z',
      helpfulCount: 18,
      isAccepted: true,
      hasUserMarkedHelpful: true,
    },
    {
      id: 'ans-102',
      questionId: 'q-1',
      authorId: 'u-105',
      authorName: 'Devika Nair',
      authorRole: 'Alumni 2024 • Backend Developer',
      content:
        'Also ensure you avoid indexing mutable columns. If you only query by sensor_id and timestamp, a composite BRIN index on `(sensor_id, timestamp)` after ordering inserts will give you near O(1) query time for date range lookups.',
      createdAt: '2026-10-25T15:10:00Z',
      helpfulCount: 6,
      isAccepted: false,
      hasUserMarkedHelpful: false,
    },
  ],
  'q-2': [
    {
      id: 'ans-201',
      questionId: 'q-2',
      authorId: 'u-106',
      authorName: 'Siddharth Rao',
      authorRole: 'Final Year CSE • Incoming SDE',
      content:
        'Based on tests from the last two recruitment seasons:\n\n1. State machine DP (Buy & Sell Stock with cooldown/k transactions)\n2. DP on Trees (Maximum Path Sum, Diameter, Subtree counts)\n3. Matrix Chain Multiplication (Partition DP)\n\nBitmask DP is rare in initial online screening rounds but occasionally asked in final round system engineering evaluations.',
      createdAt: '2026-10-26T09:40:00Z',
      helpfulCount: 14,
      isAccepted: false,
      hasUserMarkedHelpful: false,
    },
  ],
  'q-4': [
    {
      id: 'ans-401',
      questionId: 'q-4',
      authorId: 'm-202',
      authorName: 'Ananya Roy',
      authorRole: 'Tech Lead • OpenSource Guild',
      content:
        'List substantial open source work under a dedicated section titled "Open Source Engineering" or under "Experience" if it was part of an organized program (like GSoC or LFX). Always link the specific merged PRs and describe the business/engineering impact (e.g., "Resolved concurrency race condition affecting memory leak in Netty pipeline").',
      createdAt: '2026-10-24T18:00:00Z',
      helpfulCount: 11,
      isAccepted: true,
      hasUserMarkedHelpful: true,
    },
  ],
};
