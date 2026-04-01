import { useParams, Link } from "react-router";
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
  Sparkles
} from "lucide-react";
import { useState } from "react";

const meetingData = {
  1: {
    title: "Product Roadmap Q2 Review",
    date: "2026-03-31",
    time: "2:00 PM - 2:45 PM",
    duration: "45 min",
    status: "completed",
    participants: [
      { name: "John Doe", role: "Product Manager", avatar: "JD", color: "bg-blue-500" },
      { name: "Sarah Chen", role: "Engineering Lead", avatar: "SC", color: "bg-green-500" },
      { name: "Mike Johnson", role: "Designer", avatar: "MJ", color: "bg-purple-500" },
      { name: "Emma Wilson", role: "Marketing", avatar: "EW", color: "bg-orange-500" },
    ],
    summary: "Discussed the product roadmap for Q2 2026, including feature prioritization, resource allocation, and timeline adjustments. Team aligned on major deliverables and identified potential blockers.",
    keyPoints: [
      "Q2 focus on mobile optimization and performance improvements",
      "New collaboration features to be released in April",
      "Analytics dashboard redesign scheduled for May",
      "Budget approved for two additional engineering hires",
    ],
    transcript: `[00:00] John Doe: Good afternoon everyone, let's get started with our Q2 roadmap review.

[00:32] Sarah Chen: Thanks for organizing this. I've prepared an overview of our technical capabilities for the upcoming quarter.

[01:15] John Doe: Perfect. Let's start with the mobile optimization initiative. Sarah, can you walk us through the technical approach?

[02:00] Sarah Chen: Absolutely. We're planning to implement lazy loading, optimize images, and reduce bundle sizes. We estimate this will improve load times by 40%.

[03:20] Mike Johnson: From a design perspective, we've created responsive components that adapt seamlessly across devices.

[04:15] Emma Wilson: That's great. Marketing will need at least two weeks notice before launch to prepare our campaigns.

[05:30] John Doe: Noted. Let's move to the collaboration features. Mike, can you present the mockups?

[06:45] Mike Johnson: Sure. We've designed real-time commenting, version history, and @mentions functionality.

[08:00] Sarah Chen: The technical implementation is straightforward. We can leverage WebSockets for real-time updates.

[09:15] Emma Wilson: This aligns perfectly with our Q2 marketing narrative around team productivity.

[10:30] John Doe: Excellent. Now for the analytics dashboard - this is a bigger lift.`,
    actionItems: [
      {
        id: 1,
        task: "Finalize mobile optimization technical spec",
        assignee: "Sarah Chen",
        dueDate: "2026-04-05",
        priority: "high",
        status: "completed",
      },
      {
        id: 2,
        task: "Create marketing campaign for collaboration features",
        assignee: "Emma Wilson",
        dueDate: "2026-04-10",
        priority: "high",
        status: "completed",
      },
      {
        id: 3,
        task: "Complete analytics dashboard wireframes",
        assignee: "Mike Johnson",
        dueDate: "2026-04-08",
        priority: "medium",
        status: "completed",
      },
      {
        id: 4,
        task: "Schedule interviews for engineering positions",
        assignee: "John Doe",
        dueDate: "2026-04-15",
        priority: "medium",
        status: "in-progress",
      },
      {
        id: 5,
        task: "Prepare Q2 budget allocation document",
        assignee: "John Doe",
        dueDate: "2026-04-12",
        priority: "low",
        status: "pending",
      },
    ],
  },
  2: {
    title: "Sprint Planning - Week 14",
    date: "2026-03-30",
    time: "10:00 AM - 11:00 AM",
    duration: "60 min",
    status: "completed",
    participants: [
      { name: "Emma Wilson", role: "Scrum Master", avatar: "EW", color: "bg-orange-500" },
      { name: "David Lee", role: "Developer", avatar: "DL", color: "bg-pink-500" },
      { name: "Lisa Wang", role: "QA Engineer", avatar: "LW", color: "bg-indigo-500" },
    ],
    summary: "Sprint planning session for Week 14 development cycle. Reviewed backlog items, estimated story points, and assigned tasks to team members.",
    keyPoints: [
      "8 user stories selected for the sprint",
      "Total of 34 story points committed",
      "Focus on API improvements and bug fixes",
      "Sprint demo scheduled for Friday",
    ],
    transcript: "Sprint planning transcript...",
    actionItems: [
      {
        id: 1,
        task: "Update API documentation",
        assignee: "David Lee",
        dueDate: "2026-04-02",
        priority: "high",
        status: "in-progress",
      },
    ],
  },
  3: {
    title: "Client Discovery Call - Acme Corp",
    date: "2026-03-29",
    time: "3:30 PM - 4:00 PM",
    duration: "30 min",
    status: "completed",
    participants: [
      { name: "Tom Harris", role: "Sales Lead", avatar: "TH", color: "bg-red-500" },
      { name: "Rachel Green", role: "Account Manager", avatar: "RG", color: "bg-teal-500" },
    ],
    summary: "Initial discovery call with Acme Corp to understand their requirements and pain points.",
    keyPoints: [
      "Company has 500+ employees",
      "Looking for meeting automation solution",
      "Budget approved for Q2 implementation",
      "Timeline: 3-month pilot program",
    ],
    transcript: "Discovery call transcript...",
    actionItems: [
      {
        id: 1,
        task: "Schedule follow-up with Acme Corp",
        assignee: "Tom Harris",
        dueDate: "2026-04-03",
        priority: "medium",
        status: "pending",
      },
    ],
  },
  4: {
    title: "Design System Review",
    date: "2026-03-28",
    time: "11:00 AM - 12:30 PM",
    duration: "90 min",
    status: "completed",
    participants: [
      { name: "Alex Turner", role: "Design Lead", avatar: "AT", color: "bg-yellow-500" },
      { name: "Maya Patel", role: "UI Designer", avatar: "MP", color: "bg-cyan-500" },
      { name: "Chris Anderson", role: "Frontend Dev", avatar: "CA", color: "bg-lime-500" },
    ],
    summary: "Comprehensive review of the design system components and guidelines.",
    keyPoints: [
      "Updated color palette for better accessibility",
      "New component library structure",
      "Documentation improvements",
      "Migration plan for existing projects",
    ],
    transcript: "Design review transcript...",
    actionItems: [
      {
        id: 1,
        task: "Review design mockups for v2.0",
        assignee: "Maya Patel",
        dueDate: "2026-04-02",
        priority: "high",
        status: "in-progress",
      },
    ],
  },
};

