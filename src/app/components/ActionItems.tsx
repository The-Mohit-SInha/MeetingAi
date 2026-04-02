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
  Calendar,
  Target,
  Zap,
  TrendingUp,
  Flag,
  Video
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [priorityFilterOpen, setPriorityFilterOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");

  const filteredActions = actionItems.filter((action) => {
    const matchesSearch = action.task.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedFilter === "all" || action.status === selectedFilter;
    const matchesPriority = selectedPriority === "all" || action.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: actionItems.length,
    completed: actionItems.filter(a => a.status === 'completed').length,
    inProgress: actionItems.filter(a => a.status === 'in-progress').length,
    pending: actionItems.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Action Items
        </h1>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Track and manage action items from meetings
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {Object.entries(statusConfig).map(([key, config], index) => {
          const count = stats[key as keyof typeof stats];
          const Icon = config.icon;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.color}`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {config.label}
                </span>
              </div>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {count}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none text-sm ${
                  theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'
              } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2 text-sm`}
            >
              <Filter className="w-4 h-4" />
              Status
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
                    {['all', 'completed', 'in-progress', 'pending'].map((filter) => (
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
                        {filter === 'all' ? 'All' : statusConfig[filter as keyof typeof statusConfig].label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setPriorityFilterOpen(!priorityFilterOpen)}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white/80 hover:bg-white'
              } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-2 text-sm`}
            >
              <Flag className="w-4 h-4" />
              Priority
              <ChevronDown className={`w-4 h-4 transition-transform ${priorityFilterOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {priorityFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-xl z-10`}
                >
                  <div className="p-2">
                    {['all', 'high', 'medium', 'low'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => {
                          setSelectedPriority(priority);
                          setPriorityFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                          selectedPriority === priority
                            ? 'bg-blue-500 text-white'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Action Items List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        {filteredActions.map((action, index) => {
          const StatusIcon = statusConfig[action.status].icon;
          const statusColor = statusConfig[action.status].color;
          
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              className="glass-card rounded-xl p-4 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className={`p-2 rounded-lg bg-gradient-to-br ${statusColor} flex-shrink-0`}>
                  <StatusIcon className="w-4 h-4 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {action.task}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                      action.priority === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : action.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {action.priority}
                    </span>
                  </div>

                  <div className={`flex items-center gap-3 flex-wrap text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {action.assignee.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due: {action.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {action.meeting}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {action.status === 'in-progress' && (
                    <div className="mt-2">
                      <div className={`h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${action.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-8 text-center"
        >
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No action items found matching your filters
          </p>
        </motion.div>
      )}
    </div>
  );
}