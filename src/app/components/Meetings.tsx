import { Link } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  CheckCircle2,
  Video,
  ChevronDown,
  Download,
  Plus,
  TrendingUp
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const meetings = [
  {
    id: 1,
    title: "Product Roadmap Q2 Review",
    date: "2026-03-31",
    time: "2:00 PM",
    duration: "45 min",
    participants: [
      { name: "John Doe", avatar: "JD", color: "bg-blue-500" },
      { name: "Sarah Chen", avatar: "SC", color: "bg-green-500" },
      { name: "Mike Johnson", avatar: "MJ", color: "bg-purple-500" },
    ],
    actions: 5,
    completed: 3,
    status: "completed",
    tags: ["Product", "Quarterly"],
  },
  {
    id: 2,
    title: "Sprint Planning - Week 14",
    date: "2026-03-30",
    time: "10:00 AM",
    duration: "60 min",
    participants: [
      { name: "Emma Wilson", avatar: "EW", color: "bg-orange-500" },
      { name: "David Lee", avatar: "DL", color: "bg-pink-500" },
      { name: "Lisa Wang", avatar: "LW", color: "bg-indigo-500" },
    ],
    actions: 8,
    completed: 6,
    status: "completed",
    tags: ["Development", "Sprint"],
  },
  {
    id: 3,
    title: "Client Discovery Call - Acme Corp",
    date: "2026-03-29",
    time: "3:30 PM",
    duration: "30 min",
    participants: [
      { name: "Tom Harris", avatar: "TH", color: "bg-red-500" },
      { name: "Rachel Green", avatar: "RG", color: "bg-teal-500" },
    ],
    actions: 3,
    completed: 3,
    status: "completed",
    tags: ["Sales", "Client"],
  },
  {
    id: 4,
    title: "Design System Review",
    date: "2026-03-28",
    time: "11:00 AM",
    duration: "90 min",
    participants: [
      { name: "Alex Turner", avatar: "AT", color: "bg-yellow-500" },
      { name: "Maya Patel", avatar: "MP", color: "bg-cyan-500" },
      { name: "Chris Anderson", avatar: "CA", color: "bg-lime-500" },
    ],
    actions: 12,
    completed: 9,
    status: "completed",
    tags: ["Design", "Review"],
  },
  {
    id: 5,
    title: "Marketing Campaign Kickoff",
    date: "2026-03-27",
    time: "1:00 PM",
    duration: "45 min",
    participants: [
      { name: "Nina Rodriguez", avatar: "NR", color: "bg-rose-500" },
      { name: "Sam Foster", avatar: "SF", color: "bg-violet-500" },
    ],
    actions: 6,
    completed: 2,
    status: "completed",
    tags: ["Marketing", "Campaign"],
  },
  {
    id: 6,
    title: "Technical Architecture Discussion",
    date: "2026-03-26",
    time: "4:00 PM",
    duration: "120 min",
    participants: [
      { name: "Kevin Park", avatar: "KP", color: "bg-amber-500" },
      { name: "Olivia Martinez", avatar: "OM", color: "bg-emerald-500" },
      { name: "Brian Scott", avatar: "BS", color: "bg-fuchsia-500" },
    ],
    actions: 15,
    completed: 10,
    status: "completed",
    tags: ["Engineering", "Architecture"],
  },
];

export function Meetings() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meetings
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage and review your meeting history
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </motion.button>
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
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>147</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>This Week</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>12</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Hours</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>68.5</p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Participants</p>
            <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>24</p>
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
        {meetings.map((meeting, index) => (
          <Link key={meeting.id} to={`/meetings/${meeting.id}`}>
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
                    <h3 className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {meeting.title}
                    </h3>
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
                    <div className="flex gap-1.5 mt-2">
                      {meeting.tags.map((tag) => (
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
        ))}
      </motion.div>
    </div>
  );
}