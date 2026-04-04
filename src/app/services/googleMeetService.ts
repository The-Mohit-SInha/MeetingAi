import { supabase } from '../../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qjrmxudyrwcqwpkmrggn.supabase.co';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'openid',
  'email',
  'profile'
].join(' ');

// ==================== OAUTH ====================

export const googleMeetOAuth = {
  /**
   * Get Google OAuth authorization URL
   */
  getAuthUrl(): string {
    const redirectUri = `${window.location.origin}/auth/google-meet/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: GOOGLE_SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state: crypto.randomUUID(),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  },

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCode(code: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUri = `${window.location.origin}/auth/google-meet/callback`;
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/google-meet-server/oauth/google-meet/exchange`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirect_uri: redirectUri,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to exchange code' };
      }

      const data = await response.json();
      
      if (!data.success) {
        return { success: false, error: data.error || 'OAuth exchange failed' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Exchange code error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Refresh Google OAuth access token
   */
  async refreshAccessToken(
    refreshToken: string,
    userId: string
  ): Promise<{ success: boolean; access_token?: string; error?: string }> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/google-meet-server/oauth/google-meet/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to refresh token' };
      }

      const data = await response.json();
      
      if (!data.success) {
        return { success: false, error: data.error || 'Token refresh failed' };
      }

      return { success: true, access_token: data.access_token };
    } catch (error: any) {
      console.error('Refresh token error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Disconnect Google Meet integration
   */
  async disconnect(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/google-meet-server/oauth/google-meet/disconnect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to disconnect' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Disconnect error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Get Google Meet connection status for a user
   */
  async getConnectionStatus(userId: string) {
    const { data } = await supabase
      .from('user_settings')
      .select('google_meet_connected, google_meet_email, google_meet_access_token, google_meet_refresh_token, google_meet_auto_join, google_meet_capture_video, google_meet_capture_chat')
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  },

  /**
   * Update Google Meet preferences
   */
  async updatePreferences(
    userId: string,
    prefs: { auto_join?: boolean; capture_video?: boolean; capture_chat?: boolean }
  ) {
    const update: any = {};
    if (prefs.auto_join !== undefined) update.google_meet_auto_join = prefs.auto_join;
    if (prefs.capture_video !== undefined) update.google_meet_capture_video = prefs.capture_video;
    if (prefs.capture_chat !== undefined) update.google_meet_capture_chat = prefs.capture_chat;
    
    await supabase.from('user_settings').update(update).eq('user_id', userId);
  },

  /**
   * Fetch Google Calendar events (meetings with Meet links)
   */
  async fetchCalendarEvents(
    accessToken: string,
    options: { timeMin?: string; timeMax?: string; maxResults?: number }
  ): Promise<{ success: boolean; events?: any[]; error?: string }> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/google-meet-server/calendar/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: accessToken,
            timeMin: options.timeMin,
            timeMax: options.timeMax,
            maxResults: options.maxResults || 50,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to fetch events' };
      }

      const data = await response.json();
      
      if (!data.success) {
        return { success: false, error: data.error || 'Failed to fetch events' };
      }

      return { success: true, events: data.events || [] };
    } catch (error: any) {
      console.error('Fetch calendar events error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Import a Google Calendar event as a meeting
   */
  async importMeetingFromGoogleCalendar(
    event: any,
    userId: string
  ): Promise<{ success: boolean; meeting_id?: string; error?: string }> {
    try {
      // Extract meeting details from Google Calendar event
      const title = event.summary || 'Untitled Meeting';
      const startDate = event.start?.dateTime || event.start?.date;
      const endDate = event.end?.dateTime || event.end?.date;
      
      if (!startDate) {
        return { success: false, error: 'Invalid event: missing start time' };
      }

      const startDateTime = new Date(startDate);
      const endDateTime = endDate ? new Date(endDate) : new Date(startDateTime.getTime() + 60 * 60 * 1000);
      const durationMs = endDateTime.getTime() - startDateTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);

      // Determine meeting status based on date
      const now = new Date();
      let status: 'completed' | 'in-progress' | 'scheduled';
      if (endDateTime < now) {
        status = 'completed';
      } else if (startDateTime <= now && endDateTime >= now) {
        status = 'in-progress';
      } else {
        status = 'scheduled';
      }

      // Create meeting in database
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title,
          date: startDateTime.toISOString().split('T')[0],
          time: startDateTime.toTimeString().slice(0, 5),
          duration: `${durationMinutes} min`,
          status,
          google_meet_id: event.id,
          google_meet_url: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri,
          location: event.location || 'Google Meet',
          user_id: userId,
          ai_processed: false,
          ai_processing_status: 'none',
          sentiment: 'neutral',
        })
        .select()
        .single();

      if (meetingError) {
        console.error('Meeting creation error:', meetingError);
        return { success: false, error: meetingError.message };
      }

      // Add participants if available
      if (event.attendees && event.attendees.length > 0 && meeting) {
        const participants = event.attendees.map((attendee: any) => ({
          meeting_id: meeting.id,
          participant_name: attendee.displayName || attendee.email?.split('@')[0] || 'Unknown',
          participant_email: attendee.email,
          role: attendee.organizer ? 'Organizer' : 'Participant',
          speaking_time_seconds: 0,
          word_count: 0,
          sentiment: 'neutral',
          contribution_score: 0,
          tasks_assigned: 0,
        }));

        await supabase.from('meeting_participants').insert(participants);
      }

      return { success: true, meeting_id: meeting?.id };
    } catch (error: any) {
      console.error('Import meeting error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },
};

// ==================== LIVE MEETING ====================

export const liveMeetingService = {
  /**
   * Get active live meeting for a user
   */
  async getActive(userId: string) {
    const { data } = await supabase
      .from('live_meetings')
      .select('*, meetings(title)')
      .eq('user_id', userId)
      .eq('capture_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  },

  /**
   * Subscribe to live meeting updates
   */
  async subscribeToLive(userId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`live-meeting-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_meetings',
          filter: `user_id=eq.${userId}`,
        },
        onUpdate
      )
      .subscribe();
  },

  /**
   * Start capturing a live meeting
   */
  async startCapture(meetingId: string, googleMeetId: string, userId: string) {
    const { data, error } = await supabase
      .from('live_meetings')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        google_meet_id: googleMeetId,
        bot_joined: false,
        capture_active: true,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Stop capturing a live meeting
   */
  async stopCapture(meetingId: string, userId: string) {
    await supabase
      .from('live_meetings')
      .update({ capture_active: false })
      .eq('meeting_id', meetingId)
      .eq('user_id', userId);
    
    await supabase
      .from('meetings')
      .update({
        status: 'completed',
        ai_processing_status: 'queued',
      })
      .eq('id', meetingId)
      .eq('user_id', userId);
  },
};

// ==================== AI PROCESSING ====================

export const aiProcessingService = {
  /**
   * Get AI processing job status for a meeting
   */
  async getJobStatus(meetingId: string) {
    const { data } = await supabase
      .from('ai_processing_jobs')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  /**
   * Subscribe to AI processing job updates
   */
  async subscribeToJob(meetingId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`ai-job-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_processing_jobs',
          filter: `meeting_id=eq.${meetingId}`,
        },
        onUpdate
      )
      .subscribe();
  },

  /**
   * Subscribe to meeting updates
   */
  async subscribeMeetingUpdates(meetingId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`meeting-update-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meetingId}`,
        },
        onUpdate
      )
      .subscribe();
  },

  /**
   * Trigger AI analysis for a meeting
   */
  async triggerAnalysis(
    meetingId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/google-meet-server/ai/analyze-meeting`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meeting_id: meetingId,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to trigger analysis' };
      }

      const data = await response.json();
      return { success: data.success, error: data.error };
    } catch (error: any) {
      console.error('Trigger analysis error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  /**
   * Get human-readable status label
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      none: 'Not processed',
      queued: 'Queued for AI',
      capturing: 'Capturing live',
      transcribing: 'Transcribing audio',
      analyzing: 'Claude analyzing',
      complete: 'AI complete',
      failed: 'Processing failed',
    };
    return labels[status] || status;
  },

  /**
   * Get color class for status
   */
  getStatusColor(status: string): string {
    if (status === 'complete') return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    if (status === 'failed') return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
    if (status === 'none') return 'text-gray-500 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
  },
};
