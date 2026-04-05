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
  Mic,
  FileText,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { meetingsAPI, actionItemsAPI } from "../services/apiWrapper";
import { aiProcessingService } from "../services/googleMeetService";
import { generateMeetingSummary } from "../services/groqLLMService";

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
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [extractingTasks, setExtractingTasks] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleAiAnalyze = async () => {
    if (!user || !id || !meeting?.transcript) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      // Generate summary using Groq LLM
      const summaryResult = await generateMeetingSummary(
        meeting.transcript,
        meeting.title
      );

      // Update meeting with new summary
      await meetingsAPI.update(id, {
        summary: summaryResult.summary
      }, user.id);

      // Default due date: 7 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      const dueDateStr = defaultDueDate.toISOString().split('T')[0];

      // Create new action items extracted from transcript
      for (const action of summaryResult.actionItems) {
        await actionItemsAPI.create({
          title: action.title,
          description: action.description || '',
          meeting_id: id,
          status: 'todo',
          priority: action.priority,
          assignee: action.assignee || user.email || 'Unassigned',
          due_date: dueDateStr,
          user_id: user.id,
        });
      }

      // Reload meeting data to show updates
      const updatedMeeting = await meetingsAPI.getById(id, user.id);
      setMeeting(updatedMeeting);

      const updatedActions = await actionItemsAPI.getByMeeting(id, user.id);
      setActionItems(updatedActions);
    } catch (err: any) {
      setAnalyzeError(err.message || 'An unexpected error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const isProcessing = meeting?.ai_processing_status && !['none', 'complete', 'failed'].includes(meeting.ai_processing_status);

  const handleExport = () => {
    if (!meeting) return;

    // Create formatted content
    let content = `# ${meeting.title}\n\n`;
    content += `**Date:** ${formatDate(meeting.date)}\n`;
    content += `**Time:** ${formatTime(meeting.time)} • ${meeting.duration}\n`;
    content += `**Status:** ${meeting.status}\n`;
    if (meeting.location) content += `**Location:** ${meeting.location}\n`;
    content += `\n---\n\n`;

    // Add participants
    if (realParticipants.length > 0) {
      content += `## Participants (${realParticipants.length})\n\n`;
      realParticipants.forEach((p: any) => {
        content += `- ${p.participant_name}`;
        if (p.role) content += ` (${p.role})`;
        if (p.participant_email) content += ` - ${p.participant_email}`;
        content += `\n`;
      });
      content += `\n`;
    }

    // Add summary
    if (meeting.summary) {
      content += `## Summary\n\n${meeting.summary}\n\n`;
    }

    // Add key decisions
    if (meeting.key_decisions && meeting.key_decisions.length > 0) {
      content += `## Key Decisions\n\n`;
      meeting.key_decisions.forEach((decision: string, i: number) => {
        content += `${i + 1}. ${decision}\n`;
      });
      content += `\n`;
    }

    // Add highlights
    if (meeting.meeting_highlights && meeting.meeting_highlights.length > 0) {
      content += `## Highlights\n\n`;
      meeting.meeting_highlights.forEach((h: any) => {
        content += `- [${h.timestamp}] ${h.text}\n`;
      });
      content += `\n`;
    }

    // Add action items
    if (actionItems.length > 0) {
      content += `## Action Items (${actionItems.length})\n\n`;
      actionItems.forEach((action: any) => {
        const checkbox = action.status === 'completed' ? '[x]' : '[ ]';
        content += `${checkbox} **${action.title}**\n`;
        if (action.description) content += `   ${action.description}\n`;
        content += `   Assigned to: ${action.assignee} | Priority: ${action.priority}`;
        if (action.due_date) content += ` | Due: ${formatDate(action.due_date)}`;
        content += `\n\n`;
      });
    }

    // Add transcript
    if (meeting.transcript) {
      content += `## Transcript\n\n${meeting.transcript}\n`;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${meeting.date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExtractTasks = async () => {
    if (!user || !id || !meeting?.transcript) return;
    setExtractingTasks(true);
    setExtractError(null);
    try {
      // Generate summary to extract action items
      const summaryResult = await generateMeetingSummary(
        meeting.transcript,
        meeting.title
      );

      // Default due date: 7 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      const dueDateStr = defaultDueDate.toISOString().split('T')[0];

      // Create new action items extracted from transcript
      for (const action of summaryResult.actionItems) {
        await actionItemsAPI.create({
          title: action.title,
          description: action.description || '',
          meeting_id: id,
          status: 'todo',
          priority: action.priority,
          assignee: action.assignee || user.email || 'Unassigned',
          due_date: dueDateStr,
          user_id: user.id,
        });
      }

      // Reload action items to show updates
      const updatedActions = await actionItemsAPI.getByMeeting(id, user.id);
      setActionItems(updatedActions);
    } catch (err: any) {
      setExtractError(err.message || 'An unexpected error occurred');
    } finally {
      setExtractingTasks(false);
    }
  };

  useEffect(() => {
    if (!user || !id) return;

    let jobChannel: any = null;
    let meetingChannel: any = null;

    const loadMeetingData = async () => {
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

        // Subscribe to job updates
        jobChannel = aiProcessingService.subscribeToJob(id, () =>
          aiProcessingService.getJobStatus(id).then(setAiJobs)
        );

        // Subscribe to meeting updates
        meetingChannel = aiProcessingService.subscribeMeetingUpdates(id, (payload) => {
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

    // Cleanup subscriptions on unmount
    return () => {
      if (jobChannel) {
        jobChannel.unsubscribe();
      }
      if (meetingChannel) {
        meetingChannel.unsubscribe();
      }
    };
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
    try {
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } catch {
      return timeStr;
    }
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

  // Determine if we have real participants
  const realParticipants = meeting.meeting_participants?.filter((p: any) => p.participant_name) || [];
  const hasParticipants = realParticipants.length > 0;

  // Determine which tabs to show
  const tabs = hasParticipants
    ? (["summary", "transcript", "actions", "participants"] as const)
    : (["summary", "transcript", "actions"] as const);

  // If the active tab is participants but there are none, switch to summary
  if (activeTab === "participants" && !hasParticipants) {
    // We can't call setActiveTab during render, but this edge case is handled by not showing the tab
  }

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
                {formatTime(meeting.time)} &bull; {meeting.duration}
              </div>
              {meeting.location && (
                <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800/60 text-gray-300' : 'bg-gray-100 text-gray-600'} px-3 py-1.5 rounded-lg`}>
                  <Mic className="w-4 h-4 text-gray-500" />
                  {meeting.location}
                </div>
              )}
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
              onClick={handleExport}
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

      <div className={`grid grid-cols-1 ${hasParticipants ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Main Content */}
        <div className={`${hasParticipants ? 'lg:col-span-2' : ''} space-y-6`}>
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
                    onClick={() => setActiveTab(tab as any)}
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
                    {/* Summary Header */}
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
                      {meeting.summary && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs font-semibold rounded-full">
                          AI Generated
                        </span>
                      )}
                    </div>

                    {/* Summary Content */}
                    <div className={`${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'} rounded-xl p-5 border ${theme === 'dark' ? 'border-white/5' : 'border-white/50'}`}>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed whitespace-pre-wrap`}>
                        {meeting.summary || "No summary available for this meeting."}
                      </p>
                    </div>

                    {/* AI Analyze Button */}
                    {meeting.transcript && (
                      <div className="flex flex-col items-center gap-3">
                        <motion.button
                          onClick={handleAiAnalyze}
                          disabled={analyzing || isProcessing}
                          whileHover={!analyzing && !isProcessing ? { scale: 1.03 } : {}}
                          whileTap={!analyzing && !isProcessing ? { scale: 0.97 } : {}}
                          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white transition-all shadow-lg ${
                            analyzing || isProcessing
                              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed shadow-none'
                              : meeting.summary
                              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-purple-500/25 hover:shadow-xl'
                              : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:shadow-blue-500/25 hover:shadow-xl'
                          }`}
                        >
                          {analyzing || isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {isProcessing ? aiProcessingService.getStatusLabel(meeting.ai_processing_status) : 'Starting analysis...'}
                            </>
                          ) : (
                            <>
                              <Brain className="w-5 h-5" />
                              {meeting.summary ? 'Re-analyze with AI' : 'Analyze Transcript with AI'}
                            </>
                          )}
                        </motion.button>
                        {!meeting.summary && !analyzing && !isProcessing && (
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            Generate summary, key decisions, highlights, and next steps from your transcript
                          </p>
                        )}
                        {analyzeError && (
                          <p className="text-xs text-red-500 font-medium">{analyzeError}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Key Decisions */}
                    {meeting.key_decisions && meeting.key_decisions.length > 0 && (
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                          <Target className="w-5 h-5 text-blue-500" />
                          Key Decisions
                        </h4>
                        <ul className="space-y-2">
                          {meeting.key_decisions.map((decision: string, i: number) => (
                            <li key={i} className={`flex items-start gap-2 p-3 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-xl text-sm`}>
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

                    {/* Next Steps - only show if present on the meeting object */}
                    {meeting.next_steps && meeting.next_steps.length > 0 && (
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                          <ListChecks className="w-4 h-4 text-blue-500" />
                          Next Steps
                        </h4>
                        <ul className="space-y-2">
                          {meeting.next_steps.map((step: string, i: number) => (
                            <li key={i} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
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
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                        <FileText className="w-5 h-5 text-blue-500" />
                        Recording Transcript
                      </h3>
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
                    <div className={`${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'} rounded-xl p-4 max-h-96 overflow-y-auto border ${theme === 'dark' ? 'border-white/5' : 'border-white/50'}`}>
                      {meeting.transcript ? (
                        <pre className={`whitespace-pre-wrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed font-sans`}>
                          {meeting.transcript}
                        </pre>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageSquare className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            No transcript available for this meeting.
                          </p>
                        </div>
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
                    {meeting.transcript && (
                      <div className="mb-4">
                        <motion.button
                          onClick={handleExtractTasks}
                          disabled={extractingTasks}
                          whileHover={!extractingTasks ? { scale: 1.02 } : {}}
                          whileTap={!extractingTasks ? { scale: 0.98 } : {}}
                          className={`w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
                            extractingTasks
                              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:shadow-blue-500/25 hover:shadow-xl'
                          }`}
                        >
                          {extractingTasks ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Analyzing transcript for tasks...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Extract Tasks from Transcript with AI
                            </>
                          )}
                        </motion.button>
                        {!extractingTasks && (
                          <p className={`text-xs text-center mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            AI will analyze the transcript and identify procedures, requests, and tasks
                          </p>
                        )}
                        {extractError && (
                          <p className="text-xs text-red-500 font-medium text-center mt-2">{extractError}</p>
                        )}
                      </div>
                    )}
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
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>No action items for this meeting.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "participants" && hasParticipants && (
                  <motion.div
                    key="participants"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {realParticipants.map((p: any, idx: number) => (
                      <motion.div
                        key={p.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`p-4 ${theme === 'dark' ? 'bg-gray-800/40' : 'bg-white/60'} rounded-xl border ${theme === 'dark' ? 'border-white/5' : 'border-white/50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${getColorForName(p.participant_name)} rounded-full flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <span className="text-white font-bold">{getInitials(p.participant_name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.participant_name}</p>
                              {p.role && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                                  {p.role}
                                </span>
                              )}
                            </div>
                            {p.participant_email && (
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{p.participant_email}</p>
                            )}
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

        {/* Sidebar - only show if there are participants */}
        {hasParticipants && (
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
                Participants ({realParticipants.length})
              </h3>
              <div className="space-y-3">
                {realParticipants.map((participant: any, idx: number) => (
                  <motion.div
                    key={participant.id || idx}
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
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}