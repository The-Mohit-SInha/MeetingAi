import { isSupabaseConfigured } from '../../lib/supabase';
import * as supabaseAPI from './api';
import * as localStorage from './localAPI';
import { localGetCurrentUser } from '../../lib/localAuth';

// Helper to get user ID (demo user for local mode)
const getUserId = () => {
  if (!useLocalStorage) {
    // For Supabase mode, the user ID should be passed from components
    return '';
  }
  // For local mode, get the current user from localStorage
  const localUser = localGetCurrentUser();
  return localUser?.id || 'demo-user-id';
};

// Detect if we should use local storage or Supabase
const useLocalStorage = !isSupabaseConfigured();

// ==================== MEETINGS ====================

export const meetingsAPI = {
  async getAll(userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localMeetingsAPI.getAll(userId));
    }
    return supabaseAPI.meetingsAPI.getAll(userId);
  },

  async getById(id: string, userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localMeetingsAPI.getById(id, userId));
    }
    return supabaseAPI.meetingsAPI.getById(id, userId);
  },

  async create(meeting: any, participants: string[]) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localMeetingsAPI.create(meeting, participants));
    }
    return supabaseAPI.meetingsAPI.create(meeting, participants);
  },

  async update(id: string, meeting: any, userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localMeetingsAPI.update(id, meeting, userId));
    }
    return supabaseAPI.meetingsAPI.update(id, meeting, userId);
  },

  async delete(id: string, userId: string) {
    if (useLocalStorage) {
      localStorage.localMeetingsAPI.delete(id, userId);
      return Promise.resolve();
    }
    return supabaseAPI.meetingsAPI.delete(id, userId);
  },

  async search(query: string, userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localMeetingsAPI.search(query, userId));
    }
    return supabaseAPI.meetingsAPI.search(query, userId);
  },
};

// ==================== ACTION ITEMS ====================

export const actionItemsAPI = {
  async getAll(userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localActionItemsAPI.getAll(userId));
    }
    return supabaseAPI.actionItemsAPI.getAll(userId);
  },

  async getByMeeting(meetingId: string, userId: string) {
    if (useLocalStorage) {
      const items = localStorage.localActionItemsAPI.getAll(userId);
      return Promise.resolve(items.filter(item => item.meeting_id === meetingId));
    }
    return supabaseAPI.actionItemsAPI.getByMeeting(meetingId, userId);
  },

  async create(actionItem: any) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localActionItemsAPI.create(actionItem));
    }
    return supabaseAPI.actionItemsAPI.create(actionItem);
  },

  async update(id: string, actionItem: any, userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localActionItemsAPI.update(id, actionItem, userId));
    }
    return supabaseAPI.actionItemsAPI.update(id, actionItem, userId);
  },

  async updateStatus(id: string, status: any, userId: string) {
    if (useLocalStorage) {
      const progress = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0;
      return Promise.resolve(localStorage.localActionItemsAPI.update(id, { status, progress }, userId));
    }
    return supabaseAPI.actionItemsAPI.updateStatus(id, status, userId);
  },

  async delete(id: string, userId: string) {
    if (useLocalStorage) {
      localStorage.localActionItemsAPI.delete(id, userId);
      return Promise.resolve();
    }
    return supabaseAPI.actionItemsAPI.delete(id, userId);
  },

  async getStats(userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localActionItemsAPI.getStats(userId));
    }
    return supabaseAPI.actionItemsAPI.getStats(userId);
  },
};

// ==================== NOTIFICATIONS ====================

export const notificationsAPI = {
  async getAll(userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localNotificationsAPI.getAll(userId));
    }
    return supabaseAPI.notificationsAPI.getAll(userId);
  },

  async getUnreadCount(userId: string) {
    if (useLocalStorage) {
      const unread = localStorage.localNotificationsAPI.getUnread(userId);
      return Promise.resolve(unread.length);
    }
    return supabaseAPI.notificationsAPI.getUnreadCount(userId);
  },

  async markAsRead(id: string, userId: string) {
    if (useLocalStorage) {
      localStorage.localNotificationsAPI.markAsRead(id, userId);
      return Promise.resolve();
    }
    return supabaseAPI.notificationsAPI.markAsRead(id, userId);
  },

  async markAllAsRead(userId: string) {
    if (useLocalStorage) {
      localStorage.localNotificationsAPI.markAllAsRead(userId);
      return Promise.resolve();
    }
    return supabaseAPI.notificationsAPI.markAllAsRead(userId);
  },

  async delete(id: string, userId: string) {
    if (useLocalStorage) {
      localStorage.localNotificationsAPI.delete(id, userId);
      return Promise.resolve();
    }
    return supabaseAPI.notificationsAPI.delete(id, userId);
  },

  async create(notification: any) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localNotificationsAPI.create(notification));
    }
    return supabaseAPI.notificationsAPI.create(notification);
  },
};

