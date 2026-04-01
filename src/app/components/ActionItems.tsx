import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Clock,
  AlertCircle,
  ChevronDown,
  User,
  Calendar as CalendarIcon,
  Target,
  Zap,
  TrendingUp
} from "lucide-react";

const actionItems = [
  {
    id: 1,
    task: "Finalize mobile optimization technical spec",
    description: "Complete detailed technical specification for mobile performance improvements including lazy loading, image optimization, and bundle size reduction strategies.",
    assignee: { name: "Sarah Chen", avatar: "SC", color: "bg-green-500" },
    meeting: "Product Roadmap Q2 Review",
    meetingId: 1,
    dueDate: "2026-04-05",
    priority: "high",
    status: "completed",
    completedDate: "2026-04-04",
  },
  {
    id: 2,
    task: "Update API documentation",
    description: "Review and update REST API documentation to reflect recent endpoint changes and add examples for new authentication flow.",
    assignee: { name: "Mike Johnson", avatar: "MJ", color: "bg-purple-500" },
    meeting: "Sprint Planning - Week 14",
    meetingId: 2,
    dueDate: "2026-04-02",
    priority: "high",
    status: "in-progress",
  },
  {
    id: 3,
    task: "Create marketing campaign for collaboration features",
    description: "Develop comprehensive marketing strategy including social media content, blog posts, and email campaigns for the new collaboration features launch.",
    assignee: { name: "Emma Wilson", avatar: "EW", color: "bg-orange-500" },
    meeting: "Product Roadmap Q2 Review",
    meetingId: 1,
    dueDate: "2026-04-10",
    priority: "high",
    status: "in-progress",
  },
  {
    id: 4,
    task: "Schedule follow-up with Acme Corp",
    description: "Coordinate calendars and schedule follow-up discovery call to discuss implementation timeline and resource requirements.",
    assignee: { name: "John Doe", avatar: "JD", color: "bg-blue-500" },
    meeting: "Client Discovery Call - Acme Corp",
    meetingId: 3,
    dueDate: "2026-04-03",
    priority: "medium",
    status: "pending",
  },
  {
    id: 5,
    task: "Complete analytics dashboard wireframes",
    description: "Design wireframes for the new analytics dashboard including data visualization components, filter options, and export functionality.",
    assignee: { name: "Mike Johnson", avatar: "MJ", color: "bg-purple-500" },
    meeting: "Product Roadmap Q2 Review",
    meetingId: 1,
    dueDate: "2026-04-08",
    priority: "medium",
    status: "completed",
    completedDate: "2026-04-07",
  },
  {
    id: 6,
    task: "Review design mockups for v2.0",
    description: "Conduct thorough review of all design mockups for version 2.0 release and provide detailed feedback on user experience and visual design.",
    assignee: { name: "Sarah Chen", avatar: "SC", color: "bg-green-500" },
    meeting: "Design System Review",
    meetingId: 4,
    dueDate: "2026-04-02",
    priority: "high",
    status: "in-progress",
  },
];

const priorityConfig = {
  high: { color: "from-red-500 to-pink-500", icon: AlertCircle, label: "High" },
  medium: { color: "from-orange-500 to-yellow-500", icon: Clock, label: "Medium" },
  low: { color: "from-blue-500 to-cyan-500", icon: Circle, label: "Low" },
};

const statusConfig = {
  completed: { color: "from-green-500 to-emerald-500", icon: CheckCircle2, label: "Completed" },
  "in-progress": { color: "from-purple-500 to-pink-500", icon: Zap, label: "In Progress" },
  pending: { color: "from-gray-500 to-gray-600", icon: Circle, label: "Pending" },
};

export function ActionItems() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredItems = actionItems.filter(item => {
    if (selectedStatus && item.status !== selectedStatus) return false;
    if (searchQuery && !item.task.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = [
    { label: "Total Tasks", value: actionItems.length, icon: Target, color: "from-blue-500 to-cyan-500" },
    { label: "In Progress", value: actionItems.filter(i => i.status === "in-progress").length, icon: Zap, color: "from-purple-500 to-pink-500" },
    { label: "Completed", value: actionItems.filter(i => i.status === "completed").length, icon: CheckCircle2, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          Action Items
        </h1>
        <p className="text-gray-600 mt-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          Track and manage all your tasks
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative group"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`} />
            <div className="relative glass rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 overflow-x-auto pb-2"
      >
        {[
          { label: "All Tasks", value: null },
          { label: "In Progress", value: "in-progress" },
          { label: "Completed", value: "completed" },
          { label: "Pending", value: "pending" },
        ].map((filter) => (
          <motion.button
            key={filter.label}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedStatus(filter.value)}
            className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedStatus === filter.value
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                : "glass hover:bg-white text-gray-700"
            }`}
          >
            {filter.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl p-4 shadow-xl"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 w-full bg-white/80 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </motion.div>

      {/* Action Items List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const PriorityIcon = priorityConfig[item.priority].icon;
            const StatusIcon = statusConfig[item.status].icon;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.01, y: -3 }}
                className="group relative"
              >
                {/* Hover Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${priorityConfig[item.priority].color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />

                <div className="relative glass rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${statusConfig[item.status].color} flex items-center justify-center shadow-lg`}
                    >
                      <StatusIcon className="w-5 h-5 text-white" />
                    </motion.button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                          {item.task}
                        </h3>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${priorityConfig[item.priority].color} text-white text-xs font-bold shadow-lg flex-shrink-0`}
                        >
                          <PriorityIcon className="w-3 h-3" />
                          {priorityConfig[item.priority].label}
                        </motion.div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className={`w-7 h-7 ${item.assignee.color} rounded-full flex items-center justify-center shadow-md`}
                          >
                            <span className="text-white text-xs font-bold">{item.assignee.avatar}</span>
                          </motion.div>
                          <span className="text-gray-700 font-medium">{item.assignee.name}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                          <CalendarIcon className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700 font-medium">Due: {item.dueDate}</span>
                        </div>

                        <Link 
                          to={`/meetings/${item.meetingId}`}
                          className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700 font-medium text-xs">{item.meeting}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-16 text-center shadow-xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Target className="w-16 h-16 text-gray-400" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No action items found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  );
}
