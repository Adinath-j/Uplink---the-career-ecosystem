import { InAppNotification } from '../../types/models';

/**
 * SAMPLE IN-APP NOTIFICATIONS
 */

export const MOCK_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    title: 'Application Status Updated',
    message: 'Your application for Software Engineering Intern at Acme Cloud Systems is now Under Review.',
    type: 'APPLICATION',
    createdAt: '2026-10-25T09:15:00Z',
    isRead: false,
    targetId: 'app-1',
  },
  {
    id: 'notif-2',
    title: 'Mentorship Session Confirmed',
    message: 'Kavita Sundaram accepted your booking request for Saturday, Nov 07.',
    type: 'MENTORSHIP',
    createdAt: '2026-10-24T10:30:00Z',
    isRead: false,
    targetId: 'br-1',
  },
  {
    id: 'notif-3',
    title: 'New Answer on Your Question',
    message: 'Ananya Roy answered your question regarding open-source contributions.',
    type: 'QA',
    createdAt: '2026-10-24T18:00:00Z',
    isRead: true,
    targetId: 'q-4',
  },
];
