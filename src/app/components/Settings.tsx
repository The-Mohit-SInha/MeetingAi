import { motion } from "motion/react";
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Moon,
  Sun,
  Volume2,
  Mail,
  Shield,
  Key,
  Database,
  Zap,
  Save
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const settingsSections = [
  {
    id: "account",
    title: "Account Settings",
    icon: User,
    description: "Manage your account information"
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    description: "Configure notification preferences"
  },
  {
    id: "appearance",
    title: "Appearance",
    icon: Palette,
    description: "Customize your interface"
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    icon: Lock,
    description: "Control your privacy settings"
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Zap,
    description: "Connect with other tools"
  },
];

export function Settings() {
  const { theme, setTheme, compactMode, toggleCompactMode } = useTheme();
  const [activeSection, setActiveSection] = useState("account");
  const [settings, setSettings] = useState({
    // Account
    autoSave: true,
    language: "en",
    timezone: "America/Los_Angeles",
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    meetingReminders: true,
    actionItemUpdates: true,
    weeklyDigest: false,
    
    // Appearance
    showAvatars: true,
    animationsEnabled: true,
    
    // Privacy
    profileVisibility: "team",
    activityStatus: true,
    dataSharing: false,
    twoFactorAuth: false,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={compactMode ? "space-y-4" : "space-y-6"}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`${compactMode ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
          Settings
        </h1>
        <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${compactMode ? 'text-sm' : 'mt-1'} flex items-center gap-2`}>
          <SettingsIcon className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'}`} />
          Customize your Meeting AI experience
        </p>
      </motion.div>

      <div className={`grid grid-cols-1 lg:grid-cols-4 ${compactMode ? 'gap-3' : 'gap-6'}`}>
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-1 glass ${compactMode ? 'rounded-xl p-3' : 'rounded-2xl p-4'} shadow-xl h-fit`}
        >
          <div className={compactMode ? "space-y-1" : "space-y-2"}>
            {settingsSections.map((section, index) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-start gap-3 ${compactMode ? 'p-2' : 'p-3'} ${compactMode ? 'rounded-lg' : 'rounded-xl'} transition-all text-left ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700/60' : 'text-gray-700 hover:bg-white/60'}`
                }`}
              >
                <section.icon className={`${compactMode ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`${compactMode ? 'text-sm' : 'text-base'} font-semibold`}>{section.title}</p>
                  <p className={`text-xs mt-0.5 ${
                    activeSection === section.id ? "text-white/80" : `${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`
                  }`}>
                    {section.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`lg:col-span-3 glass ${compactMode ? 'rounded-xl p-4' : 'rounded-2xl p-6'} shadow-xl`}
        >
          {/* Account Settings */}
          {activeSection === "account" && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Account Settings</h2>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Manage your account preferences and regional settings</p>
              </div>

              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                      <Database className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Auto-save</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Automatically save changes</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle("autoSave")}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      settings.autoSave ? "bg-gradient-to-r from-blue-500 to-purple-600" : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings.autoSave ? 28 : 2 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl space-y-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                      <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Language</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred language</p>
                    </div>
                  </div>
                  <select className={`w-full px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl space-y-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                      <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Timezone</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Set your local timezone</p>
                    </div>
                  </div>
                  <select className={`w-full px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Notification Preferences</h2>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Choose how you want to be notified</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email", icon: Mail },
                  { key: "pushNotifications", label: "Push Notifications", desc: "Get browser push notifications", icon: Bell },
                  { key: "meetingReminders", label: "Meeting Reminders", desc: "Reminders before meetings start", icon: Bell },
                  { key: "actionItemUpdates", label: "Action Item Updates", desc: "Updates on action items", icon: Bell },
                  { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary email every Monday", icon: Mail },
                ].map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings[item.key] ? "bg-gradient-to-r from-blue-500 to-purple-600" : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings[item.key] ? 28 : 2 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeSection === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Appearance</h2>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Customize how Meeting AI looks</p>
              </div>

              <div className="space-y-4">
                <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl space-y-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                      {theme === "dark" ? <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} /> : <Sun className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Theme</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred theme</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["light", "dark"].map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => setTheme(themeOption as "light" | "dark")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                          theme === themeOption
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                            : `${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200 hover:border-purple-500' : 'bg-white border-gray-300 text-gray-700 hover:border-purple-500'} border`
                        }`}
                      >
                        {themeOption}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { key: "compactMode", label: "Compact Mode", desc: "Reduce spacing for more content", icon: Palette, isGlobal: true },
                  { key: "showAvatars", label: "Show Avatars", desc: "Display user avatars", icon: User, isGlobal: false },
                  { key: "animationsEnabled", label: "Animations", desc: "Enable smooth animations", icon: Zap, isGlobal: false },
                ].map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => item.isGlobal ? toggleCompactMode() : handleToggle(item.key)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        (item.isGlobal ? compactMode : settings[item.key]) ? "bg-gradient-to-r from-blue-500 to-purple-600" : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`
                      }`}
                    >
                      <motion.div
                        animate={{ x: (item.isGlobal ? compactMode : settings[item.key]) ? 28 : 2 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Security Settings */}
          {activeSection === "privacy" && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Privacy & Security</h2>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Control your privacy and security settings</p>
              </div>

              <div className="space-y-4">
                <div className={`p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl space-y-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                      <Shield className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profile Visibility</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Who can see your profile</p>
                    </div>
                  </div>
                  <select 
                    value={settings.profileVisibility}
                    onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                    className={`w-full px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="team">Team Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {[
                  { key: "activityStatus", label: "Activity Status", desc: "Show when you're online", icon: Globe },
                  { key: "dataSharing", label: "Data Sharing", desc: "Share usage data for improvement", icon: Database },
                  { key: "twoFactorAuth", label: "Two-Factor Authentication", desc: "Add an extra layer of security", icon: Key },
                ].map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings[item.key] ? "bg-gradient-to-r from-blue-500 to-purple-600" : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings[item.key] ? 28 : 2 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations Settings */}
          {activeSection === "integrations" && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Integrations</h2>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Connect Meeting AI with your favorite tools</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Slack", desc: "Sync notifications", icon: "💬", connected: true, color: "purple" },
                  { name: "Google Calendar", desc: "Sync meetings", icon: "📅", connected: true, color: "blue" },
                  { name: "Zoom", desc: "Video conferencing", icon: "🎥", connected: false, color: "indigo" },
                  { name: "Microsoft Teams", desc: "Team collaboration", icon: "👥", connected: false, color: "blue" },
                  { name: "Jira", desc: "Issue tracking", icon: "📋", connected: false, color: "blue" },
                  { name: "GitHub", desc: "Code repository", icon: "🐙", connected: false, color: "gray" },
                ].map((integration, index) => (
                  <motion.div
                    key={integration.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} rounded-xl`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{integration.name}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{integration.desc}</p>
                          {integration.connected && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold rounded-full">
                              Connected
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          integration.connected
                            ? `${theme === 'dark' ? 'bg-red-900/50 text-red-300 hover:bg-red-900' : 'bg-red-100 text-red-600 hover:bg-red-200'}`
                            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                        }`}
                      >
                        {integration.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`flex justify-end pt-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t mt-6`}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;