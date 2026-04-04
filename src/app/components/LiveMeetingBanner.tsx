import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, ChevronDown, Mic, Video, MessageSquare, StopCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { liveMeetingService } from '../services/googleMeetService';

export function LiveMeetingBanner() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [liveMeeting, setLiveMeeting] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!user) return;
    let channel: any;

    liveMeetingService.getActive(user.id).then(setLiveMeeting);
    liveMeetingService.subscribeToLive(user.id, (payload) => {
      if (payload.eventType === 'DELETE' || !payload.new?.capture_active) setLiveMeeting(null);
      else setLiveMeeting(payload.new);
    }).then(ch => { channel = ch; });

    return () => { channel?.unsubscribe(); };
  }, [user]);

  useEffect(() => {
    if (!liveMeeting) { setElapsed(0); return; }
    const start = new Date(liveMeeting.started_at).getTime();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [liveMeeting]);

  const formatElapsed = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!liveMeeting) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        className="relative">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"/>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"/>
          </span>
          Live · {formatElapsed(elapsed)}
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}/>
        </motion.button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute top-10 left-0 z-50 w-72 rounded-2xl p-4 shadow-2xl"
              style={{ background: theme === 'dark' ? 'rgba(30,30,46,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <p className={`font-bold text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {liveMeeting.meetings?.title || 'Meeting in progress'}
              </p>
              <p className="text-xs text-gray-500 mb-3">Duration: {formatElapsed(elapsed)}</p>
              <div className="space-y-2 mb-4">
                {[
                  { icon: Mic, label: 'Audio capture', active: true },
                  { icon: Video, label: 'Video capture', active: liveMeeting.capture_active },
                  { icon: MessageSquare, label: 'Chat capture', active: true },
                ].map(({ icon: Icon, label, active }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-green-500' : 'text-gray-400'}`}/>
                    <span className={active ? (theme === 'dark' ? 'text-gray-200' : 'text-gray-700') : 'text-gray-400'}>{label}</span>
                    <span className={`ml-auto text-xs font-medium ${active ? 'text-green-600' : 'text-gray-400'}`}>{active ? 'Active' : 'Off'}</span>
                  </div>
                ))}
              </div>
              {liveMeeting.current_speaker && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 mb-3">
                  <div className="flex gap-0.5 items-end h-4">
                    {[3,5,4,6,3].map((h, i) => (
                      <motion.div key={i} animate={{ height: [h, h*1.5, h] }} transition={{ repeat: Infinity, duration: 0.5, delay: i*0.1 }}
                        className="w-1 bg-purple-500 rounded-full" style={{ height: h*2 }}/>
                    ))}
                  </div>
                  <span className="text-xs text-purple-700 font-medium">Speaking: {liveMeeting.current_speaker}</span>
                </div>
              )}
              <button onClick={() => { if(user) liveMeetingService.stopCapture(liveMeeting.meeting_id, user.id); setExpanded(false); }}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <StopCircle className="w-3.5 h-3.5"/> Stop capture & run AI
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
