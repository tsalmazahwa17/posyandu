"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  ShieldCheck,
  User,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import PasswordResetQueue from "@/components/admin/PasswordResetQueue";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserRow {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "KADER" | "MASYARAKAT";
  isActive: boolean;
  mustChangePassword: boolean;
  passwordChangedAt: string | null;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function roleBadge(role: string) {
  if (role === "ADMIN")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
        <ShieldCheck className="w-3 h-3" /> Admin
      </span>
    );
  if (role === "MASYARAKAT")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
        <User className="w-3 h-3" /> Masyarakat
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
      <User className="w-3 h-3" /> Kader
    </span>
  );
}

function statusBadge(isActive: boolean) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
      Nonaktif
    </span>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Modal Tambah / Edit User ─────────────────────────────────────────────────

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editUser: UserRow | null;
  onSuccess: () => void;
}

function UserFormModal({ isOpen, onClose, editUser, onSuccess }: UserFormModalProps) {
  const isEdit = !!editUser;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "KADER" | "MASYARAKAT">("KADER");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevEditUser, setPrevEditUser] = useState(editUser);

  if (prevIsOpen !== isOpen || prevEditUser !== editUser) {
    setPrevIsOpen(isOpen);
    setPrevEditUser(editUser);
    if (isOpen) {
      setError(null);
      setShowPassword(false);
      if (editUser) {
        setFullName(editUser.fullName);
        setEmail(editUser.email);
        setPassword("");
        setRole(editUser.role);
        setIsActive(editUser.isActive);
      } else {
        setFullName("");
        setEmail("");
        setPassword("");
        setRole("KADER");
        setIsActive(true);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim()) {
      setError("Nama lengkap dan email wajib diisi.");
      return;
    }
    if (!isEdit && !password) {
      setError("Kata sandi wajib diisi untuk akun baru.");
      return;
    }
    if (!isEdit && password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/users/${editUser!.id}` : "/api/users";
      const method = isEdit ? "PATCH" : "POST";
      const body: Record<string, unknown> = { fullName, email, role };
      if (!isEdit) body.password = password;
      if (isEdit) body.isActive = isActive;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menyimpan data.");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEdit ? "Edit Akun Pengguna" : "Tambah Akun Baru"}
            </h2>
            <p className="text-blue-100 text-xs mt-0.5">
              {isEdit
                ? "Perbarui data akun yang sudah ada"
                : "Akun baru wajib ganti password saat login pertama"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              disabled={loading}
              className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@posyanduaster.id"
              disabled={loading}
              className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Kata Sandi Sementara
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  disabled={loading}
                  className="w-full h-10 border border-gray-200 rounded-xl pl-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Pengguna wajib ganti password ini saat login pertama.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Peran
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "KADER" | "MASYARAKAT")}
                disabled={loading}
                className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60"
              >
                <option value="KADER">Kader</option>
                <option value="MASYARAKAT">Masyarakat</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {isEdit && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  disabled={loading}
                  className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all disabled:opacity-60"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{isEdit ? "Simpan Perubahan" : "Buat Akun"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Reset Password ─────────────────────────────────────────────────────

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRow | null;
  onSuccess: () => void;
}

function ResetPasswordModal({ isOpen, onClose, user, onSuccess }: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setError(null);
      setTempPassword(null);
      setCopied(false);
    }
  }

  const handleReset = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mereset password.");
        return;
      }
      setTempPassword(data.tempPassword);
      onSuccess();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Reset Kata Sandi</h2>
            <p className="text-amber-100 text-xs mt-0.5">{user.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!tempPassword ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Konfirmasi Reset Password</p>
                <p className="text-xs leading-relaxed">
                  Sistem akan membuat password sementara baru. Pengguna wajib mengganti
                  password tersebut saat login berikutnya.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1 h-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all shadow-md shadow-amber-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mereset...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-bold text-slate-800">Password Berhasil Direset!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Bagikan password sementara ini ke <strong>{user.fullName}</strong>
                </p>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between gap-3">
                <code className="text-emerald-400 font-mono text-lg tracking-widest font-bold">
                  {tempPassword}
                </code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-center text-gray-400">
                Password ini tidak akan ditampilkan lagi. Segera bagikan ke pengguna.
              </p>

              <button
                onClick={onClose}
                className="w-full h-10 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Selesai & Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal Konfirmasi Hapus ────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRow | null;
  onSuccess: () => void;
}

function DeleteConfirmModal({ isOpen, onClose, user, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setError(null);
  }

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal menghapus akun.");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Hapus Akun?</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Akun <strong>{user.fullName}</strong> akan dihapus secara permanen.
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-all shadow-md shadow-red-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (res.ok && !ignore) setUsers(data);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  useRealtimeRefresh(fetchUsers, ["users"]);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h1>
            <p className="text-xs text-slate-500">
              Kelola akun pengguna sistem Posyandu Aster
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditUser(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Akun Baru
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-center">
            <p className="text-lg font-bold text-slate-800">{users.length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Akun</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-center">
            <p className="text-lg font-bold text-emerald-600">{users.filter((u) => u.isActive).length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Aktif</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-center">
            <p className="text-lg font-bold text-amber-500">{users.filter((u) => u.mustChangePassword).length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Perlu Ganti Sandi</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-sm">Memuat data pengguna...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <UserCog className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {search ? "Tidak ada pengguna yang cocok" : "Belum ada data pengguna"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Peran
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Sandi
                  </th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {getInitials(user.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{user.fullName}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{roleBadge(user.role)}</td>
                    <td className="px-4 py-4">{statusBadge(user.isActive)}</td>
                    <td className="px-4 py-4">
                      {user.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          ⚠ Belum Diganti
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          ✓ Aman
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reset Password */}
                        <button
                          onClick={() => setResetUser(user)}
                          title="Reset Password"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setIsFormOpen(true);
                          }}
                          title="Edit Pengguna"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteUser(user)}
                          title="Hapus Pengguna"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
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

      <PasswordResetQueue />

      {/* Modals */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditUser(null);
        }}
        editUser={editUser}
        onSuccess={fetchUsers}
      />
      <ResetPasswordModal
        isOpen={!!resetUser}
        onClose={() => setResetUser(null)}
        user={resetUser}
        onSuccess={fetchUsers}
      />
      <DeleteConfirmModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        user={deleteUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
