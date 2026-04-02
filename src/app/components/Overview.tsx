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
  Sparkles,
  Play,
  Pause,
  Check
} from "lucide-react";
import { MeetingsAreaChart, ActionsLineChart } from "./ChartComponents";
import { useTheme } from "../context/ThemeContext";

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

const priorityActions = [
  {
    id: 1,
    title: "Update API documentation",
    assignee: "Sarah Chen",
    dueDate: "2026-04-02",
    priority: "high",
    status: "in-progress",
  },
  {
    id: 2,
    title: "Review design mockups for v2.0",
    assignee: "Mike Johnson",
    dueDate: "2026-04-02",
    priority: "high",
    status: "pending",
  },
  {
    id: 3,
    title: "Schedule follow-up with Acme Corp",
    assignee: "Emma Wilson",
    dueDate: "2026-04-03",
    priority: "medium",
    status: "completed",
  },
];

export function Overview() {
  const { theme, compactMode } = useTheme();

  return (
    <div className={compactMode ? "space-y-4" : "space-y-6"}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Dashboard Overview
        </h1>
        <p className={`${compactMode ? 'text-sm' : 'text-base mt-1'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Welcome back! Here's what's happening today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${compactMode ? 'gap-3' : 'gap-4'}`}>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.03 }}
            whileHover={{ scale: 1.02 }}
          >
            <Link to={stat.link}>
              <div className={`glass-card ${compactMode ? 'rounded-xl p-4' : 'rounded-2xl p-6'} cursor-pointer`}>
                <div className={`flex items-start justify-between ${compactMode ? 'mb-2' : 'mb-3'}`}>
                  <div className={`${compactMode ? 'p-2' : 'p-3'} rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                    <stat.icon className={`${compactMode ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    stat.trend === "up" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}>
                    {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className={`text-xs font-medium ${compactMode ? 'mb-1' : 'mb-2'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.name}
                </p>
                <p className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${compactMode ? 'gap-3' : 'gap-6'}`}>
        {/* Meetings Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className={`glass-card ${compactMode ? 'rounded-xl p-4' : 'rounded-2xl p-6'}`}
        >
          <div className={`flex items-center justify-between ${compactMode ? 'mb-3' : 'mb-4'}`}>
            <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Weekly Meetings
            </h3>
            <CalendarIcon className={`${compactMode ? 'w-4 h-4' : 'w-5 h-5'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <div className={compactMode ? "h-[160px] w-full" : "h-[200px] w-full"}>
            <MeetingsAreaChart data={meetingData} />
          </div>
        </motion.div>

        {/* Actions Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`glass-card ${compactMode ? 'rounded-xl p-4' : 'rounded-2xl p-6'}`}
        >
          <div className={`flex items-center justify-between ${compactMode ? 'mb-3' : 'mb-4'}`}>
            <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Action Items Trend
            </h3>
            <CheckCircle2 className={`${compactMode ? 'w-4 h-4' : 'w-5 h-5'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <div className={compactMode ? "h-[160px] w-full" : "h-[200px] w-full"}>
            <ActionsLineChart data={actionData} />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Row */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${compactMode ? 'gap-3' : 'gap-6'}`}>
        {/* Recent Meetings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`glass-card ${compactMode ? 'rounded-xl p-4' : 'rounded-2xl p-6'}`}
        >
          <div className={`flex items-center justify-between ${compactMode ? 'mb-3' : 'mb-4'}`}>
            <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Meetings
            </h3>
            <Link to="/meetings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} flex items-center gap-1`}
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </Link>
          </div>
          <div className={compactMode ? "space-y-2" : "space-y-3"}>
            {recentMeetings.slice(0, 3).map((meeting, index) => (
              <Link key={meeting.id} to={`/meetings/${meeting.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${compactMode ? 'p-3 rounded-lg' : 'p-4 rounded-xl'} cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'
                  } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={`${compactMode ? 'p-1.5' : 'p-2'} rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0`}>
                        <Video className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`${compactMode ? 'text-sm' : 'text-base'} font-semibold mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {meeting.title}
                        </h4>
                        <div className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>{meeting.time}</span>
                          <span>•</span>
                          <span>{meeting.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Users className="w-3 h-3" />
                        {meeting.participants}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-bold">
                        {meeting.actions}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`glass-card ${compactMode ? 'rounded-xl p-4' : 'rounded-2xl p-6'}`}
        >
          <div className={`flex items-center justify-between ${compactMode ? 'mb-3' : 'mb-4'}`}>
            <h3 className={`${compactMode ? 'text-sm' : 'text-base'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Priority Actions
            </h3>
            <Link to="/actions">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} flex items-center gap-1`}
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </motion.button>
            </Link>
          </div>
          <div className={compactMode ? "space-y-2" : "space-y-3"}>
            {priorityActions.slice(0, 3).map((action, index) => (
              <Link key={action.id} to={`/actions`}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${compactMode ? 'p-3 rounded-lg' : 'p-4 rounded-xl'} cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'
                  } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 ${
                      action.status === 'completed' 
                        ? 'text-green-500' 
                        : action.status === 'in-progress' 
                        ? 'text-blue-500' 
                        : 'text-yellow-500'
                    }`}>
                      {action.status === 'completed' ? (
                        <Check className={`${compactMode ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      ) : action.status === 'in-progress' ? (
                        <Play className={`${compactMode ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      ) : (
                        <Clock className={`${compactMode ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`${compactMode ? 'text-sm' : 'text-base'} font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {action.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.assignee}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          action.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : action.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}