export function MeetingDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "actions">("summary");
  
  const meeting = meetingData[id as keyof typeof meetingData];

  if (!meeting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="glass rounded-2xl p-12 text-center shadow-xl">
          <p className="text-gray-600 text-lg mb-4">Meeting not found</p>
          <Link to="/meetings" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to Meetings
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Meetings
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {meeting.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                {meeting.date}
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-purple-600" />
                {meeting.time}
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                meeting.status === "completed"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
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
              className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-white transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 glass rounded-xl hover:bg-white transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>

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
            <div className="border-b border-white/30">
              <div className="flex">
                {(["summary", "transcript", "actions"] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    whileHover={{ y: -2 }}
                    className={`px-6 py-4 font-semibold transition-all relative ${
                      activeTab === tab
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
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
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Meeting Summary
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{meeting.summary}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Key Points</h3>
                      <ul className="space-y-3">
                        {meeting.keyPoints.map((point, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex gap-3"
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{point}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
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
                      <h3 className="font-bold text-gray-900">Recording Transcript</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
                      >
                        <Play className="w-4 h-4" />
                        Play Recording
                      </motion.button>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {meeting.transcript}
                      </pre>
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
                    {meeting.actionItems.map((action, idx) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-white/60 rounded-xl hover:bg-white transition-all border border-white/50"
                      >
                        <div className="flex items-start gap-3">
                          {action.status === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              action.status === "completed" ? "text-gray-500 line-through" : "text-gray-900"
                            }`}>
                              {action.task}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                              <span className="text-gray-600">Assigned to: {action.assignee}</span>
                              <span className="text-gray-600">Due: {action.dueDate}</span>
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
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Participants ({meeting.participants.length})
            </h3>
            <div className="space-y-3">
              {meeting.participants.map((participant, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/60 rounded-xl"
                >
                  <div className={`w-10 h-10 ${participant.color} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-sm font-bold">{participant.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{participant.name}</p>
                    <p className="text-xs text-gray-600">{participant.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}