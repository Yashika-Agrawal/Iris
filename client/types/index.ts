export type Priority = 'urgent' | 'important' | 'fyi'

export type Thread = {
  id: string
  from: string
  fromEmail: string
  subject: string
  preview: string
  body: string
  date: string
  isUnread: boolean
  priority: Priority
  responseWindow?: string   // e.g. "reply within 2h"
  labels: string[]
}

export type Message = { 
  id: string; 
  threadId: string; 
  from: string; 
  to: string; 
  body: string; 
  date: string 
};

export type CalEvent = {
  id: string
  title: string
  start: string
  end: string
  guests: string[]
  description?: string
}

export type FocusItem =
  | { type: 'email'; thread: Thread }
  | { type: 'calendar'; event: CalEvent }
  | { type: 'followup'; threadId: string; subject: string; dueIn: string }

export type ToolCall = {
  service: 'gmail' | 'gcal'
  label: string
}

export type AgentMessage = {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
}

export interface Commitment {
  id: string;
  type: 'sent' | 'received';
  sender: string;
  text: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'completed';
  riskLevel: 'low' | 'medium' | 'high';
  riskDescription?: string;
}

export interface RelationshipProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastContact: string;
  openQuestions: string[];
  pendingFollowups: number;
  upcomingMeeting?: string;
}

export interface ActionItem {
  id: string;
  source: 'email' | 'calendar';
  title: string;
  urgency: 'high' | 'medium' | 'low';
  impact: 'critical' | 'normal';
  summary: string;
  actionLabel: string;
}

export interface SmartThread {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  date: string;
  preview: string;
  isUnread: boolean;
  category: 'action' | 'meeting' | 'scheduling' | 'fyi' | 'newsletter';
  aiAnalysis?: {
    need: string;
    context: string;
    action: string;
    reply: string;
    nextStep: string;
    riskLevel?: 'low' | 'medium' | 'high';
    riskDescription?: string;
  };
}

export interface PrepMeeting {
  id: string;
  title: string;
  time: string;
  duration: string;
  participants: { name: string; email: string; avatar?: string }[];
  brief: string;
  talkingPoints: string[];
  risks: string[];
  actions: string[];
  relatedEmailIds: string[];
}

