import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Download,
  Share2,
  Play,
  CheckCircle2,
  Circle,
  User,
  Sparkles,
  Loader2,
  Lightbulb,
  ListChecks,
  Bookmark,
  Zap,
  Brain,
  Target,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Mic
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { meetingsAPI, actionItemsAPI } from "../services/apiWrapper";
import { aiProcessingService } from "../services/googleMeetService";

// Mock participant data for the Participants tab
const mockParticipantDetails = [
  { name: "Sarah Chen", role: "Product Manager", speakingPct: 35, sentiment: "positive", tasksAssigned: 3 },
  { name: "Mike Johnson", role: "Engineering Lead", speakingPct: 28, sentiment: "positive", tasksAssigned: 2 },
  { name: "Emily Davis", role: "Designer", speakingPct: 20, sentiment: "neutral", tasksAssigned: 1 },
  { name: "Alex Kim", role: "Data Analyst", speakingPct: 12, sentiment: "positive", tasksAssigned: 2 },
  { name: "Jordan Lee", role: "QA Engineer", speakingPct: 5, sentiment: "negative", tasksAssigned: 0 },
];

const mockKeyDecisions = [
  "Approved Q3 product roadmap with focus on AI features",
  "Decided to postpone mobile app launch to August",
  "Agreed on new design system adoption timeline",
  "Budget allocated for cloud infrastructure upgrade",
];

const mockNextSteps = [
  "Schedule follow-up with engineering team by Friday",
  "Prepare updated wireframes for review next week",
  "Send budget proposal to finance department",
  "Set up staging environment for new features",
];

const mockHighlights = [
  { time: "00:05:32", text: "Team alignment on Q3 priorities achieved" },
  { time: "00:12:15", text: "New AI feature demo received positive feedback" },
  { time: "00:25:40", text: "Design system migration plan discussed" },
  { time: "00:35:10", text: "Budget concerns raised and addressed" },
];

