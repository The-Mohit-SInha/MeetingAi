import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;

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
        `${SUPABASE_URL}/functions/v1/make-server-af44c8dd/ai/analyze-meeting`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
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
