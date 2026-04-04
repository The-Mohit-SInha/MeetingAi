import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface LiveMeeting {
  id: string;
  title: string;
  startedAt: Date;
  status: 'capturing' | 'paused';
}

interface LiveMeetingContextType {
  liveMeeting: LiveMeeting | null;
  elapsedSeconds: number;
  showPanel: boolean;
  setShowPanel: (v: boolean) => void;
  startLiveMeeting: (meeting: { id: string; title: string }) => void;
  stopLiveMeeting: () => void;
}

const LiveMeetingContext = createContext<LiveMeetingContextType>({
  liveMeeting: null,
  elapsedSeconds: 0,
  showPanel: false,
  setShowPanel: () => {},
  startLiveMeeting: () => {},
  stopLiveMeeting: () => {},
});

export function LiveMeetingProvider({ children }: { children: ReactNode }) {
  const [liveMeeting, setLiveMeeting] = useState<LiveMeeting | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!liveMeeting) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - liveMeeting.startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [liveMeeting]);

  const startLiveMeeting = useCallback((meeting: { id: string; title: string }) => {
    setLiveMeeting({ ...meeting, startedAt: new Date(), status: 'capturing' });
    setElapsedSeconds(0);
  }, []);

  const stopLiveMeeting = useCallback(() => {
    setLiveMeeting(null);
    setElapsedSeconds(0);
    setShowPanel(false);
  }, []);

  return (
    <LiveMeetingContext.Provider value={{ liveMeeting, elapsedSeconds, showPanel, setShowPanel, startLiveMeeting, stopLiveMeeting }}>
      {children}
    </LiveMeetingContext.Provider>
  );
}

export function useLiveMeeting() {
  return useContext(LiveMeetingContext);
}
