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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Meetings
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            View and manage all your meetings
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Schedule Meeting
        </motion.button>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full bg-white/80 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-5 py-3 bg-white/80 border border-white/50 rounded-xl hover:bg-white transition-all"
              >
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Filter</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </motion.button>
              
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-2xl z-10"
                  >
                    <div className="p-2">
                      {["all", "today", "this-week", "last-week"].map((filter) => (
                        <motion.button
                          key={filter}
                          whileHover={{ x: 5 }}
                          onClick={() => {
                            setSelectedFilter(filter);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedFilter === filter
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                              : "text-gray-700 hover:bg-white/60"
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1).replace("-", " ")}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 bg-white/80 border border-white/50 rounded-xl hover:bg-white transition-all"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline text-gray-700 font-medium">Export</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            
            <Link
              to={`/meetings/${meeting.id}`}
              className="relative block glass rounded-2xl p-6 hover:shadow-2xl transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                    {meeting.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {meeting.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        whileHover={{ scale: 1.1 }}
                        className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200/50"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
                    meeting.status === "completed"
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                      : "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                  }`}
                >
                  {meeting.status}
                </motion.div>
              </div>

              {/* Meeting Info */}
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{meeting.date}</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">{meeting.time} ({meeting.duration})</span>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-600" />
                  <div className="flex -space-x-3">
                    {meeting.participants.slice(0, 3).map((participant, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                        className={`w-10 h-10 ${participant.color} rounded-full border-3 border-white flex items-center justify-center shadow-lg cursor-pointer`}
                        title={participant.name}
                      >
                        <span className="text-white text-sm font-bold">{participant.avatar}</span>
                      </motion.div>
                    ))}
                    {meeting.participants.length > 3 && (
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">
                          +{meeting.participants.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Items Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Action Items
                  </div>
                  <span className="text-gray-600 font-bold">
                    {meeting.completed}/{meeting.actions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(meeting.completed / meeting.actions) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