export function MeetingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "actions" | "participants">("summary");
  const [meeting, setMeeting] = useState<any>(null);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiJobs, setAiJobs] = useState<any[]>([]);

  useEffect(() => {
    const loadMeetingData = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        setError(null);
        
        const meetingData = await meetingsAPI.getById(id, user.id);
        setMeeting(meetingData);

        const actions = await actionItemsAPI.getByMeeting(id, user.id);
        setActionItems(actions);

        // Fetch AI job status and subscribe to updates
        const jobs = await aiProcessingService.getJobStatus(id);
        setAiJobs(jobs);
        aiProcessingService.subscribeToJob(id, () => aiProcessingService.getJobStatus(id).then(setAiJobs));
        aiProcessingService.subscribeMeetingUpdates(id, (payload) => {
          if (payload.new) setMeeting((prev: any) => prev ? ({ ...prev, ...payload.new }) : prev);
        });
      } catch (err: any) {
        console.error('Error loading meeting:', err);
        setError(err.message || 'Failed to load meeting');
      } finally {
        setLoading(false);
      }
    };

    loadMeetingData();
  }, [id, user]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading meeting details...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !meeting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-12 text-center shadow-xl">
          <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {error || "Meeting not found"}
          </p>
          <button
            onClick={() => navigate('/meetings')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Back to Meetings
          </button>
        </div>
      </motion.div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getColorForName = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
      'bg-cyan-500', 'bg-lime-500', 'bg-yellow-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const sentimentColor = (s: string) => {
    if (s === 'positive') return 'bg-green-500';
    if (s === 'negative') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  // Build participants list from meeting data or fallback to mock
  const participants = meeting.meeting_participants?.length > 0
    ? meeting.meeting_participants.map((p: any, i: number) => ({
        ...mockParticipantDetails[i % mockParticipantDetails.length],
        name: p.participant_name,
        role: p.role || mockParticipantDetails[i % mockParticipantDetails.length].role,
      }))
    : mockParticipantDetails;

  const tabs = ["summary", "transcript", "actions", "participants"] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/meetings')}
          className={`inline-flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} mb-4 font-medium group`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Meetings
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {meeting.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-gray-600'} px-3 py-1.5 rounded-lg`}>
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                {formatDate(meeting.date)}
              </div>
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-gray-600'} px-3 py-1.5 rounded-lg`}>
                <Clock className="w-4 h-4 text-purple-600" />
                {formatTime(meeting.time)} • {meeting.duration}
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                meeting.status === "completed"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                  : meeting.status === "in-progress"
                  ? "bg-gradient-to-r from-orange-400 to-yellow-500 text-white"
                  : "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
              }`}>
                {meeting.status}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-white transition-all ${theme === 'dark' ? 'text-gray-200' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-white transition-all ${theme === 'dark' ? 'text-gray-200' : ''}`}
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* AI Processing Status Banner */}
      {meeting.ai_processing_status && meeting.ai_processing_status !== 'none' && meeting.ai_processing_status !== 'complete' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(139,92,246,0.2)' }}>
          <Loader2 className="w-4 h-4 animate-spin text-purple-600"/>
          <span className="text-purple-700">{aiProcessingService.getStatusLabel(meeting.ai_processing_status)}</span>
          <span className="ml-auto text-xs text-purple-500">Auto-refreshing...</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl shadow-xl overflow-hidden"
          >
            <div className={`border-b ${theme === 'dark' ? 'border-white/10' : 'border-white/30'}`}>
              <div className="flex">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    whileHover={{ y: -2 }}
                    className={`px-6 py-4 font-semibold transition-all relative ${
                      activeTab === tab
                        ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "summary" && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* AI Generated badge */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          Meeting Summary
                        </h3>
                        {meeting.sentiment && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                            meeting.sentiment === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            meeting.sentiment === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {meeting.sentiment === 'positive' ? <ThumbsUp className="w-3 h-3"/> : 
                             meeting.sentiment === 'negative' ? <ThumbsDown className="w-3 h-3"/> : 
                             <Minus className="w-3 h-3"/>}
                            {meeting.sentiment}
                          </span>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs font-semibold rounded-full">
                        AI Generated
                      </span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {meeting.summary || "No summary available for this meeting."}
                    </p>
                    
                    {/* Key Decisions */}
                    {meeting.key_decisions && meeting.key_decisions.length > 0 && (
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                          <Target className="w-5 h-5 text-blue-500" />
                          Key Decisions
                        </h4>
                        <ul className="space-y-2">
                          {meeting.key_decisions.map((decision: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm">
                              <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Meeting Highlights */}
                    {meeting.meeting_highlights && meeting.meeting_highlights.length > 0 && (
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                          <Zap className="w-5 h-5 text-amber-500" />
                          Highlights
                        </h4>
                        <div className="space-y-2">
                          {meeting.meeting_highlights.map((h: any, i: number) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'}`}>
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded text-xs font-mono font-bold flex-shrink-0">{h.timestamp}</span>
                              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{h.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    <div>
                      <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                        <ListChecks className="w-4 h-4 text-blue-500" />
                        Next Steps
                      </h4>
                      <ul className="space-y-2">
                        {mockNextSteps.map((step, i) => (
                          <li key={i} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {meeting.location && (
                      <div>
                        <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Location</h3>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{meeting.location}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "transcript" && (
                  <motion.div
                    key="transcript"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recording Transcript</h3>
                      {meeting.recording_url && (
                        <motion.a
                          href={meeting.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          <Play className="w-4 h-4" />
                          Play Recording
                        </motion.a>
                      )}
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'} rounded-xl p-4 max-h-96 overflow-y-auto`}>
                      {meeting.transcript ? (
                        <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                          {meeting.transcript}
                        </pre>
                      ) : (
                        <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-center py-8`}>No transcript available for this meeting.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "actions" && (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {actionItems.length > 0 ? (
                      actionItems.map((action, idx) => (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`p-4 ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'} rounded-xl hover:bg-white transition-all border ${theme === 'dark' ? 'border-white/5' : 'border-white/50'}`}
                        >
                          <div className="flex items-start gap-3">
                            {action.status === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className={`font-semibold ${
                                action.status === "completed" ? "text-gray-500 line-through" : theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {action.title}
                              </p>
                              {action.description && (
                                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Assigned to: {action.assignee}</span>
                                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Due: {formatDate(action.due_date)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  action.priority === "high"
                                    ? "bg-red-100 text-red-700"
                                    : action.priority === "medium"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}>
                                  {action.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} text-center py-8`}>No action items for this meeting.</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "participants" && (
                  <motion.div
                    key="participants"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {participants.map((p: any, idx: number) => (
                      <motion.div
                        key={p.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`p-4 ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'} rounded-xl border ${theme === 'dark' ? 'border-white/5' : 'border-white/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${getColorForName(p.name)} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <span className="text-white font-bold">{getInitials(p.name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                {p.role}
                              </span>
                              <span className={`w-2.5 h-2.5 rounded-full ${sentimentColor(p.sentiment)}`} title={`Sentiment: ${p.sentiment}`} />
                            </div>
                            {/* Speaking time bar */}
                            <div className="flex items-center gap-2">
                              <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${p.speakingPct}%` }}
                                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                                />
                              </div>
                              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-10`}>
                                {p.speakingPct}%
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {p.tasksAssigned} task{p.tasksAssigned !== 1 ? 's' : ''} assigned
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Participants */}
          <div className="glass rounded-2xl p-6 shadow-xl">
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
              <Users className="w-5 h-5 text-purple-500" />
              Participants ({meeting.meeting_participants?.length || 0})
            </h3>
            <div className="space-y-3">
              {meeting.meeting_participants && meeting.meeting_participants.length > 0 ? (
                meeting.meeting_participants.map((participant: any, idx: number) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className={`flex items-center gap-3 p-3 ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'} rounded-xl`}
                  >
                    <div className={`w-10 h-10 ${getColorForName(participant.participant_name)} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-sm font-bold">
                        {getInitials(participant.participant_name)}
                      </span>
                    </div>
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{participant.participant_name}</p>
                      {participant.role && (
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{participant.role}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>No participants listed</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}