import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qjrmxudyrwcqwpkmrggn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcm14dWR5cndjcXdwa21yZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNDgsImV4cCI6MjA5MDcyMjI0OH0.tAje6kf-PRqDqKqM_KhNJs2wDCd-I28jUQKG28Y7bec';

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key' &&
    supabaseAnonKey.length > 20
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
  },
  global: {
    headers: {
      'x-client-info': 'figma-make-app',
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string | null;
          department: string | null;
          avatar: string | null;
          location: string | null;
          bio: string | null;
          join_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      meetings: {
        Row: {
          id: string;
          title: string;
          date: string;
          time: string;
          duration: string;
          status: 'completed' | 'in-progress' | 'scheduled';
          summary: string | null;
          transcript: string | null;
          location: string | null;
          recording_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
          google_meet_id: string | null;
          google_meet_url: string | null;
          ai_processed: boolean;
          ai_processing_status: string;
          video_insights: any;
          key_decisions: any;
          meeting_highlights: any;
          sentiment: string;
        };
        Insert: Omit<Database['public']['Tables']['meetings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['meetings']['Insert']>;
      };
      meeting_participants: {
        Row: {
          id: string;
          meeting_id: string;
          participant_name: string;
          participant_email: string | null;
          role: string | null;
          created_at: string;
          speaking_time_seconds: number;
          word_count: number;
          sentiment: string;
          contribution_score: number;
          tasks_assigned: number;
          joined_at: string | null;
          left_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['meeting_participants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['meeting_participants']['Insert']>;
      };
      action_items: {
        Row: {
          id: string;
          meeting_id: string | null;
          title: string;
          description: string | null;
          assignee: string;
          due_date: string;
          priority: 'high' | 'medium' | 'low';
          status: 'completed' | 'in_progress' | 'todo';
          progress: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['action_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['action_items']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'action' | 'meeting' | 'mention' | 'alert' | 'info';
          title: string;
          message: string;
          is_read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: 'light' | 'dark';
          compact_mode: boolean;
          email_notifications: boolean;
          push_notifications: boolean;
          slack_notifications: boolean;
          slack_webhook: string | null;
          calendar_sync: boolean;
          google_calendar_connected: boolean;
          outlook_calendar_connected: boolean;
          updated_at: string;
          google_meet_connected: boolean;
          google_meet_email: string | null;
          google_meet_access_token: string | null;
          google_meet_refresh_token: string | null;
          google_meet_auto_join: boolean;
          google_meet_capture_video: boolean;
          google_meet_capture_chat: boolean;
        };
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
    };
  };
}

// New table types
export interface LiveMeeting {
  id: string;
  meeting_id: string;
  user_id: string;
  google_meet_id: string;
  started_at: string;
  bot_joined: boolean;
  capture_active: boolean;
  current_speaker: string | null;
  live_transcript_chunk: string | null;
  updated_at: string;
}

export interface AIProcessingJob {
  id: string;
  meeting_id: string;
  user_id: string;
  job_type: 'transcribe' | 'analyze' | 'extract_actions' | 'participant_stats' | 'full_pipeline';
  status: 'queued' | 'running' | 'complete' | 'failed';
  input_data: any;
  output_data: any;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}