// ==================== USER PROFILE ====================

export const userAPI = {
  async getProfile(userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localUserAPI.get(userId));
    }
    return supabaseAPI.userAPI.getProfile(userId);
  },

  async updateProfile(userId: string, profile: any) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localUserAPI.update(userId, profile));
    }
    return supabaseAPI.userAPI.updateProfile(userId, profile);
  },

  async uploadAvatar(userId: string, file: File) {
    if (useLocalStorage) {
      const url = await localStorage.localUserAPI.uploadAvatar(userId, file);
      return Promise.resolve({ avatar: url });
    }
    return supabaseAPI.userAPI.uploadAvatar(userId, file);
  },
};

// ==================== USER SETTINGS ====================

export const settingsAPI = {
  async get(userId: string) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localSettingsAPI.get(userId));
    }
    return supabaseAPI.settingsAPI.get(userId);
  },

  async update(userId: string, settings: any) {
    if (useLocalStorage) {
      return Promise.resolve(localStorage.localSettingsAPI.update(userId, settings));
    }
    return supabaseAPI.settingsAPI.update(userId, settings);
  },
};

// ==================== PARTICIPANTS ====================

export const participantsAPI = {
  async getAll(userId: string) {
    if (useLocalStorage) {
      // Get all unique participants from meetings
      const meetings = localStorage.localMeetingsAPI.getAll(userId);
      const participantsMap = new Map();

      meetings.forEach((meeting: any) => {
        const participants = meeting.participants || [];
        participants.forEach((p: any) => {
          if (!participantsMap.has(p.participant_name)) {
            participantsMap.set(p.participant_name, {
              name: p.participant_name,
              email: p.participant_email,
              role: p.role || 'Team Member',
              meetings: 0,
            });
          }
          const participant = participantsMap.get(p.participant_name);
          participant.meetings += 1;
        });
      });

      return Promise.resolve(Array.from(participantsMap.values()));
    }
    return supabaseAPI.participantsAPI.getAll(userId);
  },

  async getByMeeting(meetingId: string, userId: string) {
    if (useLocalStorage) {
      const meeting = localStorage.localMeetingsAPI.getById(meetingId, userId);
      return Promise.resolve(meeting?.participants || []);
    }
    return supabaseAPI.participantsAPI.getByMeeting(meetingId, userId);
  },
};

// ==================== GROUPS ====================

