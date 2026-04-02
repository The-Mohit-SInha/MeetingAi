import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trash2, AlertTriangle, Database, Users, Calendar, CheckSquare, Bell, Settings as SettingsIcon, Loader2, RefreshCw } from 'lucide-react';

interface DatabaseStats {
  users: number;
  meetings: number;
  actionItems: number;
  notifications: number;
  participants: number;
  settings: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DatabaseStats>({
    users: 0,
    meetings: 0,
    actionItems: 0,
    notifications: 0,
    participants: 0,
    settings: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersCount, meetingsCount, actionsCount, notificationsCount, participantsCount, settingsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
        supabase.from('action_items').select('*', { count: 'exact', head: true }),
        supabase.from('notifications').select('*', { count: 'exact', head: true }),
        supabase.from('meeting_participants').select('*', { count: 'exact', head: true }),
        supabase.from('user_settings').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: usersCount.count || 0,
        meetings: meetingsCount.count || 0,
        actionItems: actionsCount.count || 0,
        notifications: notificationsCount.count || 0,
        participants: participantsCount.count || 0,
        settings: settingsCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const deleteAllData = async () => {
    if (!confirm('⚠️ WARNING: This will DELETE ALL DATA from the database!\\n\\nThis action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    if (!confirm('⚠️ FINAL WARNING: All meetings, actions, participants, and user data will be permanently deleted.\\n\\nType YES in the next prompt to confirm.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE ALL" to confirm:');
    if (confirmText !== 'DELETE ALL') {
      setMessage({ type: 'error', text: 'Deletion cancelled - incorrect confirmation text.' });
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      // Delete in correct order to respect foreign key constraints
      await supabase.from('meeting_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('action_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('user_settings').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      setMessage({ type: 'success', text: '✅ All data deleted successfully! You may need to manually delete auth users from Supabase Dashboard.' });
      await fetchStats();
      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting data:', error);
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  const deleteUserData = async (userId: string, userEmail: string) => {
    if (!confirm(`Delete all data for ${userEmail}?\\n\\nThis will remove:\\n- User profile\\n- All meetings\\n- All action items\\n- All notifications\\n- User settings`)) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      // Delete user's data in correct order
      await supabase.from('meeting_participants').delete().eq('meeting_id', 
        supabase.from('meetings').select('id').eq('user_id', userId)
      );
      await supabase.from('action_items').delete().eq('user_id', userId);
      await supabase.from('notifications').delete().eq('user_id', userId);
      await supabase.from('meetings').delete().eq('user_id', userId);
      await supabase.from('user_settings').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('id', userId);

      setMessage({ type: 'success', text: `✅ Deleted data for ${userEmail}` });
      await fetchStats();
      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user data:', error);
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers()]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5EB] to-[#FFE4CC] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <button
              onClick={refresh}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors border border-gray-200"
            >
              <RefreshCw className={`w-4 h-4 ${deleting ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-gray-600">Manage database and users</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} label="Users" count={stats.users} color="purple" />
          <StatCard icon={Calendar} label="Meetings" count={stats.meetings} color="blue" />
          <StatCard icon={CheckSquare} label="Actions" count={stats.actionItems} color="green" />
          <StatCard icon={Bell} label="Notifications" count={stats.notifications} color="orange" />
          <StatCard icon={Users} label="Participants" count={stats.participants} color="pink" />
          <StatCard icon={SettingsIcon} label="Settings" count={stats.settings} color="indigo" />
        </div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-red-200 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-800">Danger Zone</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Permanently delete all data from the database. This action cannot be undone.
          </p>
          <button
            onClick={deleteAllData}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Delete All Data
              </>
            )}
          </button>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Users ({users.length})</h2>
          
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((userData) => (
                <div
                  key={userData.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {userData.name?.charAt(0)?.toUpperCase() || userData.email?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{userData.name || 'No name'}</p>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-13">
                      Created: {new Date(userData.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 ml-13 font-mono">
                      ID: {userData.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {userData.id === user?.id && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                        You
                      </span>
                    )}
                    <button
                      onClick={() => deleteUserData(userData.id, userData.email)}
                      disabled={deleting}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete user data"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  count: number;
  color: string;
}

function StatCard({ icon: Icon, label, count, color }: StatCardProps) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-200"
    >
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-800">{count}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
}