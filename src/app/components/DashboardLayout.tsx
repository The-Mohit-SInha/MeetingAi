import { Video, Bell, LogOut, Moon, Sun, LayoutDashboard, CheckSquare, Calendar as CalendarIcon, BarChart3, Users, Settings as SettingsIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLiveMeeting } from "../context/LiveMeetingContext";
import { userAPI } from "../services/apiWrapper";
import { LiveMeetingBanner } from "./LiveMeetingBanner";

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
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { liveMeeting, elapsedSeconds, showPanel, setShowPanel } = useLiveMeeting();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      // Retry up to 3 times with 250ms delay — handles race condition on first Google OAuth login
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const profile = await userAPI.getProfile(user.id);
          if (profile && profile.id) {
            setUserProfile(profile);
            return;
          }
        } catch (error) {
          console.warn(`Profile fetch attempt ${attempt + 1} failed:`, error);
        }
        if (attempt < 2) await new Promise(r => setTimeout(r, 250));
      }
      // Final fallback: use auth user metadata directly
      setUserProfile({
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || null,
      });
    };

    fetchUserProfile();
  }, [user]);

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  // Generate avatar initials from name or email
  const getInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userProfile?.email || user?.email) {
      const email = userProfile?.email || user?.email;
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div 
      className="min-h-screen p-3 md:p-4"
      style={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' 
          : 'linear-gradient(135deg, #f5f5dc 0%, #faf8f3 50%, #f0ece2 100%)' 
      }}
    >
      {/* Single Large Container Frame - Max height to fit viewport */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[1600px] mx-auto rounded-[2rem] p-4 md:p-5 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto backdrop-blur-xl"
        style={{ 
          background: theme === 'dark' 
            ? 'rgba(30, 30, 46, 0.6)' 
            : 'rgba(255, 255, 255, 0.4)',
          border: theme === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(210, 180, 140, 0.2)'
        }}
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          {/* Logo */}
          <div 
            className={`px-5 py-1.5 rounded-full backdrop-blur-md shadow-lg`}
            style={{
              background: theme === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.4)',
              border: theme === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.2)' 
                : '1px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Meeting AI</span>
          </div>

          {/* Live Meeting Indicator */}
          <AnimatePresence>
            {liveMeeting && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setShowPanel(!showPanel)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg cursor-pointer"
                style={{
                  background: theme === 'dark' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Live</span>
                <span className="text-xs font-mono text-red-500">{formatElapsed(elapsedSeconds)}</span>
              </motion.button>
            )}
          </AnimatePresence>

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
                <span className="text-white text-xs font-bold">{getInitials()}</span>
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => signOut().then(() => navigate('/login'))}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-white/60'
              }`}
            >
              <LogOut className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
            </motion.button>
          </div>
        </div>

        {/* Live Meeting Slide-Down Panel */}
        <AnimatePresence>
          {liveMeeting && showPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div
                className="rounded-2xl p-4 backdrop-blur-xl shadow-xl"
                style={{
                  background: theme === 'dark' ? 'rgba(30,30,46,0.8)' : 'rgba(255,255,255,0.6)',
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(210,180,140,0.2)',
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {liveMeeting.title}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Duration: {formatElapsed(elapsedSeconds)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* AI Capturing with equalizer bars */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-end gap-0.5 h-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full"
                            animate={{ height: ['4px', `${8 + Math.random() * 8}px`, '4px'] }}
                            transition={{ duration: 0.6 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI capturing...</span>
                    </div>
                    <Link
                      to={`/meetings/${liveMeeting.id}`}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View live transcript
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
