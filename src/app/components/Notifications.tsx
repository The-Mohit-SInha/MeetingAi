import { motion } from "motion/react";
import { 
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  Trash2,
  Check,
  X
} from "lucide-react";
import { useState } from "react";

const notifications = [
  {
    id: 1,
    type: "action",
    icon: CheckCircle2,
    title: "Action Item Completed",
    message: "Sarah Chen completed 'Update API documentation'",
    time: "5 minutes ago",
    isRead: false,
    color: "green"
  },
  {
    id: 2,
    type: "meeting",
    icon: CalendarIcon,
    title: "Upcoming Meeting",
    message: "Product Roadmap Q3 Planning starts in 30 minutes",
    time: "25 minutes ago",
    isRead: false,
    color: "blue"
  },
  {
    id: 3,
    type: "mention",
    icon: MessageSquare,
    title: "You were mentioned",
    message: "Mike Johnson mentioned you in 'Sprint Planning' notes",
    time: "1 hour ago",
    isRead: false,
    color: "purple"
  },
  {
    id: 4,
    type: "alert",
    icon: AlertCircle,
    title: "Overdue Action Item",
    message: "Review design mockups for v2.0 is overdue",
    time: "2 hours ago",
    isRead: true,
    color: "red"
  },
  {
    id: 5,
    type: "info",
    icon: Info,
    title: "New Participant Added",
    message: "Emma Wilson joined the Engineering team",
    time: "3 hours ago",
    isRead: true,
    color: "gray"
  },
  {
    id: 6,
    type: "action",
    icon: CheckCircle2,
    title: "Action Item Assigned",
    message: "You've been assigned 'Update deployment documentation'",
    time: "5 hours ago",
    isRead: true,
    color: "green"
  },
  {
    id: 7,
    type: "meeting",
    icon: CalendarIcon,
    title: "Meeting Summary Available",
    message: "Sprint Planning - Week 14 summary is ready",
    time: "1 day ago",
    isRead: true,
    color: "blue"
  },
  {
    id: 8,
    type: "mention",
    icon: Users,
    title: "Team Update",
    message: "3 new team members joined your workspace",
    time: "2 days ago",
    isRead: true,
    color: "purple"
  },
];

const colorMap = {
  green: "from-green-500 to-emerald-500",
  blue: "from-blue-500 to-cyan-500",
  purple: "from-purple-500 to-pink-500",
  red: "from-red-500 to-orange-500",
  gray: "from-gray-500 to-slate-500"
};

const bgColorMap = {
  green: "bg-green-100",
  blue: "bg-blue-100",
  purple: "bg-purple-100",
  red: "bg-red-100",
  gray: "bg-gray-100"
};

export function Notifications() {
  const [notificationsList, setNotificationsList] = useState(notifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notificationsList.filter(n => !n.isRead).length;
  const filteredNotifications = filter === "unread" 
    ? notificationsList.filter(n => !n.isRead)
    : notificationsList;

  const markAsRead = (id: number) => {
    setNotificationsList(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotificationsList(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotificationsList(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : "You're all caught up!"}
          </p>
        </div>

        {unreadCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </motion.button>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-2 shadow-xl inline-flex gap-2"
      >
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
            filter === "all"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "text-gray-700 hover:bg-white/60"
          }`}
        >
          All ({notificationsList.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-6 py-2 rounded-xl font-semibold transition-all ${
            filter === "unread"
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
              : "text-gray-700 hover:bg-white/60"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center shadow-xl"
          >
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 5, scale: 1.01 }}
              className={`glass rounded-2xl p-4 shadow-xl group relative ${
                !notification.isRead ? "ring-2 ring-blue-500/50" : ""
              }`}
            >
              {!notification.isRead && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"
                />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[notification.color]} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <notification.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900">{notification.title}</h4>
                  <p className="text-gray-700 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
