import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, Calendar, CheckSquare, Users, ArrowUp, ArrowDown } from "lucide-react";
import { MeetingsTrendChart, ActionsPieChart, DurationBarChart, CompletionLineChart } from "./ChartComponents";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";

const meetingsByMonth = [
  { month: "Oct", meetings: 28, actions: 45, id: "oct" },
  { month: "Nov", meetings: 32, actions: 52, id: "nov" },
  { month: "Dec", meetings: 25, actions: 38, id: "dec" },
  { month: "Jan", meetings: 35, actions: 58, id: "jan" },
  { month: "Feb", meetings: 38, actions: 62, id: "feb" },
  { month: "Mar", meetings: 42, actions: 71, id: "mar" },
];

const actionsByStatus = [
  { name: "Completed", value: 156, color: "#10b981", id: "completed" },
  { name: "In Progress", value: 45, color: "#3b82f6", id: "in-progress" },
  { name: "Pending", value: 28, color: "#f59e0b", id: "pending" },
];

const meetingDuration = [
  { duration: "0-30 min", count: 45, id: "d1" },
  { duration: "30-60 min", count: 68, id: "d2" },
  { duration: "60-90 min", count: 24, id: "d3" },
  { duration: "90+ min", count: 10, id: "d4" },
];

const participantEngagement = [
  { name: "Sarah Chen", meetings: 42, actions: 28, id: "sc" },
  { name: "John Doe", meetings: 38, actions: 25, id: "jd" },
  { name: "Mike Johnson", meetings: 35, actions: 31, id: "mj" },
  { name: "Emma Wilson", meetings: 32, actions: 22, id: "ew" },
  { name: "David Lee", meetings: 28, actions: 19, id: "dl" },
];

const completionRate = [
  { week: "Week 1", rate: 85, id: "w1" },
  { week: "Week 2", rate: 78, id: "w2" },
  { week: "Week 3", rate: 92, id: "w3" },
  { week: "Week 4", rate: 88, id: "w4" },
];

export function Analytics() {
  const { theme } = useTheme();

  const stats = [
    { name: "Total Meetings", value: "147", change: "+12%", trend: "up", icon: Calendar, gradient: "from-blue-500 to-cyan-500" },
    { name: "Action Items", value: "229", change: "+8%", trend: "up", icon: CheckSquare, gradient: "from-green-500 to-emerald-500" },
    { name: "Avg Completion", value: "92%", change: "+5%", trend: "up", icon: TrendingUp, gradient: "from-purple-500 to-pink-500" },
    { name: "Active Users", value: "24", change: "-2%", trend: "down", icon: Users, gradient: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Analytics
        </h1>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Insights and metrics from your meetings
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                stat.trend === "up" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}>
                {stat.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {stat.name}
            </h3>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meeting & Action Trends
          </h3>
          <MeetingsTrendChart data={meetingsByMonth} />
        </motion.div>

        {/* Actions Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Actions by Status
          </h3>
          <ActionsPieChart data={actionsByStatus} />
        </motion.div>

        {/* Meeting Duration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meeting Duration Distribution
          </h3>
          <DurationBarChart data={meetingDuration} />
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Weekly Completion Rate
          </h3>
          <CompletionLineChart data={completionRate} />
        </motion.div>
      </div>

      {/* Participant Engagement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Top Participants
        </h3>
        <div className="space-y-4">
          {participantEngagement.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
              } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {participant.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {participant.name}
                </h4>
                <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>{participant.meetings} meetings</span>
                  <span>{participant.actions} actions</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                #{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}