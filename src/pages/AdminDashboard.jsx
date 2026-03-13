import { useState, useEffect } from 'react';
import { getAllUsers, bulkUploadUsers, deleteAllUsers } from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, groups: 0 });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.users);
      
      // Calculate stats
      const total = res.data.users.length;
      const active = res.data.users.filter(u => u.isActive).length;
      const groups = new Set(res.data.users.map(u => u.group)).size;
      setStats({ total, active, groups });
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadStatus(null);
    setDeleteStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await bulkUploadUsers(formData);
      setUploadStatus({
        success: true,
        message: `Successfully uploaded ${res.data.processedCount} users.`
      });
      fetchUsers();
    } catch (err) {
      setUploadStatus({
        success: false,
        message: err.response?.data?.message || 'Bulk upload failed'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteAllUsers = async () => {
    setDeleteLoading(true);
    setDeleteStatus(null);
    try {
      const res = await deleteAllUsers();
      setDeleteStatus({
        success: true,
        message: `Deleted ${res.data.deletedCount} users.`
      });
      setUsers([]);
      setStats({ total: 0, active: 0, groups: 0 });
    } catch (err) {
      setDeleteStatus({
        success: false,
        message: err.response?.data?.message || 'Delete failed'
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-12">
        <div className="reveal space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Admin Console</h1>
            <p className="mt-1 text-slate-400 font-medium tracking-tight">Manage users, groups, and infrastructure access.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-1">
            <label className={`btn-ghost cursor-pointer ${uploadLoading ? 'pointer-events-none opacity-50' : ''}`}>
              <input type="file" className="hidden" accept=".csv" onChange={handleBulkUpload} disabled={uploadLoading} />
              {uploadLoading ? 'Uploading...' : 'Import CSV'}
            </label>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger"
            >
              Drop CSV Data
            </button>
            <a href="/admin/register" className="btn-premium flex items-center gap-2 text-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add User</span>
            </a>
          </div>
        </div>

        {uploadStatus && (
          <div className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium animate-slideUp ${
            uploadStatus.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={uploadStatus.success ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
            {uploadStatus.message}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400 animate-slideUp">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {deleteStatus && (
          <div className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium animate-slideUp ${
            deleteStatus.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={deleteStatus.success ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
            {deleteStatus.message}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: 'Total Registrations', value: stats.total, color: 'text-indigo-400', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { label: 'Active Users', value: stats.active, color: 'text-emerald-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Unique Groups', value: stats.groups, color: 'text-purple-400', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 rounded-3xl transition-all hover:translate-y-[-4px]">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
                <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Real-time</span>
              </div>
              <h3 className={`text-4xl font-bold ${stat.color}`}>{stat.value}</h3>
              <p className="mt-1 text-sm text-slate-500 font-bold uppercase tracking-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="glass-panel overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-8 py-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Directory</h2>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Showing {users.length} identity records
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">Identity</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">Classification</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">Location</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500 text-center">Protocol Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
                        <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">Initializing Directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-500 font-medium">No records found. Start by adding a user or importing a CSV.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-lg">
                            {user.name[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tight">{user.name}</span>
                            <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">{user.group}</span>
                          <span className="text-[10px] font-mono text-slate-600 uppercase">Roll: {user.rollno || 'PENDING'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {user.region || 'Global'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${
                          user.isActive
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'border-slate-800 bg-slate-900 text-slate-600'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white">Drop CSV Data</h3>
            <p className="mt-2 text-sm text-slate-400">
              This deletes all users imported from CSV (and any manually added users). This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteAllUsers}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete All Users'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