export const groupsAPI = {
  async getAll(userId: string) {
    if (useLocalStorage) {
      // For local storage, implement basic groups storage
      const groups = JSON.parse(localStorage.getItem(`groups_${userId}`) || '[]');
      return Promise.resolve(groups);
    }
    return supabaseAPI.groupsAPI.getAll(userId);
  },

  async getById(id: string, userId: string) {
    if (useLocalStorage) {
      const groups = JSON.parse(localStorage.getItem(`groups_${userId}`) || '[]');
      return Promise.resolve(groups.find((g: any) => g.id === id));
    }
    return supabaseAPI.groupsAPI.getById(id, userId);
  },

  async create(group: any) {
    if (useLocalStorage) {
      const groups = JSON.parse(localStorage.getItem(`groups_${group.owner_id}`) || '[]');
      const newGroup = {
        ...group,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      groups.push(newGroup);
      localStorage.setItem(`groups_${group.owner_id}`, JSON.stringify(groups));
      return Promise.resolve(newGroup);
    }
    return supabaseAPI.groupsAPI.create(group);
  },

  async update(id: string, group: any, userId: string) {
    if (useLocalStorage) {
      const groups = JSON.parse(localStorage.getItem(`groups_${userId}`) || '[]');
      const index = groups.findIndex((g: any) => g.id === id);
      if (index >= 0) {
        groups[index] = { ...groups[index], ...group, updated_at: new Date().toISOString() };
        localStorage.setItem(`groups_${userId}`, JSON.stringify(groups));
        return Promise.resolve(groups[index]);
      }
      return Promise.reject(new Error('Group not found'));
    }
    return supabaseAPI.groupsAPI.update(id, group, userId);
  },

  async delete(id: string, userId: string) {
    if (useLocalStorage) {
      const groups = JSON.parse(localStorage.getItem(`groups_${userId}`) || '[]');
      const filtered = groups.filter((g: any) => g.id !== id);
      localStorage.setItem(`groups_${userId}`, JSON.stringify(filtered));
      return Promise.resolve();
    }
    return supabaseAPI.groupsAPI.delete(id, userId);
  },

  async addMember(member: any) {
    if (useLocalStorage) {
      const members = JSON.parse(localStorage.getItem(`group_members_${member.group_id}`) || '[]');
      const newMember = {
        ...member,
        id: crypto.randomUUID(),
        joined_at: new Date().toISOString(),
      };
      members.push(newMember);
      localStorage.setItem(`group_members_${member.group_id}`, JSON.stringify(members));
      return Promise.resolve(newMember);
    }
    return supabaseAPI.groupsAPI.addMember(member);
  },

  async updateMember(id: string, member: any) {
    if (useLocalStorage) {
      // Find member across all groups
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('group_members_'));
      for (const key of allKeys) {
        const members = JSON.parse(localStorage.getItem(key) || '[]');
        const index = members.findIndex((m: any) => m.id === id);
        if (index >= 0) {
          members[index] = { ...members[index], ...member };
          localStorage.setItem(key, JSON.stringify(members));
          return Promise.resolve(members[index]);
        }
      }
      return Promise.reject(new Error('Member not found'));
    }
    return supabaseAPI.groupsAPI.updateMember(id, member);
  },

  async removeMember(id: string) {
    if (useLocalStorage) {
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith('group_members_'));
      for (const key of allKeys) {
        const members = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = members.filter((m: any) => m.id !== id);
        if (filtered.length !== members.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          return Promise.resolve();
        }
      }
      return Promise.resolve();
    }
    return supabaseAPI.groupsAPI.removeMember(id);
  },

  async getMembers(groupId: string) {
    if (useLocalStorage) {
      const members = JSON.parse(localStorage.getItem(`group_members_${groupId}`) || '[]');
      return Promise.resolve(members);
    }
    return supabaseAPI.groupsAPI.getMembers(groupId);
  },
};

// ==================== ANALYTICS ====================

