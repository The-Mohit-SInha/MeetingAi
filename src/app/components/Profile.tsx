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
  X,
  Edit2
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

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
  const { theme, compactMode } = useTheme();
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
    <div className={compactMode ? "space-y-4" : "space-y-6"}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          My Profile
        </h1>
        <p className={`${compactMode ? 'text-sm' : 'mt-1'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your account information and preferences
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-card ${compactMode ? 'rounded-xl' : 'rounded-2xl'} overflow-hidden`}
      >
        {/* Cover Image */}
        <div className={`${compactMode ? 'h-24' : 'h-32'} bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 relative`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute ${compactMode ? 'bottom-2 right-2 p-1.5' : 'bottom-4 right-4 p-2'} bg-white/20 backdrop-blur-sm ${compactMode ? 'rounded' : 'rounded-lg'} hover:bg-white/30 transition-colors`}
          >
            <Camera className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
          </motion.button>
        </div>

        <div className={compactMode ? "px-4 pb-4" : "px-8 pb-8"}>
          {/* Avatar & Edit Button */}
          <div className={`flex items-end justify-between ${compactMode ? '-mt-8 mb-3' : '-mt-12 mb-6'}`}>
            <div className="relative">
              <div className={`${compactMode ? 'w-16 h-16 text-xl' : 'w-24 h-24 text-3xl'} bg-gradient-to-br from-green-400 to-blue-500 ${compactMode ? 'rounded-xl' : 'rounded-2xl'} flex items-center justify-center text-white font-bold shadow-xl ring-4 ${theme === 'dark' ? 'ring-gray-800' : 'ring-white'}`}>
                JD
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute bottom-0 right-0 ${compactMode ? 'p-1' : 'p-1.5'} bg-gradient-to-br from-blue-500 to-purple-600 ${compactMode ? 'rounded' : 'rounded-lg'} shadow-lg`}
              >
                <Camera className={`${compactMode ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white`} />
              </motion.button>
            </div>

            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className={`${compactMode ? 'px-3 py-1.5 text-sm' : 'px-5 py-2'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-900'} text-white ${compactMode ? 'rounded-lg' : 'rounded-full'} font-semibold hover:shadow-lg transition-all`}
              >
                <Edit2 className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'} inline mr-2`} />
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className={`${compactMode ? 'px-3 py-1.5 text-sm rounded-lg' : 'px-4 py-2 rounded-full'} font-semibold ${
                    theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className={`${compactMode ? 'px-3 py-1.5 text-sm rounded-lg' : 'px-4 py-2 rounded-full'} ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-900'} text-white font-semibold hover:shadow-lg`}
                >
                  <Save className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'} inline mr-2`} />
                  Save Changes
                </motion.button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className={compactMode ? "space-y-3" : "space-y-6"}>
            {/* Name & Title */}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold mb-1 w-full ${compactMode ? 'px-2 py-1 rounded' : 'px-3 py-2 rounded-lg'} ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border-gray-700' 
                      : 'bg-white text-gray-900 border-gray-200'
                  } border`}
                />
              ) : (
                <h2 className={`${compactMode ? 'text-lg' : 'text-2xl'} font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {profile.name}
                </h2>
              )}
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {profile.role}  {profile.department}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {profile.location}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Bio
              </h3>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border-gray-700' 
                      : 'bg-white text-gray-900 border-gray-200'
                  } border`}
                />
              ) : (
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white border-gray-700' 
                        : 'bg-white text-gray-900 border-gray-200'
                    } border`}
                  />
                ) : (
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                    {profile.email}
                  </p>
                )}
              </div>

              <div>
                <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white border-gray-700' 
                        : 'bg-white text-gray-900 border-gray-200'
                    } border`}
                  />
                ) : (
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                    {profile.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  147
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Meetings
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  89
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Actions
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  92%
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completion
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}