import { AlertCircle, Clock, Circle, CheckCircle2, ChevronDown, Search, Filter, User, Link2, Calendar, Flag, Loader2, Video, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { actionItemsAPI } from "../services/apiWrapper";

const priorityConfig = {
  high: { color: "from-red-500 to-pink-500", icon: AlertCircle, label: "High" },
  medium: { color: "from-orange-500 to-yellow-500", icon: Clock, label: "Medium" },
  low: { color: "from-blue-500 to-cyan-500", icon: Circle, label: "Low" },
};

const statusConfig = {
  completed: { color: "from-green-500 to-emerald-500", icon: CheckCircle2, label: "Completed" },
  in_progress: { color: "from-blue-500 to-indigo-500", icon: Clock, label: "In Progress" },
  todo: { color: "from-gray-500 to-slate-500", icon: Circle, label: "To Do" },
};

export function ActionItems() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [priorityFilterOpen, setPriorityFilterOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionItems, setActionItems] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchActionItems();
    }
  }, [user]);

  const fetchActionItems = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const data = await actionItemsAPI.getAll(user.id);
      setActionItems(data.map((item: any) => ({
        ...item,
        task: item.title,
        assignee: {
          name: item.assignee,
          email: item.assignee,
          avatar: item.assignee.split(' ').map((n: string) => n[0]).join(''),
          color: `bg-${['blue', 'green', 'purple', 'orange', 'pink'][Math.floor(Math.random() * 5)]}-500`,
        },
        meeting: null,
        meetingId: item.meeting_id,
        dueDate: item.due_date,
      })));
    } catch (error) {
      console.error("Error fetching action items:", error);
      setActionItems([]);
    } finally {
      setLoading(false);
    }
  };

  const [draggingAction, setDraggingAction] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<Record<string, number>>({});

  const handleProgressDragStart = (actionId: string, currentProgress: number) => {
    setDraggingAction(actionId);
    setTempProgress(prev => ({ ...prev, [actionId]: currentProgress }));
  };

  const handleProgressDrag = (actionId: string, newProgress: number) => {
    setTempProgress(prev => ({ ...prev, [actionId]: newProgress }));
  };

  const handleProgressDragEnd = async (actionId: string, newProgress: number) => {
    if (!user) return;
    setDraggingAction(null);

    try {
      // Determine status based on progress
      let newStatus: 'todo' | 'in_progress' | 'completed' = 'todo';
      if (newProgress === 100) {
        newStatus = 'completed';
      } else if (newProgress > 0) {
        newStatus = 'in_progress';
      }

      // Optimistic update
      setActionItems(prev => prev.map(item =>
        item.id === actionId
          ? { ...item, progress: newProgress, status: newStatus }
          : item
      ));

      await actionItemsAPI.update(actionId, {
        progress: newProgress,
        status: newStatus
      }, user.id);
    } catch (error) {
      console.error("Error updating progress:", error);
      // Revert on error
      await fetchActionItems();
    }
  };

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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No action items found
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {actionItems.length === 0 ? 'Create your first action item from a meeting' : 'Try adjusting your filters'}
            </p>
          </div>
        ) :
          filteredActions.map((action, index) => {
            const StatusIcon = statusConfig[action.status]?.icon || Circle;
            const statusColor = statusConfig[action.status]?.color || "from-gray-500 to-slate-500";
            const isAssignedToCurrentUser = user && (action.assignee.email === user.email || action.assignee.name === user.email);
            const isDragging = draggingAction === action.id;
            const displayProgress = isDragging
              ? (tempProgress[action.id] ?? action.progress ?? 0)
              : (action.status === 'completed' ? 100 : (action.progress || 0));

            return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                {/* Assignee Avatar */}
                <div className={`w-9 h-9 rounded-full ${action.assignee.color} flex items-center justify-center flex-shrink-0 shadow`}>
                  <span className="text-white text-xs font-bold">{action.assignee.avatar}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
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

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`flex-1 h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <motion.div
                          animate={{ width: `${displayProgress}%` }}
                          transition={{ duration: isDragging ? 0 : 0.3 }}
                          className={`h-full rounded-full ${
                            displayProgress === 100
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                              : displayProgress > 0
                              ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-semibold min-w-[2.5rem] text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {displayProgress}%
                      </span>
                    </div>

                    {/* Draggable progress slider (only for assigned user) */}
                    {isAssignedToCurrentUser && action.status !== 'completed' && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-3.5 h-3.5 flex-shrink-0 ${isDragging ? 'text-blue-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div className="relative flex-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={displayProgress}
                              onMouseDown={() => handleProgressDragStart(action.id, displayProgress)}
                              onTouchStart={() => handleProgressDragStart(action.id, displayProgress)}
                              onChange={(e) => handleProgressDrag(action.id, parseInt(e.target.value))}
                              onMouseUp={(e) => handleProgressDragEnd(action.id, parseInt(e.currentTarget.value))}
                              onTouchEnd={(e) => handleProgressDragEnd(action.id, parseInt(e.currentTarget.value))}
                              className={`w-full h-2 rounded-lg appearance-none cursor-grab active:cursor-grabbing ${
                                isDragging ? 'outline outline-2 outline-blue-500' : ''
                              }`}
                              style={{
                                background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${displayProgress}%, ${theme === 'dark' ? '#374151' : '#e5e7eb'} ${displayProgress}%, ${theme === 'dark' ? '#374151' : '#e5e7eb'} 100%)`
                              }}
                            />
                          </div>
                        </div>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          Drag to update progress
                        </p>
                      </div>
                    )}
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
                    {action.meetingId && (
                      <Link
                        to={`/meetings/${action.meetingId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Video className="w-3 h-3" />
                        From meeting
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
        }
      </motion.div>
    </div>
  );
}