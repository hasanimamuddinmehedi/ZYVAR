import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  FaSearch,
  FaTimes,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaShieldAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";
import { db } from "../../firebase/firebase";

// ─── Helper ────────────────────────────────────────────────────────────────
const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const ROLES = ["user", "admin", "moderator"];

// ─── Edit Modal ─────────────────────────────────────────────────────────────
function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    displayName: user.displayName || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user",
    photoURL: user.photoURL || "",
    password: "",
    address: user.address || "",
    bio: user.bio || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(user.id, form);
      onClose();
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, type = "text", icon) => (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 flex items-center gap-2">
        {icon && <span className="text-[#C6922B]">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handle}
        placeholder={type === "password" ? "Leave blank to keep current" : label}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C6922B] transition placeholder:text-gray-600"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg bg-[#111111] border border-white/10 rounded-[30px] p-8 max-h-[90vh] overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.edit-modal::-webkit-scrollbar{display:none}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[#C6922B] uppercase tracking-[0.3em] text-[10px] mb-1">
              Edit User
            </p>
            <h2 className="text-2xl font-black">{user.displayName || "Unknown"}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:border-[#C6922B] transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl border border-white/10 bg-white/5">
          {form.photoURL ? (
            <img
              src={form.photoURL}
              alt={form.displayName}
              className="w-16 h-16 rounded-2xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#C6922B]/15 border border-[#C6922B]/20 flex items-center justify-center text-[#C6922B] text-xl font-black">
              {initials(form.displayName)}
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Photo URL</p>
            <input
              type="text"
              name="photoURL"
              value={form.photoURL}
              onChange={handle}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C6922B] transition placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="space-y-4">
          {field("Full Name", "displayName", "text", <FaUser />)}
          {field("Email Address", "email", "email", <FaEnvelope />)}
          {field("Phone Number", "phone", "tel", <FaPhone />)}
          {field("New Password", "password", "password", <FaShieldAlt />)}
          {field("Address", "address", "text")}

          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 flex items-center gap-2">
              <span className="text-[#C6922B]"><FaShieldAlt /></span>
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handle}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C6922B] transition"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-[#111111]">
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 block">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handle}
              rows={3}
              placeholder="User bio..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C6922B] transition placeholder:text-gray-600 resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 font-black hover:border-white/30 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-4 rounded-2xl bg-[#C6922B] text-black font-black flex items-center justify-center gap-2 hover:scale-105 transition disabled:opacity-60 disabled:scale-100"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm(user.id);
    setDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[#111111] border border-white/10 rounded-[30px] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <FaExclamationTriangle className="text-red-400 text-2xl" />
        </div>
        <h2 className="text-xl font-black mb-2">Delete User</h2>
        <p className="text-gray-400 text-sm mb-8">
          Are you sure you want to permanently delete{" "}
          <span className="text-white font-black">{user.displayName || user.email}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 font-black hover:border-white/30 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
          >
            {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Row ────────────────────────────────────────────────────────────────
function UserRow({ user, onEdit, onDelete, onToggleBan }) {
  const [banning, setBanning] = useState(false);

  const handleBan = async () => {
    setBanning(true);
    await onToggleBan(user.id, !user.banned);
    setBanning(false);
  };

  const roleBadge = {
    admin: "bg-[#C6922B]/15 text-[#C6922B] border-[#C6922B]/20",
    moderator: "bg-blue-500/15 text-blue-400 border-blue-400/20",
    user: "bg-white/5 text-gray-400 border-white/10",
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 transition group">

      {/* Avatar */}
      <div className="flex-shrink-0">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-12 h-12 rounded-xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[#C6922B]/15 border border-[#C6922B]/20 flex items-center justify-center text-[#C6922B] text-sm font-black">
            {initials(user.displayName || user.email)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-sm truncate">
            {user.displayName || "—"}
          </p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-wider ${roleBadge[user.role] || roleBadge.user}`}>
            {user.role || "user"}
          </span>
          {user.banned && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border bg-red-500/15 text-red-400 border-red-400/20 font-black uppercase tracking-wider">
              Banned
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
        {user.phone && (
          <p className="text-xs text-gray-600 mt-0.5">{user.phone}</p>
        )}
      </div>

      {/* Date */}
      <div className="hidden md:flex items-center gap-1.5 text-gray-600 text-xs flex-shrink-0">
        <FaCalendarAlt className="text-[10px]" />
        {user.createdAt
          ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString()
          : "—"}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onEdit(user)}
          title="Edit user"
          className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:border-[#C6922B] hover:text-[#C6922B] transition"
        >
          <FaEdit className="text-xs" />
        </button>

        <button
          onClick={handleBan}
          disabled={banning}
          title={user.banned ? "Unban user" : "Ban user"}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
            user.banned
              ? "border-green-500/30 bg-green-500/10 text-green-400 hover:border-green-400"
              : "border-white/10 bg-white/5 text-gray-400 hover:border-red-400 hover:text-red-400"
          }`}
        >
          {banning ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : user.banned ? (
            <FaCheckCircle className="text-xs" />
          ) : (
            <FaBan className="text-xs" />
          )}
        </button>

        <button
          onClick={() => onDelete(user)}
          title="Delete user"
          className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-400 transition"
        >
          <FaTrash className="text-xs" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | admin | moderator | user | banned
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError("Failed to load users. Check Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  // ── Save edit ──────────────────────────────────────────────────────────────
  const handleSave = async (id, form) => {
    const update = { ...form };
    if (!update.password) delete update.password; // don't overwrite with blank
    await updateDoc(doc(db, "users", id), update);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...update } : u))
    );
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", id));
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // ── Ban toggle ─────────────────────────────────────────────────────────────
  const handleToggleBan = async (id, banned) => {
    await updateDoc(doc(db, "users", id), { banned });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, banned } : u))
    );
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.phone || "").toLowerCase().includes(q);

    const matchesFilter =
      filter === "all" ||
      (filter === "banned" ? u.banned : u.role === filter);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    banned: users.filter((u) => u.banned).length,
    active: users.filter((u) => !u.banned).length,
  };

  const filterBtns = [
    { key: "all", label: "All" },
    { key: "admin", label: "Admins" },
    { key: "moderator", label: "Moderators" },
    { key: "user", label: "Users" },
    { key: "banned", label: "Banned" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pt-24 lg:pl-[280px]">
      <div className="px-4 md:px-8 py-8">

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="text-[#C6922B] uppercase tracking-[0.3em] text-xs mb-2">
            Admin Panel
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-1">Users</h1>
          <p className="text-gray-500 text-sm">
            Manage all registered users — edit, ban, or remove accounts.
          </p>
        </div>

        {/* ── STATS ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.total, color: "text-white" },
            { label: "Admins", value: stats.admins, color: "text-[#C6922B]" },
            { label: "Active", value: stats.active, color: "text-green-400" },
            { label: "Banned", value: stats.banned, color: "text-red-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]"
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
                {s.label}
              </p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── CONTROLS ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">

          {/* Search */}
          <div className="flex items-center gap-3 flex-1 px-5 h-14 rounded-2xl border border-white/10 bg-white/5 focus-within:border-[#C6922B] transition">
            <FaSearch className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="bg-transparent outline-none text-sm placeholder:text-gray-600 flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-500 hover:text-white transition">
                <FaTimes />
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchUsers}
            className="h-14 px-6 rounded-2xl border border-white/10 bg-white/5 text-sm font-black hover:border-[#C6922B] hover:text-[#C6922B] transition"
          >
            Refresh
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterBtns.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition ${
                filter === f.key
                  ? "bg-[#C6922B] text-black border-[#C6922B]"
                  : "border-white/10 bg-white/5 text-gray-400 hover:border-[#C6922B] hover:text-[#C6922B]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── USER LIST ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FaSpinner className="animate-spin text-[#C6922B] text-3xl" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FaExclamationTriangle className="text-red-400 text-4xl" />
            <p className="text-red-400 font-black">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-6 py-3 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FaUser className="text-gray-700 text-5xl" />
            <p className="text-gray-500 font-black">No users found</p>
            {search && (
              <p className="text-gray-700 text-sm">
                No results for &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-xs mb-4 uppercase tracking-widest">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-3">
              {filtered.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={setEditUser}
                  onDelete={setDeleteUser}
                  onToggleBan={handleToggleBan}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSave}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}