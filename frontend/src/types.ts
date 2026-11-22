/**
 * Shared Type Definitions for Civic Notice Intelligence System
 */

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type NoticeStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'EXPIRED';

export type NoticeCategory =
  | 'Emergency & Disaster Alerts'
  | 'Water & Electricity'
  | 'Traffic & Transportation'
  | 'Government Schemes'
  | 'Education & Scholarships'
  | 'Employment & Recruitment'
  | 'Health & Public Services'
  | 'Tax & Legal Announcements'
  | 'Municipal Services'
  | 'General Government Information';

export interface NoticeItem {
  id: string;
  title: string;
  category: NoticeCategory;
  summary: string;
  detailed_summary: string;
  action_summary: string;
  translations: {
    en: { title: string; summary: string; action: string };
    te: { title: string; summary: string; action: string };
    hi: { title: string; summary: string; action: string };
  };
  authority: string;
  source_url?: string;
  document_url?: string;
  file_type?: string;
  original_text?: string;
  urgency: UrgencyLevel;
  status: NoticeStatus;
  locations: string[];
  target_audience: string;
  start_date?: string;
  deadline?: string;
  contact_info?: string;
  confidence_score: number;
  published_at: string;
  created_at: string;
  verified_by?: string;
  verification_notes?: string;
  views_count?: number;
}

export interface NotificationRecord {
  id: string;
  notice_id: string;
  title: string;
  message: string;
  urgency: UrgencyLevel;
  channel: 'PUSH' | 'WEB' | 'EMAIL' | 'SMS';
  target_locations: string[];
  recipient_count: number;
  delivery_status: 'DELIVERED' | 'SENT' | 'FAILED';
  sent_at: string;
}

export interface CitizenFeedback {
  id: string;
  notice_id: string;
  feedback_type: 'REPORT_INCORRECT' | 'CLARIFICATION' | 'SUMMARY_RATING';
  comments: string;
  rating?: number;
  user_email?: string;
  created_at: string;
}

export interface DashboardStats {
  total_collected: number;
  total_verified: number;
  pending_review: number;
  approved?: number;
  published_notices: number;
  rejected?: number;
  critical_alerts: number;
  high_priority: number;
  upcoming_deadlines: number;
  total_notifications_sent: number;
  delivery_success_rate: number;
  category_distribution: { name: string; count: number }[];
  urgency_distribution: { name: string; count: number }[];
  location_distribution: { name: string; count: number }[];
  recent_activity: Array<{ id: string; action: string; time: string; target: string }>;
}