export const analyticsAPI = {
  async getMeetingStats(userId: string) {
    if (useLocalStorage) {
      const meetings = localStorage.localMeetingsAPI.getAll(userId);
      return Promise.resolve({
        total: meetings.length,
        completed: meetings.filter(m => m.status === 'completed').length,
        scheduled: meetings.filter(m => m.status === 'scheduled').length,
        inProgress: meetings.filter(m => m.status === 'in-progress').length,
      });
    }
    return supabaseAPI.analyticsAPI.getMeetingStats(userId);
  },

  async getActionItemStats(userId: string) {
    return actionItemsAPI.getStats(userId);
  },

  async getMeetingTrends(userId?: string) {
    const uid = userId || getUserId();
    if (useLocalStorage) {
      const meetings = localStorage.localMeetingsAPI.getAll(uid);
      const monthCounts: Record<string, number> = {};

      meetings.forEach(m => {
        const month = m.date.slice(0, 7);
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });

      return Promise.resolve(
        Object.entries(monthCounts)
          .map(([month, total_meetings]) => ({ month, total_meetings }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6) // Last 6 months
      );
    }
    return supabaseAPI.analyticsAPI.getMeetingTrends(uid);
  },

  async getActionsByStatus(userId?: string) {
    const uid = userId || getUserId();
    const stats = await actionItemsAPI.getStats(uid);
    return Promise.resolve({
      completed: stats.completed,
      in_progress: stats.in_progress,
      todo: stats.todo,
    });
  },

  async getMeetingDuration(userId?: string) {
    const uid = userId || getUserId();
    if (useLocalStorage) {
      const meetings = localStorage.localMeetingsAPI.getAll(uid);
      const durations: Record<string, number> = {
        '0-30': 0,
        '30-60': 0,
        '60-90': 0,
        '90+': 0,
      };

      meetings.forEach(m => {
        // Parse duration - handle formats like "30 min", "60", "1 hour", etc.
        const durationStr = m.duration?.toString() || '0';
        const durationMatch = durationStr.match(/(\d+)/);
        const duration = durationMatch ? parseInt(durationMatch[1]) : 0;

        if (duration <= 30) durations['0-30']++;
        else if (duration <= 60) durations['30-60']++;
        else if (duration <= 90) durations['60-90']++;
        else durations['90+']++;
      });

      return Promise.resolve(durations);
    }

    // For Supabase, implement similar logic
    const meetings = await meetingsAPI.getAll(uid);
    const durations: Record<string, number> = {
      '0-30': 0,
      '30-60': 0,
      '60-90': 0,
      '90+': 0,
    };

    meetings.forEach((m: any) => {
      // Parse duration - handle formats like "30 min", "60", "1 hour", etc.
      const durationStr = m.duration?.toString() || '0';
      const durationMatch = durationStr.match(/(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1]) : 0;

      if (duration <= 30) durations['0-30']++;
      else if (duration <= 60) durations['30-60']++;
      else if (duration <= 90) durations['60-90']++;
      else durations['90+']++;
    });

    return durations;
  },

  async getParticipantEngagement(userId?: string) {
    const uid = userId || getUserId();
    if (useLocalStorage) {
      const meetings = localStorage.localMeetingsAPI.getAll(uid);
      const participantCounts = new Map();

      meetings.forEach(meeting => {
        const participants = meeting.participants || meeting.meeting_participants || [];
        participants.forEach((p: any) => {
          const name = p.participant_name || p.name;
          if (name) {
            if (!participantCounts.has(name)) {
              participantCounts.set(name, { participant_name: name, meeting_count: 0 });
            }
            participantCounts.get(name).meeting_count++;
          }
        });
      });

      return Promise.resolve(
        Array.from(participantCounts.values())
          .sort((a, b) => b.meeting_count - a.meeting_count)
      );
    }

    // For Supabase - get all meetings with participants
    const meetings = await meetingsAPI.getAll(uid);
    const participantCounts = new Map();

    meetings.forEach((meeting: any) => {
      const participants = meeting.meeting_participants || [];
      participants.forEach((p: any) => {
        const name = p.participant_name;
        if (name) {
          if (!participantCounts.has(name)) {
            participantCounts.set(name, { participant_name: name, meeting_count: 0 });
          }
          participantCounts.get(name).meeting_count++;
        }
      });
    });

    return Array.from(participantCounts.values())
      .sort((a, b) => b.meeting_count - a.meeting_count);
  },
};

// ==================== EXPORT ====================

export const exportAPI = {
  async exportMeetings(userId: string, format: 'csv' | 'json' = 'csv') {
    if (useLocalStorage) {
      if (format === 'json') {
        return Promise.resolve(localStorage.localExportAPI.exportMeetingsJSON(userId));
      }
      return Promise.resolve(localStorage.localExportAPI.exportMeetingsCSV(userId));
    }
    return supabaseAPI.exportAPI.exportMeetings(userId, format);
  },

  async exportActionItems(userId: string, format: 'csv' | 'json' = 'csv') {
    if (useLocalStorage) {
      if (format === 'json') {
        return Promise.resolve(localStorage.localExportAPI.exportActionItemsJSON(userId));
      }
      return Promise.resolve(localStorage.localExportAPI.exportActionItemsCSV(userId));
    }
    return supabaseAPI.exportAPI.exportActionItems(userId, format);
  },

  downloadFile(content: string, filename: string, mimeType: string) {
    if (useLocalStorage) {
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return;
    }
    return supabaseAPI.exportAPI.downloadFile(content, filename, mimeType);
  },
};

// ==================== RECORDINGS ====================

export const recordingsAPI = {
  async uploadAudio(blob: Blob, userId: string, meetingId: string): Promise<string> {
    if (useLocalStorage) {
      // In local mode, create a local object URL as a placeholder
      return URL.createObjectURL(blob);
    }
    return supabaseAPI.recordingsAPI.uploadAudio(blob, userId, meetingId);
  },
};

// Helper to get current user ID
export const getCurrentUserId = () => getUserId();

// Export flag for whether we're using local storage
export const isUsingLocalStorage = useLocalStorage;