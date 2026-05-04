// ─────────────────────────────────────────
// pages/authority/TeamManagementPage.jsx
// Authority Dashboard - Team Member Management
// ─────────────────────────────────────────

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authorityService } from "../../services/authorityService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Users, Mail, Building2 } from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";

const TeamManagementPage = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    sub_department: "water_supply",
  });

  const dashStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    fontFamily: fonts.body,
  };

  const SUB_DEPARTMENTS = [
    { id: "pwd", label: "Public Works Department (PWD)" },
    { id: "water_supply", label: "Water Supply" },
    { id: "electricity", label: "Electricity Distribution" },
    { id: "garbage_management", label: "Garbage Management" },
  ];

  // Load existing team members
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await authorityService.getTeamMembers();
      setTeamMembers(response.data?.teamMembers || []);
    } catch (error) {
      toast.error("Failed to load team members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTeamMembers();
  }, [user]);

  // Format department name
  const formatDepartment = (deptId) => {
    const dept = SUB_DEPARTMENTS.find((d) => d.id === deptId);
    return dept ? dept.label : deptId;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim() || !formData.email?.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      if (editingId) {
        // Update existing
        await authorityService.updateTeamMember(editingId, formData);
        toast.success("Team member updated!");
      } else {
        // Create new
        if (!formData.password?.trim()) {
          toast.error("Password required for new member");
          return;
        }
        await authorityService.createTeamMember(formData);
        toast.success("Team member created!");
      }
      setFormData({ name: "", email: "", password: "", sub_department: "pwd" });
      setEditingId(null);
      setShowForm(false);
      loadTeamMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
      console.error(error);
    }
  };

  // Edit team member
  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      email: member.email,
      password: "",
      sub_department: member.sub_department,
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  // Delete team member
  const handleDelete = async (memberId) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      await authorityService.removeTeamMember(memberId);
      toast.success("Team member removed!");
      loadTeamMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove");
      console.error(error);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setFormData({ name: "", email: "", password: "", sub_department: "pwd" });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <Loader fullPage />;

  return (
    <div style={dashStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--c-charcoal)] mb-2" style={{ fontFamily: fonts.heading }}>
            Team Management
          </h1>
          <p className="text-gray-600">Manage department managers for your authority</p>
        </div>
        <button
          onClick={() => (showForm ? handleCancel() : setShowForm(true))}
          className="flex items-center gap-2 bg-[var(--c-olive)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Cancel" : "Add Member"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-md">
          <h2 className="text-xl font-bold text-[var(--c-charcoal)] mb-6">
            {editingId ? "Edit Team Member" : "Create New Team Member"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Manager"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--c-olive)]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., john@municipality.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--c-olive)]"
                  disabled={!!editingId}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password {editingId && <span className="text-gray-500">(leave blank to keep)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? "Leave blank to keep current" : "Enter password"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--c-olive)]"
                />
              </div>

              {/* Sub-Department */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                <select
                  value={formData.sub_department}
                  onChange={(e) => setFormData({ ...formData, sub_department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--c-olive)]"
                >
                  {SUB_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[var(--c-olive)] text-white font-bold py-2 rounded-lg hover:opacity-90 transition"
              >
                {editingId ? "Update Member" : "Create Member"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:opacity-90 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-[var(--c-charcoal)] mb-6 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Team ({teamMembers.length})
        </h2>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No team members yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-4 text-gray-800">{member.name}</td>
                    <td className="py-4 px-4 text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {member.email}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Building2 className="w-3 h-3" />
                        {formatDepartment(member.sub_department)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          member.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagementPage;
