import { useState } from "react";
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";

const participants = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Engineering Lead",
    department: "Engineering",
    avatar: "SC",
    color: "bg-green-500",
    stats: {
      meetings: 42,
      actions: 28,
      completionRate: 95,
      avgResponseTime: "2.3 hours",
    },
  },
  {
    id: 2,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Product Manager",
    department: "Product",
    avatar: "JD",
    color: "bg-blue-500",
    stats: {
      meetings: 38,
      actions: 25,
      completionRate: 88,
      avgResponseTime: "3.1 hours",
    },
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "Senior Designer",
    department: "Design",
    avatar: "MJ",
    color: "bg-purple-500",
    stats: {
      meetings: 35,
      actions: 31,
      completionRate: 92,
      avgResponseTime: "1.8 hours",
    },
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma.wilson@company.com",
    role: "Marketing Manager",
    department: "Marketing",
    avatar: "EW",
    color: "bg-orange-500",
    stats: {
      meetings: 32,
      actions: 22,
      completionRate: 85,
      avgResponseTime: "4.2 hours",
    },
  },
  {
    id: 5,
    name: "David Lee",
    email: "david.lee@company.com",
    role: "Backend Engineer",
    department: "Engineering",
    avatar: "DL",
    color: "bg-pink-500",
    stats: {
      meetings: 28,
      actions: 19,
      completionRate: 90,
      avgResponseTime: "2.7 hours",
    },
  },
  {
    id: 6,
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    role: "UX Researcher",
    department: "Design",
    avatar: "LW",
    color: "bg-indigo-500",
    stats: {
      meetings: 26,
      actions: 18,
      completionRate: 94,
      avgResponseTime: "3.5 hours",
    },
  },
  {
    id: 7,
    name: "Tom Harris",
    email: "tom.harris@company.com",
    role: "Sales Director",
    department: "Sales",
    avatar: "TH",
    color: "bg-red-500",
    stats: {
      meetings: 45,
      actions: 15,
      completionRate: 78,
      avgResponseTime: "5.1 hours",
    },
  },
  {
    id: 8,
    name: "Rachel Green",
    email: "rachel.green@company.com",
    role: "Account Manager",
    department: "Sales",
    avatar: "RG",
    color: "bg-teal-500",
    stats: {
      meetings: 31,
      actions: 20,
      completionRate: 86,
      avgResponseTime: "3.8 hours",
    },
  },
  {
    id: 9,
    name: "Alex Turner",
    email: "alex.turner@company.com",
    role: "Frontend Engineer",
    department: "Engineering",
    avatar: "AT",
    color: "bg-yellow-500",
    stats: {
      meetings: 29,
      actions: 24,
      completionRate: 91,
      avgResponseTime: "2.1 hours",
    },
  },
  {
    id: 10,
    name: "Maya Patel",
    email: "maya.patel@company.com",
    role: "Product Designer",
    department: "Design",
    avatar: "MP",
    color: "bg-cyan-500",
    stats: {
      meetings: 27,
      actions: 26,
      completionRate: 96,
      avgResponseTime: "1.5 hours",
    },
  },
];

export function Participants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const departments = ["all", ...Array.from(new Set(participants.map(p => p.department)))];

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch = 
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || participant.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Participants</h1>
        <p className="text-gray-600 mt-1">View and manage meeting participants</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{participants.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Meetings per Person</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {Math.round(participants.reduce((sum, p) => sum + p.stats.meetings, 0) / participants.length)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Completion Rate</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">
                {Math.round(participants.reduce((sum, p) => sum + p.stats.completionRate, 0) / participants.length)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredParticipants.map((participant) => (
          <div
            key={participant.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className={`w-16 h-16 ${participant.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xl font-medium">{participant.avatar}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg">{participant.name}</h3>
                <p className="text-sm text-gray-600">{participant.role}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                  {participant.department}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${participant.email}`} className="hover:text-blue-600">
                  {participant.email}
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Meetings</span>
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-900">{participant.stats.meetings}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Actions</span>
                  <Award className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-900">{participant.stats.actions}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Completion</span>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-green-600">{participant.stats.completionRate}%</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Avg Response</span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900">{participant.stats.avgResponseTime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No participants found matching your search</p>
        </div>
      )}
    </div>
  );
}
