import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar as CalendarIcon,
  Briefcase,
  Award,
  Edit,
  Camera,
  Save,
  X
} from "lucide-react";
import { useState } from "react";

const userStats = [
  { label: "Meetings Attended", value: "147", icon: CalendarIcon, gradient: "from-blue-500 to-cyan-500" },
  { label: "Action Items Completed", value: "89", icon: Award, gradient: "from-green-500 to-emerald-500" },
  { label: "Active Projects", value: "12", icon: Briefcase, gradient: "from-purple-500 to-pink-500" },
];

const activityLog = [
  { date: "2026-03-31", action: "Completed 'Update API documentation'", type: "completion" },
  { date: "2026-03-31", action: "Attended 'Product Roadmap Q2 Review'", type: "meeting" },
  { date: "2026-03-30", action: "Created new action item", type: "creation" },
  { date: "2026-03-30", action: "Attended 'Sprint Planning - Week 14'", type: "meeting" },
  { date: "2026-03-29", action: "Completed 'Review design mockups'", type: "completion" },
];

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    role: "Product Manager",
    department: "Engineering",
    joinDate: "January 15, 2024",
    bio: "Passionate about building great products and leading high-performing teams. Focused on innovation and user experience."
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and preferences
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
          </motion.button>
        </div>

        <div className="px-8 pb-8">
          {/* Avatar & Edit Button */}
          <div className="flex items-end justify-between -mt-12 mb-6">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white cursor-pointer"
              >
                <span className="text-white text-3xl font-bold">JD</span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isEditing
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </motion.button>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Name & Role */}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 mb-1 px-3 py-2 border border-purple-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                  {profile.role}
                </span>
                <span className="text-gray-600">• {profile.department}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="font-semibold text-gray-900 px-2 py-1 border border-purple-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900">{profile.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="font-semibold text-gray-900 px-2 py-1 border border-purple-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900">{profile.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="font-semibold text-gray-900 px-2 py-1 border border-purple-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900">{profile.location}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-semibold text-gray-900">{profile.joinDate}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Bio</p>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                />
              ) : (
                <p className="text-gray-700">{profile.bio}</p>
              )}
            </div>

            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6 shadow-xl"
      >
        <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activityLog.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-start gap-3 p-3 bg-white/60 rounded-xl"
            >
              <div className={`w-2 h-2 mt-2 rounded-full ${
                activity.type === "completion" ? "bg-green-500" :
                activity.type === "meeting" ? "bg-blue-500" : "bg-purple-500"
              }`} />
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{activity.action}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
