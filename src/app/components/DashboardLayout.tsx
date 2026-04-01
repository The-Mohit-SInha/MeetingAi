import { Outlet, Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Video,
  Menu,
  Search,
  Bell,
  Settings,
  Sparkles,
  X
} from "lucide-react";
import { useState } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -z-10" />
      
      {/* Floating Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl -z-10"
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full m-3 glass rounded-2xl shadow-2xl flex flex-col">
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/20">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Video className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Meeting AI</h1>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Action System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href || 
                (item.href !== "/" && location.pathname.startsWith(item.href));
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`w-5 h-5 relative z-10 ${
                      isActive ? '' : 'group-hover:scale-110 transition-transform'
                    }`} />
                    <span className="font-semibold relative z-10">{item.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Settings */}
          <div className="p-3 border-t border-white/20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-700 hover:bg-white/60 transition-colors group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Settings</span>
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="m-3 mb-0 glass rounded-2xl shadow-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/60 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </motion.button>
              
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings, actions, participants..."
                  className="pl-10 pr-4 py-2 w-80 bg-white/60 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 rounded-lg hover:bg-white/60 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                />
              </motion.button>
              
              <div className="flex items-center gap-3 pl-3 border-l border-white/30">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                >
                  <span className="text-white text-sm font-bold">JD</span>
                </motion.div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-600">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}