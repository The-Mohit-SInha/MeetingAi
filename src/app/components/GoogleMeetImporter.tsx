import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Loader2, CheckCircle, AlertCircle, Video, Clock, Users, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { googleMeetOAuth } from '../services/googleMeetService';

export function GoogleMeetImporter() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [importing, setImporting] = useState<Record<string, boolean>>({});
  const [imported, setImported] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchGoogleMeetings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get user's Google Meet connection status
      const status = await googleMeetOAuth.getConnectionStatus(user.id);
      
      if (!status?.google_meet_connected || !status.google_meet_access_token) {
        setError('Please connect your Google Meet account in Settings first');
        return;
      }

      // Fetch calendar events
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const result = await googleMeetOAuth.fetchCalendarEvents(
        status.google_meet_access_token,
        {
          timeMin: oneMonthAgo.toISOString(),
          timeMax: oneMonthFromNow.toISOString(),
          maxResults: 50,
        }
      );

      if (!result.success) {
        // Try refreshing token if fetch failed
        if (status.google_meet_refresh_token) {
          const refreshResult = await googleMeetOAuth.refreshAccessToken(
            status.google_meet_refresh_token,
            user.id
          );
          
          if (refreshResult.success && refreshResult.access_token) {
            // Retry with new token
            const retryResult = await googleMeetOAuth.fetchCalendarEvents(
              refreshResult.access_token,
              {
                timeMin: oneMonthAgo.toISOString(),
                timeMax: oneMonthFromNow.toISOString(),
                maxResults: 50,
              }
            );
            
            if (retryResult.success) {
              setEvents(retryResult.events || []);
              return;
            }
          }
        }
        
        setError(result.error || 'Failed to fetch meetings');
        return;
      }

      setEvents(result.events || []);
    } catch (error: any) {
      console.error('Fetch meetings error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const importMeeting = async (event: any) => {
    if (!user) return;
    
    try {
      setImporting(prev => ({ ...prev, [event.id]: true }));
      
      const result = await googleMeetOAuth.importMeetingFromGoogleCalendar(event, user.id);
      
      if (!result.success) {
        console.error('Import failed:', result.error);
        return;
      }
      
      setImported(prev => ({ ...prev, [event.id]: true }));
    } catch (error: any) {
      console.error('Import error:', error);
    } finally {
      setImporting(prev => ({ ...prev, [event.id]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(durationMs / 60000);
    return `${minutes} min`;
  };

  useEffect(() => {
    fetchGoogleMeetings();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Import from Google Meet
        </h2>
        <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Import your recent Google Meet meetings and analyze them with AI
        </p>
      </div>

      {/* Refresh Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={fetchGoogleMeetings}
        disabled={loading}
        className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading meetings...
          </>
        ) : (
          <>
            <Calendar className="w-5 h-5" />
            Refresh Meetings
          </>
        )}
      </motion.button>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Meetings List */}
      {events.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            No Google Meet meetings found
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            Meetings from the past and next 30 days will appear here
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-5 rounded-xl border ${
              imported[event.id]
                ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                : theme === 'dark'
                ? 'border-gray-700 bg-gray-800/60'
                : 'border-gray-200 bg-white/80'
            } backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {event.summary || 'Untitled Meeting'}
                    </h3>
                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(event.start?.dateTime || event.start?.date)}
                      </span>
                      {event.start?.dateTime && event.end?.dateTime && (
                        <span className="flex items-center gap-1">
                          {getDuration(event.start.dateTime, event.end.dateTime)}
                        </span>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.attendees.length} participants
                        </span>
                      )}
                    </div>
                    {event.hangoutLink && (
                      <a
                        href={event.hangoutLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block"
                      >
                        {event.hangoutLink}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {imported[event.id] ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Imported</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => importMeeting(event)}
                    disabled={importing[event.id]}
                    className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 ${
                      importing[event.id] ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
                    }`}
                  >
                    {importing[event.id] ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Import
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
