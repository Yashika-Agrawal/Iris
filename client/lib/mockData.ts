import { Commitment, RelationshipProfile, ActionItem, SmartThread, PrepMeeting } from '../types';

export const mockBriefingStats = {
  urgentEmailsCount: 4,
  meetingsCount: 2,
  conflictsCount: 1,
  followupsCount: 3,
};

export const mockActionItems: ActionItem[] = [
  {
    id: 'act-1',
    source: 'email',
    title: 'Review Board Deck Draft',
    urgency: 'high',
    impact: 'critical',
    summary: 'Rohan sent the Q3 board proposal deck. Review is required today to lock hiring slots.',
    actionLabel: 'Review Deck',
  },
  {
    id: 'act-2',
    source: 'calendar',
    title: 'Double Booking Conflict (2:00 PM)',
    urgency: 'high',
    impact: 'critical',
    summary: 'You are double-booked for the Q3 Spec Review with Piyush and the Client Sync with DigitalOcean.',
    actionLabel: 'Resolve Conflict',
  },
  {
    id: 'act-3',
    source: 'email',
    title: 'Pending Follow-up with Rahul',
    urgency: 'medium',
    impact: 'normal',
    summary: 'Rahul requested API migration details 18 hours ago. No response has been drafted.',
    actionLabel: 'Draft Response',
  }
];

export const mockCommitments: Commitment[] = [
  {
    id: 'comm-1',
    type: 'received',
    sender: 'Rohan Sharma',
    text: 'Send Q3 board deck draft for lock by Monday morning.',
    dueDate: '2026-06-15T09:00:00Z',
    status: 'pending',
    riskLevel: 'high',
    riskDescription: 'Hiring freeze might trigger if deck is not presented on Tuesday.',
  },
  {
    id: 'comm-2',
    type: 'sent',
    sender: 'Rahul Gupta',
    text: 'Send API migration spec document by Friday afternoon.',
    dueDate: '2026-06-12T17:00:00Z',
    status: 'overdue',
    riskLevel: 'medium',
    riskDescription: 'Partner integration timeline is delayed by 18 hours.',
  },
  {
    id: 'comm-3',
    type: 'received',
    sender: 'Piyush Garg',
    text: 'Share the updated product demo workspace invitation.',
    dueDate: '2026-06-14T18:00:00Z',
    status: 'pending',
    riskLevel: 'low',
  }
];

export const mockRelationships: RelationshipProfile[] = [
  {
    id: 'rel-1',
    name: 'Piyush Garg',
    email: 'piyush@corsair.dev',
    avatar: 'PG',
    lastContact: '2026-06-13T10:24:00Z',
    openQuestions: ['Did the demo setup work on your local port?', 'Can you join the resched meeting?'],
    pendingFollowups: 1,
    upcomingMeeting: 'Today at 2:00 PM',
  },
  {
    id: 'rel-2',
    name: 'Rohan Sharma',
    email: 'rohan@corsair.dev',
    avatar: 'RS',
    lastContact: 'Yesterday',
    openQuestions: ['Do you need changes on the hiring slot budget?'],
    pendingFollowups: 2,
    upcomingMeeting: 'Tomorrow at 10:00 AM',
  },
  {
    id: 'rel-3',
    name: 'Rahul Gupta',
    email: 'rahul@corsair.dev',
    avatar: 'RG',
    lastContact: '2 days ago',
    openQuestions: ['Has the migration to PostgreSQL completed?'],
    pendingFollowups: 1,
  }
];

export const mockSmartThreads: SmartThread[] = [
  {
    id: 'thread-1',
    from: 'Rohan Sharma',
    fromEmail: 'rohan@corsair.dev',
    subject: 'Action Required: Locked Q3 Board Budget Draft',
    date: '2026-06-13T22:24:00Z',
    preview: 'Please find the locked draft attached...',
    isUnread: true,
    category: 'action',
    aiAnalysis: {
      need: 'Review and approve the locked Q3 budget draft.',
      context: 'Rohan finalized the hiring budget. Board review is scheduled on Tuesday.',
      action: 'Approve Budget & Unlock Slots',
      reply: 'Hi Rohan,\n\nI have reviewed the budget. Everything looks solid for the Q3 hiring slots. Approved!\n\nBest,\nYashika',
      nextStep: 'Submit to board coordinator on Monday.',
      riskLevel: 'high',
      riskDescription: 'Hiring freeze starts Tuesday if board deck remains unapproved.',
    }
  },
  {
    id: 'thread-2',
    from: 'Piyush Garg',
    fromEmail: 'piyush@corsair.dev',
    subject: 'Q3 Spec Review Reschedule request',
    date: '2026-06-13T21:15:00Z',
    preview: 'Can we move the review slot to 3 PM?',
    isUnread: true,
    category: 'scheduling',
    aiAnalysis: {
      need: 'Agree to reschedule the Q3 review slot.',
      context: 'Double booked at 2 PM with the DigitalOcean client sync.',
      action: 'Accept Resched to 3 PM',
      reply: 'Hi Piyush,\n\n3 PM works perfectly for the resched review slot. See you then!\n\nBest,\nYashika',
      nextStep: 'Accept calendar invite.',
      riskLevel: 'medium',
      riskDescription: 'Double booking will cause you to miss Client Sync.',
    }
  },
  {
    id: 'thread-3',
    from: 'DigitalOcean Support',
    fromEmail: 'support@digitalocean.com',
    subject: 'Client Sync: Production Database migration',
    date: '2026-06-13T20:30:00Z',
    preview: 'Database sync has finished successfully.',
    isUnread: false,
    category: 'fyi',
    aiAnalysis: {
      need: 'No action required. Database migration finished successfully.',
      context: 'DigitalOcean database host was moved to the Frankfurt region.',
      action: 'Archive',
      reply: 'Thanks for the confirmation.',
      nextStep: 'Ensure local connections are working.',
      riskLevel: 'low',
    }
  }
];

export const mockPrepMeetings: PrepMeeting[] = [
  {
    id: 'meet-1',
    title: 'Q3 Spec Review',
    time: '2:00 PM',
    duration: '45m',
    participants: [
      { name: 'Piyush Garg', email: 'piyush@corsair.dev' },
      { name: 'Yashika Agrawal', email: 'yashika@example.com' }
    ],
    brief: 'Final signoff on the PostgreSQL sync engine specifications and the encryption model schemas.',
    talkingPoints: [
      'Confirm the key rotation strategy for CORSAIR_KEK.',
      'Check if the multi-tenancy database query bounds have been benchmarked.',
    ],
    risks: [
      'Missing the meeting leaves the development timeline blocked for next week.'
    ],
    actions: [
      'Reschedule meeting to 3 PM to resolve double-booking conflict.'
    ],
    relatedEmailIds: ['thread-2']
  },
  {
    id: 'meet-2',
    title: 'Client Sync with DigitalOcean',
    time: '2:00 PM',
    duration: '30m',
    participants: [
      { name: 'DigitalOcean Coordinator', email: 'support@digitalocean.com' },
      { name: 'Yashika Agrawal', email: 'yashika@example.com' }
    ],
    brief: 'Reviewing database migration feedback, connection issues, and SSL mode requirements.',
    talkingPoints: [
      'Review SSL mode aliases support for PostgreSQL connections.',
      'Establish production failover strategy.'
    ],
    risks: [
      'Lack of confirmation on SSL rules can cause app downtime.'
    ],
    actions: [
      'Complete safety checklist verification.'
    ],
    relatedEmailIds: ['thread-3']
  }
];
