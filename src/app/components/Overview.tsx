import { Link } from "react-router";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Video, 
  CheckCircle2, 
  Clock, 
  Users,
  Calendar as CalendarIcon,
  AlertCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { MeetingsAreaChart, ActionsLineChart } from "./ChartComponents";

const stats = [
  {
    name: "Total Meetings",
    value: "147",
    change: "+12.5%",
    trend: "up",
    icon: Video,
    gradient: "from-blue-500 to-cyan-500",
    link: "/meetings",
  },
  {
    name: "Action Items",
    value: "89",
    change: "-5.2%",
    trend: "down",
    icon: CheckCircle2,
    gradient: "from-green-500 to-emerald-500",
    link: "/actions",
  },
  {
    name: "Pending Tasks",
    value: "34",
    change: "+8.1%",
    trend: "up",
    icon: Clock,
    gradient: "from-orange-500 to-red-500",
    link: "/actions",
  },
  {
    name: "Active Participants",
    value: "24",
    change: "+3",
    trend: "up",
    icon: Users,
    gradient: "from-purple-500 to-pink-500",
    link: "/participants",
  },
];

const meetingData = [
  { day: "Mon", meetings: 4, id: "mon" },
  { day: "Tue", meetings: 6, id: "tue" },
  { day: "Wed", meetings: 3, id: "wed" },
  { day: "Thu", meetings: 8, id: "thu" },
  { day: "Fri", meetings: 5, id: "fri" },
  { day: "Sat", meetings: 1, id: "sat" },
  { day: "Sun", meetings: 0, id: "sun" },
];

const actionData = [
  { week: "Week 1", created: 24, completed: 20, id: "wk1" },
  { week: "Week 2", created: 32, completed: 28, id: "wk2" },
  { week: "Week 3", created: 28, completed: 30, id: "wk3" },
  { week: "Week 4", created: 35, completed: 32, id: "wk4" },
];

const recentMeetings = [
  {
    id: 1,
    title: "Product Roadmap Q2 Review",
    date: "2026-03-31",
    time: "2:00 PM",
    duration: "45 min",
    participants: 8,
    actions: 5,
    status: "completed",
  },
  {
    id: 2,
    title: "Sprint Planning - Week 14",
    date: "2026-03-30",
    time: "10:00 AM",
    duration: "60 min",
    participants: 12,
    actions: 8,
    status: "completed",
  },
  {
    id: 3,
    title: "Client Discovery Call - Acme Corp",
    date: "2026-03-29",
    time: "3:30 PM",
    duration: "30 min",
    participants: 4,
    actions: 3,
    status: "completed",
  },
  {
    id: 4,
    title: "Design System Review",
    date: "2026-03-28",
    time: "11:00 AM",
    duration: "90 min",
    participants: 6,
    actions: 12,
    status: "completed",
  },
];

const urgentActions = [
  {
    id: 1,
    task: "Update API documentation",
    assignee: "Sarah Chen",
    dueDate: "2026-04-02",
    priority: "high",
  },
  {
    id: 2,
    task: "Review design mockups for v2.0",
    assignee: "Mike Johnson",
    dueDate: "2026-04-02",
    priority: "high",
  },
  {
    id: 3,
    task: "Schedule follow-up with Acme Corp",
    assignee: "Emma Wilson",
    dueDate: "2026-04-03",
    priority: "medium",
  },
];

export function Overview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Welcome back! Here's what's happening with your meetings.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link
            key={stat.name}
            to={stat.link}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group cursor-pointer"
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`} />
              
              <div className="relative glass rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className={`bg-gradient-to-br ${stat.gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
                <div className="flex items-center gap-1 text-sm text-blue-600 font-semibold mt-3 group-hover:gap-2 transition-all">
                  View all
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings This Week */}
        <motion.div
          key="overview-chart-meetings"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass rounded-2xl p-6 shadow-xl"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
            Meetings This Week
          </h3>
          <MeetingsAreaChart data={meetingData} />
        </motion.div>

        {/* Action Items Trend */}
        <motion.div
          key="overview-chart-actions"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass rounded-2xl p-6 shadow-xl"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full" />
            Action Items Trend
          </h3>
          <ActionsLineChart data={actionData} />
        </motion.div>
      </div>

      {/* Recent Meetings & Urgent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Meetings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="lg:col-span-2 glass rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Meetings</h3>
            <Link to="/meetings" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold group">
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ x: 5, scale: 1.01 }}
              >
                <Link
                  to={`/meetings/${meeting.id}`}
                  className="block p-4 bg-white/60 rounded-xl hover:bg-white transition-all border border-white/50 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{meeting.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {meeting.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.participants}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full">
                      {meeting.actions} actions
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Urgent Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Urgent Actions</h3>
            <Link to="/actions" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold group">
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {urgentActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-3 bg-white/60 rounded-xl border border-white/50"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    action.priority === "high" ? "text-red-500" : "text-orange-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{action.task}</p>
                    <p className="text-xs text-gray-600 mt-1">{action.assignee}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {action.dueDate}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}