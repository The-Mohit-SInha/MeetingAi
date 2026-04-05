import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { analyticsAPI } from "../services/apiWrapper";
import { motion } from "motion/react";
import { Calendar, CheckSquare, TrendingUp, Users, Loader2, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { MeetingsTrendChart, ActionsPieChart, DurationBarChart } from "./ChartComponents";

export function Analytics() {
  const { theme, compactMode } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalActions: 0,
    completionRate: 0,
    totalParticipants: 0,
  });
  const [meetingsByMonth, setMeetingsByMonth] = useState<any[]>([]);
  const [actionsByStatus, setActionsByStatus] = useState<any[]>([]);
  const [meetingDuration, setMeetingDuration] = useState<any[]>([]);
  const [participantEngagement, setParticipantEngagement] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();

      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchAnalytics(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAnalytics = async (isAutoRefresh = false) => {
    if (!user) return;

    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Analytics data fetch timeout - using default values');
        if (!isAutoRefresh) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }, 5000);

      console.log('📊 Fetching analytics data...');

      const [monthTrends, statusBreakdown, durationStats, engagement] = await Promise.all([
        analyticsAPI.getMeetingTrends(user.id).catch(err => {
          console.error('❌ Failed to fetch meeting trends:', err);
          return [];
        }),
        analyticsAPI.getActionsByStatus(user.id).catch(err => {
          console.error('❌ Failed to fetch action status:', err);
          return { completed: 0, in_progress: 0, todo: 0 };
        }),
        analyticsAPI.getMeetingDuration(user.id).catch(err => {
          console.error('❌ Failed to fetch meeting duration:', err);
          return { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 };
        }),
        analyticsAPI.getParticipantEngagement(user.id).catch(err => {
          console.error('❌ Failed to fetch participant engagement:', err);
          return [];
        })
      ]);

      console.log('📈 Month trends:', monthTrends);
      console.log('📋 Status breakdown:', statusBreakdown);
      console.log('⏱️ Duration stats:', durationStats);
      console.log('👥 Participant engagement:', engagement);

      setMeetingsByMonth((monthTrends || []).map((m: any, i: number) => {
        // Handle both date strings and month strings (YYYY-MM format)
        const monthStr = m.month && m.month.includes('-')
          ? new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' })
          : m.month || 'Unknown';
        return {
          month: monthStr,
          meetings: m.total_meetings || 0,
          actions: 0,
          id: `month-${i}`,
        };
      }));

      setActionsByStatus([
        { name: "Completed", value: statusBreakdown.completed || 0, color: "#10b981", id: "completed" },
        { name: "In Progress", value: statusBreakdown.in_progress || 0, color: "#3b82f6", id: "in-progress" },
        { name: "To Do", value: statusBreakdown.todo || 0, color: "#f59e0b", id: "todo" },
      ]);

      setMeetingDuration([
        { duration: "0-30 min", count: durationStats['0-30'] || 0, id: "d1" },
        { duration: "30-60 min", count: durationStats['30-60'] || 0, id: "d2" },
        { duration: "60-90 min", count: durationStats['60-90'] || 0, id: "d3" },
        { duration: "90+ min", count: durationStats['90+'] || 0, id: "d4" },
      ]);

      setParticipantEngagement((engagement || []).slice(0, 5).map((p: any, i: number) => ({
        name: p.participant_name || 'Unknown',
        meetings: p.meeting_count || 0,
        actions: 0,
        id: `participant-${i}`,
      })));

      setStats({
        totalMeetings: monthTrends.reduce((sum: number, m: any) => sum + m.total_meetings, 0),
        totalActions: (statusBreakdown.completed || 0) + (statusBreakdown.in_progress || 0) + (statusBreakdown.todo || 0),
        completionRate: (() => {
          const total = (statusBreakdown.completed || 0) + (statusBreakdown.in_progress || 0) + (statusBreakdown.todo || 0);
          return total > 0 ? Math.round((statusBreakdown.completed / total) * 100) : 0;
        })(),
        totalParticipants: engagement.length,
      });

      console.log('✅ Analytics data loaded successfully');
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchAnalytics(false);
  };

  const statsCards = [
    { name: "Total Meetings", value: stats.totalMeetings.toString(), change: "+12%", trend: "up", icon: Calendar, gradient: "from-blue-500 to-cyan-500" },
    { name: "Action Items", value: stats.totalActions.toString(), change: "+8%", trend: "up", icon: CheckSquare, gradient: "from-green-500 to-emerald-500" },
    { name: "Avg Completion", value: `${stats.completionRate}%`, change: "+5%", trend: "up", icon: TrendingUp, gradient: "from-purple-500 to-pink-500" },
    { name: "Active Users", value: stats.totalParticipants.toString(), change: "-2%", trend: "down", icon: Users, gradient: "from-orange-500 to-red-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Analytics
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Insights and metrics from your meetings
          </p>
        </div>
        <motion.button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition-all ${
            loading || refreshing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                stat.trend === "up" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}>
                {stat.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {stat.name}
            </h3>
            <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meeting & Action Trends
          </h3>
          <div className="w-full h-[300px]" style={{ minHeight: '300px' }}>
            <MeetingsTrendChart data={meetingsByMonth} />
          </div>
        </motion.div>

        {/* Actions Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Actions by Status
          </h3>
          <div className="w-full h-[300px]" style={{ minHeight: '300px' }}>
            <ActionsPieChart data={actionsByStatus} />
          </div>
        </motion.div>

        {/* Meeting Duration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meeting Duration Distribution
          </h3>
          <div className="w-full h-[300px]" style={{ minHeight: '300px' }}>
            <DurationBarChart data={meetingDuration} />
          </div>
        </motion.div>
      </div>

      {/* Participant Engagement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Top Participants
        </h3>
        <div className="space-y-4">
          {participantEngagement.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'
              } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {participant.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {participant.name}
                </h4>
                <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>{participant.meetings} meetings</span>
                  <span>{participant.actions} actions</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                #{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}