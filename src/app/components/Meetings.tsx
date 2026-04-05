import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Video,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckSquare,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Loader2,
  ChevronDown,
  Download,
  CheckCircle2,
  Mic,
  Square,
  Monitor
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLiveMeeting } from "../context/LiveMeetingContext";
import { meetingsAPI, actionItemsAPI } from "../services/apiWrapper";
import { recordingsAPI, participantsAPI } from "../services/apiWrapper";
import { aiProcessingService } from "../services/googleMeetService";
import { supabase } from "../../lib/supabase";
import { transcribeAudioBlob } from "../services/localTranscriptionService";
import { transcribeWithGroq, isGroqConfigured } from "../services/groqTranscriptionService";
import { transcribeWithGroqDirect, convertToAudioBlob } from "../services/groqDirectService";
import { generateMeetingSummary, generateMeetingTitle } from "../services/groqLLMService";
import { transcribeWithSpeakerDiarization, saveParticipantsToMeeting, formatTranscriptWithSpeakers, extractActionItemsFromTranscript } from "../services/speakerDiarizationService";
import { RecordingDiagnostic } from "./RecordingDiagnostic";
import { AudioLevelIndicator } from "./AudioLevelIndicator";

export function Meetings() {
  const { theme, compactMode } = useTheme();
  const { user } = useAuth();
  const { startLiveMeeting } = useLiveMeeting();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    thisWeek: 0,
    totalHours: 0,
    participants: 0,
  });
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    duration: "30",
    participants: "",
    tags: "",
  });

  // Tab Recording States
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingStep, setRecordingStep] = useState<'select' | 'recording' | 'processing'>('select');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [processingRecording, setProcessingRecording] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<'tab' | 'microphone'>('tab');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [groqConfigured, setGroqConfigured] = useState(false);
  const [displayCaptureAllowed, setDisplayCaptureAllowed] = useState(true);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<any>(null);

  // Parallel recording states (mic + tab simultaneously)
  const [micMediaStream, setMicMediaStream] = useState<MediaStream | null>(null);
  const [micMediaRecorder, setMicMediaRecorder] = useState<MediaRecorder | null>(null);
  const [micAudioChunks, setMicAudioChunks] = useState<Blob[]>([]);
  const [tabMediaStream, setTabMediaStream] = useState<MediaStream | null>(null);
  const [tabMediaRecorder, setTabMediaRecorder] = useState<MediaRecorder | null>(null);
  const [tabAudioChunks, setTabAudioChunks] = useState<Blob[]>([]);

  // Ref to accumulate transcript in real-time (avoids stale closure issues)
  const transcriptRef = useRef('');
  const speechRecRef = useRef<any>(null);


  useEffect(() => {
    if (user) {
      fetchMeetings();
      // Check if Groq is configured
      isGroqConfigured().then(setGroqConfigured);

      // Check if display capture is allowed in this environment
      checkDisplayCapturePermission();
    }
  }, [user]);

  const checkDisplayCapturePermission = async () => {
    try {
      // Try to check if getDisplayMedia is available and not blocked
      if (!navigator.mediaDevices?.getDisplayMedia) {
        setDisplayCaptureAllowed(false);
        return;
      }

      // Check permissions policy
      const permissionStatus = (document as any).featurePolicy?.allowsFeature?.('display-capture');
      if (permissionStatus === false) {
        setDisplayCaptureAllowed(false);
      }
    } catch (error) {
      console.warn('Could not check display capture permission:', error);
    }
  };

  // Real-time subscription: auto-refresh meetings list when any meeting row changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('meetings-list-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('📡 Real-time meeting update:', payload.eventType, payload.new?.ai_processing_status);
          // Re-fetch the full list to keep everything in sync
          fetchMeetings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchMeetings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Meetings data fetch timeout - using default values');
        setLoading(false);
      }, 5000);

      const data = await meetingsAPI.getAll(user.id);

      // Map meetings with default participant/action fields
      const meetingsWithDefaults = data.map((meeting: any) => ({
        ...meeting,
        participants: (meeting.participants || []).map((p: any) => ({
          name: p.participant_name || p.name || 'Unknown',
          avatar: (p.participant_name || p.name || '?').split(' ').map((n: string) => n[0]).join(''),
          color: `bg-${['blue', 'green', 'purple', 'orange', 'pink'][Math.floor(Math.random() * 5)]}-500`,
        })),
        actions: 0,
        completed: 0,
        tags: meeting.tags || [],
      }));

      setMeetings(meetingsWithDefaults);

      // Calculate stats from actual data
      const totalMeetings = meetingsWithDefaults.length;
      const uniqueParticipants = new Set();
      let totalMinutes = 0;
      let thisWeekCount = 0;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      meetingsWithDefaults.forEach((meeting: any) => {
        // Count participants
        meeting.participants.forEach((p: any) => uniqueParticipants.add(p.name));

        // Calculate total hours
        const durationMatch = meeting.duration?.match(/(\d+)/);
        if (durationMatch) {
          totalMinutes += parseInt(durationMatch[1]);
        }

        // Count this week's meetings
        const meetingDate = new Date(meeting.date);
        if (meetingDate >= oneWeekAgo && meetingDate <= now) {
          thisWeekCount++;
        }
      });

      setStats({
        totalMeetings,
        thisWeek: thisWeekCount,
        totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
        participants: uniqueParticipants.size,
      });

      clearTimeout(timeoutId);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setMeetings([]);
      setStats({ totalMeetings: 0, thisWeek: 0, totalHours: 0, participants: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meeting: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMeetingToDelete(meeting);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete || !user) return;

    try {
      setDeletingMeetingId(meetingToDelete.id);
      await meetingsAPI.delete(meetingToDelete.id, user.id);
      await fetchMeetings();
      setShowDeleteConfirm(false);
      setMeetingToDelete(null);
    } catch (error) {
      console.error("Error deleting meeting:", error);
    } finally {
      setDeletingMeetingId(null);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      await meetingsAPI.create({
        title: newMeeting.title,
        date: newMeeting.date,
        time: newMeeting.time,
        duration: `${newMeeting.duration} min`,
        status: 'scheduled',
        summary: null,
        transcript: null,
        location: null,
        recording_url: null,
        user_id: user?.id,
      }, newMeeting.participants ? newMeeting.participants.split(',').map(p => p.trim()).filter(p => p) : []);

      setShowNewMeetingModal(false);
      setNewMeeting({
        title: "",
        date: "",
        time: "",
        duration: "30",
        participants: "",
        tags: "",
      });

      fetchMeetings();
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  // Timer effect for recording
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper: create and start a SpeechRecognition instance that accumulates
  // into transcriptRef and syncs to React state on every result.
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('⚠️ Web Speech API not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Track whether we intentionally stopped (vs auto-restart on silence)
    let stopped = false;

    recognition.onresult = (event: any) => {
      // Rebuild the full transcript from all results in this session
      let sessionFinal = '';
      let sessionInterim = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          sessionFinal += result[0].transcript + ' ';
        } else {
          sessionInterim += result[0].transcript;
        }
      }

      // The ref holds everything from PREVIOUS recognition sessions.
      // We only commit sessionFinal to the ref when the session ends (onend).
      // For display, we show: committed ref text + current session final + interim.
      const committed = (recognition as any)._committedText || '';
      const display = committed + sessionFinal + sessionInterim;
      setTranscript(display);

      // Stash current session's final text so onend can commit it
      (recognition as any)._sessionFinal = sessionFinal;
    };

    recognition.onerror = (event: any) => {
      const ignorable = ['no-speech', 'aborted'];
      if (!ignorable.includes(event.error)) {
        console.warn('⚠️ Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      // Commit this session's finalized text into the ref
      const sessionFinal = (recognition as any)._sessionFinal || '';
      const committed = ((recognition as any)._committedText || '') + sessionFinal;
      (recognition as any)._committedText = committed;
      transcriptRef.current = committed.trim();

      // Auto-restart if not intentionally stopped
      if (!stopped) {
        try {
          console.log('🔄 Restarting speech recognition...');
          recognition.start();
        } catch (e) {
          console.warn('⚠️ Could not restart speech recognition:', e);
        }
      }
    };

    // Expose a clean stop method
    const originalStop = recognition.stop.bind(recognition);
    recognition.stop = () => {
      stopped = true;
      // Commit whatever we have right now
      const sessionFinal = (recognition as any)._sessionFinal || '';
      const committed = ((recognition as any)._committedText || '') + sessionFinal;
      transcriptRef.current = committed.trim();
      originalStop();
    };

    // Initialize tracking
    (recognition as any)._committedText = '';
    (recognition as any)._sessionFinal = '';

    recognition.start();
    return recognition;
  }, []);

  const startTabRecording = async () => {
    try {
      setTranscript('');
      transcriptRef.current = '';
      setAudioChunks([]);
      setRecordedAudioBlob(null);
      setMicAudioChunks([]);
      setTabAudioChunks([]);

      // ══════════════════════════════════════════════════════════════════════
      // PARALLEL RECORDING: Record both microphone and tab audio simultaneously
      // ══════════════════════════════════════════════════════════════════════

      console.log('🎙️🖥️ Starting parallel recording (microphone + tab audio)...');

      // ── Step 1: Start microphone recording ──
      console.log('🎙️ [1/2] Starting microphone capture...');
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicMediaStream(micStream);

      const micRecorder = new MediaRecorder(micStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus' : 'audio/webm',
      });
      const micChunks: Blob[] = [];
      micRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          micChunks.push(e.data);
          setMicAudioChunks(prev => [...prev, e.data]);
          console.log(`🎙️ Mic chunk: ${(e.data.size / 1024).toFixed(2)} KB`);
        }
      };
      micRecorder.onstop = () => {
        console.log('🎙️ Microphone recording stopped. Total chunks:', micChunks.length);
      };
      micRecorder.start(1000); // Record in 1-second chunks
      setMicMediaRecorder(micRecorder);
      console.log('✅ Microphone recording started');

      // Start live transcription for microphone (user's own speech)
      const recognition = startSpeechRecognition();
      if (recognition) {
        setSpeechRecognition(recognition);
        speechRecRef.current = recognition;
        console.log('✅ Web Speech API started for microphone');
      }

      // ── Step 2: Start tab audio recording ──
      console.log('🖥️ [2/2] Starting tab audio capture via getDisplayMedia...');
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      } as any);

      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        // Clean up microphone if tab capture fails
        micRecorder.stop();
        micStream.getTracks().forEach(t => t.stop());
        displayStream.getTracks().forEach(t => t.stop());
        throw new Error('No audio track captured. Make sure to check "Share tab audio" in the sharing dialog.');
      }
      console.log('✅ Got tab audio tracks:', audioTracks.length);

      // Debug audio track settings
      audioTracks.forEach((track, i) => {
        console.log(`🎵 Audio track ${i}:`, {
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings: track.getSettings(),
        });
      });

      setTabMediaStream(displayStream);

      // Auto-stop when user clicks "Stop sharing" in the browser bar
      displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        console.log('🛑 User stopped sharing via browser UI');
        stopTabRecording();
      });

      // Record tab audio (video+audio for Chrome compatibility)
      const audioOnlyStream = new MediaStream(audioTracks);

      // Create AudioContext to monitor audio levels
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audioOnlyStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silentChunks = 0;
      let totalChunks = 0;

      // Monitor audio levels every 500ms
      const audioMonitor = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        totalChunks++;

        if (average < 5) {
          silentChunks++;
        }

        console.log(`🔊 Tab audio level: ${Math.round(average)}/255 ${average < 5 ? '❌ SILENT!' : '✅ ACTIVE'}`);

        if (totalChunks >= 3 && silentChunks === totalChunks) {
          console.warn('⚠️ WARNING: No tab audio detected after 3 checks!');
        }
      }, 500);

      // Record from FULL displayStream (must include video track for audio to work)
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      console.log('🎥 Recording tab from full stream (video+audio) to preserve audio data');
      console.log('📝 Note: File will contain video, but Whisper AI will extract only audio');

      const tabRecorder = new MediaRecorder(displayStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 100000,
        audioBitsPerSecond: 128000,
      });

      console.log('🎙️ Tab MediaRecorder config:', {
        mimeType: tabRecorder.mimeType,
        state: tabRecorder.state,
      });

      const tabChunks: Blob[] = [];
      let dataEventCount = 0;

      tabRecorder.ondataavailable = (e) => {
        dataEventCount++;
        console.log(`📦 Tab data available #${dataEventCount}:`, {
          size: `${(e.data.size / 1024).toFixed(2)} KB`,
          type: e.data.type,
        });

        if (e.data.size > 0) {
          tabChunks.push(e.data);
          setTabAudioChunks(prev => [...prev, e.data]);
        } else {
          console.warn('⚠️ Empty tab data chunk received!');
        }
      };

      tabRecorder.onstop = () => {
        clearInterval(audioMonitor);
        audioContext.close();
        console.log('🎬 Tab recording stopped. Total chunks:', tabChunks.length);
      };

      tabRecorder.start(1000);
      setTabMediaRecorder(tabRecorder);

      console.log('✅ Parallel recording active: microphone + tab audio');
      console.log('📼 Both streams recording simultaneously (kept separate)');

      setIsRecording(true);
      setRecordingTime(0);
      setRecordingStep('recording');

    } catch (error: any) {
      console.error('❌ Error starting recording:', error);
      let msg = 'Failed to start recording.\n\n';
      if (error.name === 'NotAllowedError') {
        msg += selectedSource === 'tab'
          ? 'You cancelled the tab selection or denied permission.'
          : 'Microphone permission was denied.';
      } else { msg += error.message || 'Unknown error'; }
      alert(msg);
    }
  };

  const stopTabRecording = async () => {
    try {
      console.log('🛑 Stopping parallel recording...');
      setIsRecording(false);
      setRecordingStep('processing');
      setProcessingRecording(true);

      // Stop speech recognition (only active in mic mode)
      const recog = speechRecRef.current || speechRecognition;
      if (recog) { recog.stop(); setSpeechRecognition(null); speechRecRef.current = null; }

      // Stop both recorders
      if (micMediaRecorder && micMediaRecorder.state !== 'inactive') {
        console.log('🛑 Stopping microphone recorder...');
        micMediaRecorder.stop();
      }
      if (tabMediaRecorder && tabMediaRecorder.state !== 'inactive') {
        console.log('🛑 Stopping tab recorder...');
        tabMediaRecorder.stop();
      }

      // Stop all tracks
      if (micMediaStream) { micMediaStream.getTracks().forEach(t => t.stop()); setMicMediaStream(null); }
      if (tabMediaStream) { tabMediaStream.getTracks().forEach(t => t.stop()); setTabMediaStream(null); }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') { mediaRecorder.stop(); }
      if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); setMediaStream(null); }

      // Small delay for final state updates
      await new Promise(r => setTimeout(r, 300));

      const now = new Date();
      const title = recordingTitle || `Meeting Recording - ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

      // ══════════════════════════════════════════════════════════════════════
      // Process both audio streams separately
      // ══════════════════════════════════════════════════════════════════════

      let micTranscript = '';
      let tabTranscript = '';

      // Process microphone audio (user's own speech)
      if (micAudioChunks.length > 0) {
        setTranscriptionProgress('🎙️ Transcribing microphone audio (your speech)...');
        console.log('🎙️ Processing microphone audio...');

        // For microphone, we have live transcription from Web Speech API
        // Use the current recording session's transcript
        micTranscript = transcriptRef.current?.trim() || '';
        console.log('🎙️ Live transcript from Web Speech API:', micTranscript.length, 'chars');

        // If Web Speech API didn't capture anything, try Whisper
        if (!micTranscript || micTranscript.length === 0) {
          try {
            const micBlob = new Blob(micAudioChunks, { type: 'audio/webm' });
            console.log('📊 Mic audio blob:', {
              size: `${(micBlob.size / 1024).toFixed(2)} KB`,
              chunks: micAudioChunks.length,
            });

            micTranscript = await transcribeWithGroqDirect(micBlob, {
              language: 'en',
              temperature: 0,
              model: 'whisper-large-v3-turbo'
            });
          } catch (err) {
            console.error('❌ Microphone transcription failed:', err);
          }
        }

        console.log('✅ Microphone transcript length:', micTranscript.length, 'chars');
      }

      // Process tab audio (other participants/meeting audio)
      if (tabAudioChunks.length > 0) {
        setTranscriptionProgress('🖥️ Transcribing tab audio (meeting participants)...');
        console.log('🖥️ Processing tab audio...');

        const tabBlob = new Blob(tabAudioChunks, { type: tabAudioChunks[0]?.type || 'video/webm' });
        console.log('📊 Tab audio blob:', {
          size: `${(tabBlob.size / 1024 / 1024).toFixed(2)} MB`,
          chunks: tabAudioChunks.length,
          type: tabBlob.type,
        });

        if (tabBlob.size > 0) {
          try {
            setTranscriptionProgress('Converting video to audio...');
            const audioBlob = await convertToAudioBlob(tabBlob);

            setTranscriptionProgress('🖥️ Transcribing tab audio with Groq Whisper AI...');
            tabTranscript = await transcribeWithGroqDirect(audioBlob, {
              language: 'en',
              temperature: 0,
              model: 'whisper-large-v3-turbo'
            });

            console.log('✅ Tab transcript length:', tabTranscript.length, 'chars');
          } catch (err) {
            console.error('❌ Tab audio transcription failed:', err);
            tabTranscript = '';
          }
        }
      }

      setTranscriptionProgress('');

      // ══════════════════════════════════════════════════════════════════════
      // Combine transcripts with proper speaker labels
      // Get account holder name from user profile
      // ══════════════════════════════════════════════════════════════════════

      let combinedTranscript = '';
      let accountHolderName = 'You'; // Default fallback

      // Try to get account holder name from database
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', user?.id)
          .maybeSingle();

        if (userData?.name) {
          accountHolderName = userData.name;
        } else {
          // Fallback to user metadata or email
          accountHolderName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';
        }
      } catch (err) {
        console.warn('Could not fetch user name, using fallback:', err);
        accountHolderName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';
      }

      console.log('👤 Account holder name:', accountHolderName);

      // Label microphone audio with account holder's name
      if (micTranscript && micTranscript.trim().length > 0) {
        combinedTranscript += `${accountHolderName}: ${micTranscript}\n\n`;
      }

      // Process tab audio with speaker diarization for other participants
      let participants: string[] = [accountHolderName];
      let extractedActions: any[] = [];
      let formattedTabTranscript = tabTranscript;

      if (tabTranscript && tabTranscript.trim().length > 0) {
        try {
          setTranscriptionProgress('🎤 Identifying speakers in tab audio...');
          console.log('🎤 Processing speaker diarization for tab audio...');

          // Create audio blob from tab chunks for speaker analysis
          const tabAudioBlob = new Blob(tabAudioChunks, { type: tabAudioChunks[0]?.type || 'video/webm' });
          const tabAudioOnly = await convertToAudioBlob(tabAudioBlob);

          const diarizationResult = await transcribeWithSpeakerDiarization(tabAudioOnly, accountHolderName);

          // Use diarization results for tab audio
          formattedTabTranscript = diarizationResult.transcript;
          participants = [accountHolderName, ...diarizationResult.participants.filter((p: string) => p !== accountHolderName)];
          extractedActions = diarizationResult.actionItems;

          console.log('✅ Speaker diarization complete:', {
            participantsCount: participants.length,
            participants: participants,
            actionItemsCount: extractedActions.length,
          });

          combinedTranscript += formattedTabTranscript;
        } catch (err) {
          console.error('⚠️ Speaker diarization failed:', err);
          // Fallback: just append raw tab transcript
          combinedTranscript += `[Tab Audio]: ${tabTranscript}\n\n`;
        }
      }

      console.log('📝 Combined transcript length:', combinedTranscript.length, 'chars');
      setTranscript(combinedTranscript);

      // Process audio with AI for summary and action items
      let aiSummary = '';
      let generatedTitle = title;

      if (combinedTranscript && combinedTranscript.trim().length > 0) {
        try {
          // Generate meeting title from transcript if using default title
          if (!recordingTitle || recordingTitle.trim().length === 0) {
            setTranscriptionProgress('🤖 Generating meeting title...');
            console.log('📝 Generating AI-powered meeting title...');
            generatedTitle = await generateMeetingTitle(combinedTranscript);
            console.log('✅ Generated title:', generatedTitle);
          }

          setTranscriptionProgress('🤖 Analyzing transcript and extracting action items...');
          console.log('🤖 Generating meeting summary with AI...');

          const summaryResult = await generateMeetingSummary(combinedTranscript, generatedTitle);
          aiSummary = summaryResult.summary;

          // Use AI-extracted action items from the full combined transcript
          if (summaryResult.actionItems && summaryResult.actionItems.length > 0) {
            extractedActions = summaryResult.actionItems.map(item => ({
              title: item.title,
              task: item.title,
              description: item.description || '',
              assignee: item.assignee || user?.email || 'Unassigned',
              priority: item.priority,
            }));
            console.log('✅ Extracted action items from AI analysis:', extractedActions.length);
          }

          console.log('✅ AI Summary generated:', {
            summary: aiSummary.substring(0, 100),
            actionItemsCount: extractedActions.length,
          });

          setTranscriptionProgress('');
        } catch (summaryErr: any) {
          console.error('⚠️ AI processing failed:', summaryErr);
          aiSummary = combinedTranscript.substring(0, 200) + (combinedTranscript.length > 200 ? '...' : '');
        }
      }

      const meetingData = await meetingsAPI.create({
        title: generatedTitle,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: `${Math.ceil(recordingTime / 60)} min`,
        status: 'completed',
        summary: aiSummary || (combinedTranscript
          ? combinedTranscript.substring(0, 200) + (combinedTranscript.length > 200 ? '...' : '')
          : `Meeting Recording – ${Math.ceil(recordingTime / 60)} min captured.`),
        transcript: combinedTranscript || '[No speech detected during recording.]',
        location: 'Parallel Recording (Mic + Tab)',
        recording_url: null,
        user_id: user?.id,
      }, []);

      // Save participants to database
      if (participants.length > 0 && meetingData?.id && user) {
        try {
          console.log(`👥 Saving ${participants.length} participants...`);
          await saveParticipantsToMeeting(meetingData.id, participants, user.id);
          console.log('✅ Participants saved successfully');
        } catch (participantsErr: any) {
          console.error('⚠️ Failed to save participants:', participantsErr);
        }
      }

      // Create extracted action items
      if (extractedActions.length > 0 && meetingData?.id && user) {
        try {
          console.log(`📝 Creating ${extractedActions.length} extracted action items...`);

          // Default due date: 7 days from now
          const defaultDueDate = new Date();
          defaultDueDate.setDate(defaultDueDate.getDate() + 7);
          const dueDateStr = defaultDueDate.toISOString().split('T')[0];

          for (const action of extractedActions) {
            await actionItemsAPI.create({
              title: action.task || action.title,
              description: action.description || '',
              meeting_id: meetingData.id,
              status: 'todo',
              priority: action.priority,
              assignee: action.assignee || user.email || 'Unassigned',
              due_date: dueDateStr,
              user_id: user.id,
            });
          }

          console.log('✅ Action items created successfully');
        } catch (actionErr: any) {
          console.error('⚠️ Failed to create some action items:', actionErr);
        }
      }

      // Upload the tab recording blob to Supabase Storage
      if (tabAudioChunks.length > 0 && meetingData?.id && user) {
        const blobType = tabAudioChunks[0]?.type || 'video/webm';
        const finalBlob = new Blob(tabAudioChunks, { type: blobType });
        if (finalBlob.size > 0) {
          try {
            console.log('📤 Uploading tab recording blob...', (finalBlob.size / 1024 / 1024).toFixed(2), 'MB');
            const recordingUrl = await recordingsAPI.uploadAudio(finalBlob, user.id, meetingData.id);
            console.log('✅ Recording uploaded:', recordingUrl);
            await meetingsAPI.update(meetingData.id, { recording_url: recordingUrl }, user.id);
          } catch (uploadErr: any) {
            console.error('⚠️ Recording upload failed (meeting saved without recording):', uploadErr);
          }
        }
      }

      // Trigger AI analysis if we have a transcript
      if (combinedTranscript && meetingData?.id && user) {
        try {
          console.log('🤖 Triggering AI analysis...');
          await aiProcessingService.triggerAnalysis(meetingData.id, user.id);
        } catch (analysisErr: any) {
          console.warn('⚠️ AI analysis trigger failed:', analysisErr);
        }
      }

      console.log('✅ Saved!');
      await fetchMeetings();

      setTimeout(() => {
        setTranscript(''); transcriptRef.current = '';
        setRecordingTitle(''); setRecordingTime(0);
        setShowRecordingModal(false); setRecordingStep('select');
        setAudioChunks([]); setTranscriptionProgress('');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error stopping recording:', error);
      alert(`Failed to process recording:\n\n${error.message}`);
      setIsRecording(false); setRecordingStep('select');
    } finally { setProcessingRecording(false); }
  };

  const cancelRecording = () => {
    const recog = speechRecRef.current || speechRecognition;
    if (recog) {
      recog.stop();
      setSpeechRecognition(null);
      speechRecRef.current = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    
    setIsRecording(false);
    setTranscript('');
    transcriptRef.current = '';
    setRecordingTitle('');
    setRecordingTime(0);
    setShowRecordingModal(false);
    setRecordingStep('select');
  };

  return (
    <div className={compactMode ? "space-y-4" : "space-y-6"}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meetings
          </h1>
          <p className={`${compactMode ? 'text-sm' : 'text-base'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage and review your meeting history
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRecordingModal(true)}
          className={`${compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} bg-gradient-to-r from-red-500 to-pink-600 text-white ${compactMode ? 'rounded-lg' : 'rounded-xl'} shadow-md hover:shadow-lg transition-all flex items-center gap-2`}
        >
          <Mic className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'}`} />
          Record Audio
        </motion.button>
      </motion.div>

      {/* Recording Diagnostic Tool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <RecordingDiagnostic />
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Meetings</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalMeetings}</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>This Week</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.thisWeek}</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Hours</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalHours}</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Participants</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.participants}</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
            } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <Search className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm ${
                  theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'
              } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2 text-sm`}
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-xl z-10`}
                >
                  <div className="p-2">
                    {['all', 'today', 'this-week', 'this-month'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          selectedFilter === filter
                            ? 'bg-blue-500 text-white'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'
            } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2 text-sm`}
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Meetings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <Video className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No meetings yet
            </h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Get started by creating your first meeting
            </p>
            <button
              onClick={() => setShowNewMeetingModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          meetings.map((meeting, index) => (
            <div key={meeting.id} className="relative">
            <Link to={`/meetings/${meeting.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              className="glass-card rounded-xl p-4 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                {/* Left Section */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {meeting.title}
                      </h3>
                      {/* Status Pill */}
                      {meeting.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">Completed</span>
                      )}
                      {meeting.status === 'in-progress' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 flex items-center gap-1">
                          <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" /></span>
                          Live Now
                        </span>
                      )}
                      {meeting.status === 'processing' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {meeting.ai_processing_status === 'analyzing'
                            ? 'AI Analyzing...'
                            : meeting.ai_processing_status === 'queued'
                            ? 'Queued'
                            : 'Processing'}
                        </span>
                      )}
                      {meeting.ai_processing_status === 'failed' && meeting.status !== 'processing' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                          AI Failed
                        </span>
                      )}
                      {meeting.status === 'scheduled' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">Scheduled</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} flex-wrap`}>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meeting.time} • {meeting.duration}
                      </span>
                    </div>
                    {/* AI Summary preview / Processing status */}
                    {meeting.status === 'processing' && (
                      <p className={`text-xs mt-1.5 flex items-center gap-1.5 ${theme === 'dark' ? 'text-amber-400/80' : 'text-amber-600'}`}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {meeting.ai_processing_status === 'analyzing'
                          ? 'Claude is analyzing the transcript...'
                          : 'AI processing in progress...'}
                      </p>
                    )}
                    {meeting.status === 'completed' && meeting.summary && (
                      <p className={`text-xs mt-1.5 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {meeting.summary}
                      </p>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      {meeting.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                  {/* Participants */}
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {meeting.participants.slice(0, 3).map((participant, idx) => (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded-full ${participant.color} flex items-center justify-center text-white text-xs font-bold border-2 ${
                            theme === 'dark' ? 'border-gray-800' : 'border-white'
                          }`}
                          title={participant.name}
                        >
                          {participant.avatar}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Progress */}
                  <div className={`px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
                  } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {meeting.completed}/{meeting.actions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleDeleteMeeting(meeting, e)}
            disabled={deletingMeetingId === meeting.id}
            className={`absolute bottom-3 right-3 p-1.5 rounded-lg transition-colors z-10 ${
              deletingMeetingId === meeting.id
                ? 'bg-gray-400 cursor-not-allowed'
                : theme === 'dark'
                ? 'bg-red-900/50 hover:bg-red-900 text-red-300'
                : 'bg-red-100 hover:bg-red-200 text-red-700'
            }`}
            title="Delete meeting"
          >
            {deletingMeetingId === meeting.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </motion.button>
            </div>
          ))
        )}
      </motion.div>

      {/* New Meeting Modal */}
      {createPortal(
      <AnimatePresence>
        {showNewMeetingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewMeetingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl ${compactMode ? 'p-5' : 'p-6'} w-full max-w-2xl shadow-2xl`}
            >
              <h2 className={`${compactMode ? 'text-xl' : 'text-2xl'} font-bold ${compactMode ? 'mb-3' : 'mb-4'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create New Meeting
              </h2>
              
              <div className={compactMode ? "space-y-3" : "space-y-4"}>
                <div>
                  <label className={`block ${compactMode ? 'text-xs' : 'text-sm'} font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    placeholder="e.g., Product Roadmap Review"
                    className={`w-full ${compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block ${compactMode ? 'text-xs' : 'text-sm'} font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                      className={`w-full ${compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block ${compactMode ? 'text-xs' : 'text-sm'} font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      Time *
                    </label>
                    <input
                      type="time"
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                      className={`w-full ${compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-900 border-gray-300'
                      } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block ${compactMode ? 'text-xs' : 'text-sm'} font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Duration (minutes)
                  </label>
                  <select
                    value={newMeeting.duration}
                    onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })}
                    className={`w-full ${compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label className={`block ${compactMode ? 'text-xs' : 'text-sm'} font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Participants (comma-separated emails)
                  </label>
                  <input
                    type="text"
                    value={newMeeting.participants}
                    onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                    placeholder="john@example.com, sarah@example.com"
                    className={`w-full ${compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block ${compactMode ? 'text-xs' : 'text-sm'} font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newMeeting.tags}
                    onChange={(e) => setNewMeeting({ ...newMeeting, tags: e.target.value })}
                    placeholder="Product, Planning, Quarterly"
                    className={`w-full ${compactMode ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                    } border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 ${compactMode ? 'mt-4' : 'mt-6'}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className={`${compactMode ? 'px-4 py-1.5 text-sm' : 'px-5 py-2'} ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } rounded-lg font-semibold transition-colors`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleCreateMeeting}
                  disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
                  className={`${compactMode ? 'px-4 py-1.5 text-sm' : 'px-5 py-2'} bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Create Meeting
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Delete Confirmation Modal */}
      {createPortal(
      <AnimatePresence>
        {showDeleteConfirm && meetingToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-md shadow-2xl`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Delete Meeting?
                  </h2>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Are you sure you want to delete "<span className="font-semibold">{meetingToDelete.title}</span>"? This action cannot be undone and will also delete all associated action items.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDeleteMeeting}
                  disabled={deletingMeetingId !== null}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deletingMeetingId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Meeting
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Tab Recording Modal */}
      {createPortal(
      <AnimatePresence>
        {showRecordingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isRecording && setShowRecordingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Audio Recorder
                  </h2>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Record from your microphone or capture audio from a browser tab
                  </p>
                </div>
                {!isRecording && (
                  <button
                    onClick={() => setShowRecordingModal(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Source Selector */}
              {!isRecording && (
                <div className="mb-6">
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Audio Source
                  </label>

                  {/* Environment Restriction Warning */}
                  {!displayCaptureAllowed && (
                    <div className={`mb-4 p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-yellow-900/20 border-yellow-800/30 text-yellow-400'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                      <p className="text-xs font-medium mb-1">⚠️ Tab Capture Not Available</p>
                      <p className="text-xs opacity-90">
                        Tab recording is disabled in Figma Make preview. Deploy this app to a standard web host to enable tab capture.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSource('microphone')}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        selectedSource === 'microphone'
                          ? theme === 'dark'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-purple-500 bg-purple-50'
                          : theme === 'dark'
                            ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {selectedSource === 'microphone' && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-purple-500" />
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                        selectedSource === 'microphone'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                          : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Mic className={`w-5 h-5 ${selectedSource === 'microphone' ? 'text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Microphone
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Record your voice with live transcription
                      </p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: displayCaptureAllowed ? 1.02 : 1 }}
                      whileTap={{ scale: displayCaptureAllowed ? 0.98 : 1 }}
                      onClick={() => displayCaptureAllowed && setSelectedSource('tab')}
                      disabled={!displayCaptureAllowed}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        !displayCaptureAllowed
                          ? theme === 'dark'
                            ? 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : selectedSource === 'tab'
                            ? theme === 'dark'
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-red-500 bg-red-50'
                            : theme === 'dark'
                              ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {selectedSource === 'tab' && displayCaptureAllowed && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                      {!displayCaptureAllowed && (
                        <div className="absolute top-2 right-2">
                          <X className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                        selectedSource === 'tab' && displayCaptureAllowed
                          ? 'bg-gradient-to-br from-red-500 to-orange-600'
                          : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Monitor className={`w-5 h-5 ${selectedSource === 'tab' && displayCaptureAllowed ? 'text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                      <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Browser Tab {!displayCaptureAllowed && '(Blocked)'}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {displayCaptureAllowed
                          ? 'Capture audio from any other browser tab'
                          : 'Not available in this environment'
                        }
                      </p>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Recording Title Input */}
              <div className="mb-5">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Recording Title (Optional)
                </label>
                <input
                  type="text"
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  placeholder="e.g., Team Standup Meeting"
                  disabled={isRecording}
                  className={`w-full px-4 py-3 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                  } border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50`}
                />
              </div>

              {/* Mode-specific Instructions */}
              {!isRecording && selectedSource === 'tab' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-4 mb-5 ${theme === 'dark' ? 'bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/30' : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'}`}
                >
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Monitor className="w-4 h-4 text-red-500" />
                    How Tab Audio Capture Works
                  </h3>
                  <ol className={`text-xs space-y-1.5 list-decimal list-inside ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>Click <strong>"Start Recording"</strong> — a browser tab picker will appear</li>
                    <li>Select the <strong>"Tab"</strong> you want to record</li>
                    <li>Make sure <strong>"Share tab audio"</strong> is checked</li>
                    <li>Audio is captured directly from the tab's stream — no microphone needed</li>
                  </ol>
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-blue-400/80' : 'text-blue-600'}`}>
                    ✨ Transcription powered by <strong>Whisper AI</strong> running locally in your browser (100% free, private)
                  </p>
                </motion.div>
              )}
              {!isRecording && selectedSource === 'microphone' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-4 mb-5 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-800/30' : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'}`}
                >
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Mic className="w-4 h-4 text-purple-500" />
                    Microphone Recording
                  </h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your microphone will record your voice and the Web Speech API will transcribe it in real-time. Grant microphone permission when prompted.
                  </p>
                </motion.div>
              )}

              {/* Recording Status */}
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl p-5 mb-5 ${theme === 'dark' ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'}`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Recording Parallel Audio (Mic + Tab)
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Duration: {formatTime(recordingTime)}
                        </p>
                        {/* Real-time audio level indicator */}
                        {(micMediaStream || tabMediaStream) && (
                          <div className="mt-2 space-y-1">
                            {micMediaStream && (
                              <div className="flex items-center gap-2">
                                <Mic className="w-3 h-3" />
                                <AudioLevelIndicator stream={micMediaStream} />
                              </div>
                            )}
                            {tabMediaStream && (
                              <div className="flex items-center gap-2">
                                <Monitor className="w-3 h-3" />
                                <AudioLevelIndicator stream={tabMediaStream} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopTabRecording}
                      disabled={processingRecording}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Stop Recording
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Transcript / Audio Status Display */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Live Transcript (Your Speech)
                </label>
                <div className={`min-h-[160px] max-h-[300px] overflow-y-auto rounded-xl p-4 ${
                  theme === 'dark' ? 'bg-gray-900/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                }`}>
                  {transcript ? (
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {transcript}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <Mic className={`w-10 h-10 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {isRecording
                          ? 'Recording both microphone and tab audio... Live transcript from your microphone will appear here.'
                          : 'Click "Start Recording" to begin recording both microphone and tab audio simultaneously.'}
                      </p>
                      {isRecording && (
                        <div className="flex items-center gap-1.5 mt-3">
                          {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [h, h * 2.5, h] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.08 }}
                              className="w-1 bg-red-500 rounded-full"
                              style={{ height: h * 2 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                {!isRecording && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRecordingModal(false)}
                    className={`px-5 py-3 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-xl font-semibold transition-colors`}
                  >
                    Cancel
                  </motion.button>
                )}
                {!isRecording && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startTabRecording}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 via-purple-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    <Monitor className="w-4 h-4" />
                    Start Recording (Mic + Tab)
                  </motion.button>
                )}
                {isRecording && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelRecording}
                    disabled={processingRecording}
                    className={`px-5 py-3 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-xl font-semibold transition-colors disabled:opacity-50`}
                  >
                    Cancel & Discard
                  </motion.button>
                )}
              </div>

              {/* Processing Indicator */}
              {processingRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'} flex items-center gap-3`}
                >
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {transcriptionProgress || 'Processing and saving your recording...'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}