import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'openid', 'email', 'profile'
].join(' ');

// ==================== OAUTH ====================

export const googleMeetOAuth = {
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/google-meet/callback`,
      response_type: 'code',
      scope: GOOGLE_SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state: crypto.randomUUID(),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  },

  async exchangeCode(code: string, userId: string): Promise<void> {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-af44c8dd/google-meet-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        code,
        redirect_uri: `${window.location.origin}/auth/google-meet/callback`,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to exchange OAuth code');
    }
    
    const data = await response.json();
    
    await supabase.from('user_settings').update({
      google_meet_connected: true,
      google_meet_email: data.email,
      google_meet_access_token: data.access_token,
      google_meet_refresh_token: data.refresh_token,
    }).eq('user_id', userId);
  },

  async disconnect(userId: string): Promise<void> {
    await supabase.from('user_settings').update({
      google_meet_connected: false,
      google_meet_email: null,
      google_meet_access_token: null,
      google_meet_refresh_token: null,
    }).eq('user_id', userId);
  },

  async getConnectionStatus(userId: string) {
    const { data } = await supabase.from('user_settings')
      .select('google_meet_connected, google_meet_email, google_meet_auto_join, google_meet_capture_video, google_meet_capture_chat')
      .eq('user_id', userId).maybeSingle();
    return data;
  },

  async updatePreferences(userId: string, prefs: { auto_join?: boolean; capture_video?: boolean; capture_chat?: boolean }) {
    const update: any = {};
    if (prefs.auto_join !== undefined) update.google_meet_auto_join = prefs.auto_join;
    if (prefs.capture_video !== undefined) update.google_meet_capture_video = prefs.capture_video;
    if (prefs.capture_chat !== undefined) update.google_meet_capture_chat = prefs.capture_chat;
    await supabase.from('user_settings').update(update).eq('user_id', userId);
  },
};

// ==================== LIVE MEETING ====================

export const liveMeetingService = {
  async getActive(userId: string) {
    const { data } = await supabase.from('live_meetings')
      .select('*, meetings(title)')
      .eq('user_id', userId)
      .eq('capture_active', true)
      .order('started_at', { ascending: false })
      .limit(1).maybeSingle();
    return data;
  },

  async subscribeToLive(userId: string, onUpdate: (payload: any) => void) {
    return supabase.channel(`live-meeting-${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'live_meetings',
        filter: `user_id=eq.${userId}`
      }, onUpdate)
      .subscribe();
  },

  async startCapture(meetingId: string, googleMeetId: string, userId: string) {
    const { data, error } = await supabase.from('live_meetings').insert({
      meeting_id: meetingId, user_id: userId,
      google_meet_id: googleMeetId, bot_joined: false, capture_active: true,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async stopCapture(meetingId: string, userId: string) {
    await supabase.from('live_meetings')
      .update({ capture_active: false }).eq('meeting_id', meetingId).eq('user_id', userId);
    await supabase.from('meetings').update({
      status: 'completed', ai_processing_status: 'queued'
    }).eq('id', meetingId).eq('user_id', userId);
  },
};

// ==================== AI PROCESSING ====================

export const aiProcessingService = {
  async getJobStatus(meetingId: string) {
    const { data } = await supabase.from('ai_processing_jobs')
      .select('*').eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async subscribeToJob(meetingId: string, onUpdate: (payload: any) => void) {
    return supabase.channel(`ai-job-${meetingId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'ai_processing_jobs',
        filter: `meeting_id=eq.${meetingId}`
      }, onUpdate)
      .subscribe();
  },

  async subscribeMeetingUpdates(meetingId: string, onUpdate: (payload: any) => void) {
    return supabase.channel(`meeting-update-${meetingId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'meetings',
        filter: `id=eq.${meetingId}`
      }, onUpdate)
      .subscribe();
  },

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      none: 'Not processed', queued: 'Queued for AI',
      capturing: 'Capturing live', transcribing: 'Transcribing audio',
      analyzing: 'Claude analyzing', complete: 'AI complete', failed: 'Processing failed',
    };
    return labels[status] || status;
  },

  getStatusColor(status: string): string {
    if (status === 'complete') return 'text-green-600 bg-green-50';
    if (status === 'failed') return 'text-red-600 bg-red-50';
    if (status === 'none') return 'text-gray-500 bg-gray-50';
    return 'text-amber-600 bg-amber-50';
  },
};