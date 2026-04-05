import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { groupsAPI } from "../services/api";
import { supabase } from "../../lib/supabase";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Crown,
  Shield,
  User as UserIcon,
  Loader2,
  X,
  Mail,
  Briefcase,
} from "lucide-react";
import { createPortal } from "react-dom";

interface Group {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  group_members?: any[];
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string | null;
  hierarchy_level: number;
  joined_at: string;
  users?: {
    name: string;
    email: string;
    avatar: string | null;
    role: string | null;
    department: string | null;
  };
}

export function Groups() {
  const { theme, compactMode } = useTheme();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [newMember, setNewMember] = useState({
    email: "",
    role: "",
    hierarchy_level: 0,
  });
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await groupsAPI.getAll(user.id);
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      const data = await groupsAPI.getMembers(groupId);
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroup.name) return;
    try {
      await groupsAPI.create({
        name: newGroup.name,
        description: newGroup.description,
        owner_id: user.id,
      });
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "" });
      await fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await groupsAPI.delete(groupId, user.id);
      await fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const searchUsers = async (email: string) => {
    if (!email || email.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, department, avatar")
        .ilike("email", `%${email}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAddMember = async (selectedUser: any) => {
    if (!selectedGroup) return;
    try {
      await groupsAPI.addMember({
        group_id: selectedGroup.id,
        user_id: selectedUser.id,
        role: newMember.role || selectedUser.role,
        hierarchy_level: newMember.hierarchy_level,
      });
      setShowAddMemberModal(false);
      setNewMember({ email: "", role: "", hierarchy_level: 0 });
      setSearchEmail("");
      setSearchResults([]);
      await fetchMembers(selectedGroup.id);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleUpdateMemberHierarchy = async (
    memberId: string,
    newLevel: number
  ) => {
    try {
      await groupsAPI.updateMember(memberId, { hierarchy_level: newLevel });
      if (selectedGroup) {
        await fetchMembers(selectedGroup.id);
      }
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member from the group?")) return;
    try {
      await groupsAPI.removeMember(memberId);
      if (selectedGroup) {
        await fetchMembers(selectedGroup.id);
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const toggleExpand = async (groupId: string) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      setSelectedGroup(null);
      setMembers([]);
    } else {
      setExpandedGroup(groupId);
      const group = groups.find((g) => g.id === groupId);
      setSelectedGroup(group || null);
      await fetchMembers(groupId);
    }
  };

  const getHierarchyIcon = (level: number) => {
    if (level >= 3) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (level >= 1) return <Shield className="w-4 h-4 text-blue-500" />;
    return <UserIcon className="w-4 h-4 text-gray-500" />;
  };

  const getHierarchyLabel = (level: number) => {
    if (level >= 3) return "Executive";
    if (level === 2) return "Manager";
    if (level === 1) return "Lead";
    return "Member";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className={compactMode ? "space-y-4" : "space-y-6"}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className={`${
              compactMode ? "text-2xl" : "text-3xl"
            } font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}
          >
            Groups & Teams
          </h1>
          <p
            className={`${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            } ${compactMode ? "text-sm" : "mt-1"}`}
          >
            Manage your teams and organizational hierarchy
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className={`flex items-center gap-2 ${
            compactMode ? "px-3 py-1.5 text-sm" : "px-4 py-2"
          } bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold ${
            compactMode ? "rounded-lg" : "rounded-xl"
          } shadow-lg`}
        >
          <Plus className={`${compactMode ? "w-3 h-3" : "w-4 h-4"}`} />
          Create Group
        </motion.button>
      </motion.div>

      {/* Groups List */}
      <div className={compactMode ? "space-y-2" : "space-y-3"}>
        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass ${
              compactMode ? "rounded-xl p-8" : "rounded-2xl p-12"
            } text-center shadow-xl`}
          >
            <Users
              className={`${compactMode ? "w-12 h-12" : "w-16 h-16"} mx-auto ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              } mb-4`}
            />
            <h3
              className={`${compactMode ? "text-lg" : "text-xl"} font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              No groups yet
            </h3>
            <p
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Create your first group to start organizing your team
            </p>
          </motion.div>
        ) : (
          groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass ${
                compactMode ? "rounded-xl" : "rounded-2xl"
              } shadow-xl overflow-hidden`}
            >
              {/* Group Header */}
              <div
                className={`${compactMode ? "p-3" : "p-4"} flex items-center justify-between cursor-pointer hover:bg-white/5`}
                onClick={() => toggleExpand(group.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {expandedGroup === group.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div
                    className={`${
                      compactMode ? "w-10 h-10" : "w-12 h-12"
                    } bg-gradient-to-br from-blue-500 to-purple-600 ${
                      compactMode ? "rounded-lg" : "rounded-xl"
                    } flex items-center justify-center`}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`${
                        compactMode ? "text-sm" : "text-base"
                      } font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {group.name}
                    </h3>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {group.description || "No description"}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      compactMode ? "px-2 py-1" : "px-3 py-1.5"
                    } ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } rounded-full`}
                  >
                    <Users className="w-3 h-3" />
                    <span className="text-xs font-semibold">
                      {group.group_members?.[0]?.count || 0}
                    </span>
                  </div>
                </div>

                {group.owner_id === user?.id && (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteGroup(group.id)}
                      className={`${
                        compactMode ? "p-1.5" : "p-2"
                      } bg-red-100 hover:bg-red-200 ${
                        compactMode ? "rounded" : "rounded-lg"
                      } transition-colors`}
                      title="Delete group"
                    >
                      <Trash2
                        className={`${
                          compactMode ? "w-3 h-3" : "w-4 h-4"
                        } text-red-600`}
                      />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Expanded Members List */}
              <AnimatePresence>
                {expandedGroup === group.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`border-t ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className={compactMode ? "p-3" : "p-4"}>
                      <div className="flex items-center justify-between mb-3">
                        <h4
                          className={`text-sm font-semibold ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Members ({members.length})
                        </h4>
                        {group.owner_id === user?.id && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedGroup(group);
                              setShowAddMemberModal(true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-lg"
                          >
                            <Plus className="w-3 h-3" />
                            Add Member
                          </motion.button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className={`flex items-center justify-between p-2 ${
                              theme === "dark" ? "bg-gray-800/50" : "bg-white/50"
                            } rounded-lg`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {member.users?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2) || "U"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-sm font-semibold ${
                                      theme === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {member.users?.name}
                                  </p>
                                  {getHierarchyIcon(member.hierarchy_level)}
                                  <span
                                    className={`text-xs ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {getHierarchyLabel(member.hierarchy_level)}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {member.users?.email}
                                </p>
                              </div>
                            </div>

                            {group.owner_id === user?.id && (
                              <div className="flex items-center gap-2">
                                <select
                                  value={member.hierarchy_level}
                                  onChange={(e) =>
                                    handleUpdateMemberHierarchy(
                                      member.id,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className={`text-xs px-2 py-1 rounded ${
                                    theme === "dark"
                                      ? "bg-gray-700 text-white"
                                      : "bg-gray-100 text-gray-900"
                                  } border-none`}
                                >
                                  <option value="0">Member</option>
                                  <option value="1">Lead</option>
                                  <option value="2">Manager</option>
                                  <option value="3">Executive</option>
                                </select>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="p-1 bg-red-100 hover:bg-red-200 rounded"
                                >
                                  <X className="w-3 h-3 text-red-600" />
                                </motion.button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      {createPortal(
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-6 w-full max-w-md shadow-2xl`}
              >
                <h3
                  className={`text-xl font-bold mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create New Group
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`text-sm font-semibold mb-1 block ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, name: e.target.value })
                      }
                      placeholder="Enter group name"
                      className={`w-full px-3 py-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border`}
                    />
                  </div>

                  <div>
                    <label
                      className={`text-sm font-semibold mb-1 block ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter group description"
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateGroup}
                    disabled={!newGroup.name}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Member Modal */}
      {createPortal(
        <AnimatePresence>
          {showAddMemberModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowAddMemberModal(false);
                setSearchEmail("");
                setSearchResults([]);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-2xl p-6 w-full max-w-md shadow-2xl`}
              >
                <h3
                  className={`text-xl font-bold mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add Member to {selectedGroup?.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`text-sm font-semibold mb-1 block ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Search by Email
                    </label>
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => {
                        setSearchEmail(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      placeholder="Enter user email"
                      className={`w-full px-3 py-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border`}
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => handleAddMember(result)}
                          className={`p-3 rounded-lg cursor-pointer ${
                            theme === "dark"
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {result.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "U"}
                            </div>
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {result.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {result.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label
                      className={`text-sm font-semibold mb-1 block ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Hierarchy Level
                    </label>
                    <select
                      value={newMember.hierarchy_level}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          hierarchy_level: parseInt(e.target.value),
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border`}
                    >
                      <option value="0">Member</option>
                      <option value="1">Lead</option>
                      <option value="2">Manager</option>
                      <option value="3">Executive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowAddMemberModal(false);
                      setSearchEmail("");
                      setSearchResults([]);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
