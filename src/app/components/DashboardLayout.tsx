import { Outlet, Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Video,
  Search,
  Bell,
  Settings as SettingsIcon,
  Sparkles,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Meetings", href: "/meetings", icon: Video },
  { name: "Action Items", href: "/actions", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Participants", href: "/participants", icon: Users },
];

export function DashboardLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen p-3 md:p-4" style={{ background: theme === 'dark' ? '#6B7280' : '#9CA3AF' }}>
      {/* Single Large Container Frame - Max height to fit viewport */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[1600px] mx-auto rounded-[2rem] p-4 md:p-5 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto"
        style={{ 
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #3C3C3E 0%, #2C2C2E 100%)' 
            : 'linear-gradient(135deg, #FFF9E6 0%, #F5F3ED 50%, #FFF9E6 100%)' 
        }}
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          {/* Logo */}
          <div className={`px-5 py-1.5 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-white/70'} backdrop-blur-md border ${theme === 'dark' ? 'border-white/20' : 'border-gray-200/50'} shadow-sm`}>
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Meeting AI</span>
          </div>

          {/* Horizontal Navigation */}
          <nav className="flex items-center gap-1.5 flex-wrap">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-1.5 rounded-full font-medium text-xs transition-all ${
                    isActive(item.href)
                      ? 'bg-gray-900 text-white shadow-md'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:bg-white/10'
                        : 'text-gray-700 hover:bg-white/60'
                  }`}
                >
                  {item.name}
                </motion.button>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-white/60'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </motion.button>

            <Link to="/settings">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                className={`p-1.5 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-white/60'
                }`}
              >
                <SettingsIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
              </motion.button>
            </Link>

            <Link to="/notifications">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className={`relative p-1.5 rounded-full transition-colors ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-white/60'
                }`}
              >
                <Bell className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-400 rounded-full" />
              </motion.button>
            </Link>

            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md cursor-pointer"
              >
                <span className="text-white text-xs font-bold">JD</span>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Outlet />
        </motion.div>
      </motion.div>
    </div>
  );
}