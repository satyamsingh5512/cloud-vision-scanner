import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllUsers, bulkUploadUsers, deleteAllUsers, updateUser, deleteUser } from '../services/api';

const emptyEdit = {
  userId: '',
  name: '',
  email: '',
  phone: '',
  group: '',
  rollno: '',
  region: '',
  isActive: true,
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, groups: 0 });
  const [query, setQuery] = useState('');

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState(emptyEdit);

  const computeStats = (list) => {
    const total = list.length;
    const active = list.filter((user) => user.isActive).length;
    const groups = new Set(list.map((user) => user.group)).size;
    setStats({ total, active, groups });
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAllUsers();
      const list = res.data.users || [];
      setUsers(list);
      computeStats(list);
      setError('');
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;

    return users.filter((user) =>
      [user.name, user.email, user.group, user.region, user.rollno, user.userId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [users, query]);

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
      e.target.value = '';
    }
  };

  const handleDeleteAllUsers = async () => {
    setDeleteLoading(true);
    setDeleteStatus(null);
    try {
      const res = await deleteAllUsers();
      setDeleteStatus({ success: true, message: `Deleted ${res.data.deletedCount} users.` });
      setUsers([]);
      setStats({ total: 0, active: 0, groups: 0 });
    } catch (err) {
      setDeleteStatus({ success: false, message: err.response?.data?.message || 'Delete failed' });
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const openEdit = (user) => {
    setEditForm({
      userId: user.userId,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      group: user.group || '',
      rollno: user.rollno || '',
      region: user.region || '',
      isActive: Boolean(user.isActive),
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.userId) return;

    setEditLoading(true);
    try {
      await updateUser(editForm.userId, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        group: editForm.group,
        rollno: editForm.rollno,
        region: editForm.region,
        isActive: editForm.isActive,
      });

      setShowEditModal(false);
      setEditForm(emptyEdit);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers((prev) => {
        const next = prev.filter((user) => user.userId !== userId);
        computeStats(next);
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:pt-28">
        <div className="reveal space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Admin Console</h1>
              <p className="mt-1 text-slate-400 font-medium tracking-tight">Manage students and attendance records.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-1">
              <label className={`btn-ghost cursor-pointer ${uploadLoading ? 'pointer-events-none opacity-50' : ''}`}>
                <input type="file" className="hidden" accept=".csv" onChange={handleBulkUpload} disabled={uploadLoading} />
                {uploadLoading ? 'Uploading...' : 'Import CSV'}
              </label>
              <button type="button" onClick={() => setShowDeleteModal(true)} className="btn-danger">Drop CSV Data</button>
              <a href="/admin/register" className="btn-premium flex items-center gap-2 text-sm">
                <span>Add User</span>
              </a>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-3 sm:p-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-premium"
              placeholder="Search students by name, email, group, roll, region"
            />
          </div>

          {uploadStatus && <div className={`rounded-2xl border p-4 text-sm ${uploadStatus.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>{uploadStatus.message}</div>}
          {deleteStatus && <div className={`rounded-2xl border p-4 text-sm ${deleteStatus.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}>{deleteStatus.message}</div>}
          {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Total', value: stats.total },
              { label: 'Active', value: stats.active },
              { label: 'Groups', value: stats.groups },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-3xl p-6">
                <p className="text-xs uppercase text-slate-500">{stat.label}</p>
                <h3 className="mt-2 text-4xl font-black text-white">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Students</h2>
              <span className="text-xs uppercase text-slate-500">{filteredUsers.length} results</span>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Name</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Email</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Group</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Region</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No users found</td></tr>
                  ) : filteredUsers.map((user) => (
                    <tr key={user.userId}>
                      <td className="px-6 py-4 text-white font-semibold">{user.name}</td>
                      <td className="px-6 py-4 text-slate-400">{user.email}</td>
                      <td className="px-6 py-4 text-indigo-400">{user.group}</td>
                      <td className="px-6 py-4 text-slate-300">{user.region || 'Global'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="btn-ghost" onClick={() => openEdit(user)}>Edit</button>
                          <button className="btn-danger" onClick={() => handleDeleteUser(user.userId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user.userId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-base font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <div className="mt-2 text-xs text-slate-300">{user.group} • {user.region || 'Global'}</div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-ghost" onClick={() => openEdit(user)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDeleteUser(user.userId)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white">Delete All Students</h3>
            <p className="mt-2 text-sm text-slate-400">This removes all student data. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteAllUsers} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete All'}</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <form className="glass-panel w-full max-w-lg rounded-3xl p-6" onSubmit={handleEditSubmit}>
            <h3 className="text-xl font-bold text-white">Edit Student</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="input-premium" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
              <input className="input-premium" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
              <input className="input-premium" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
              <input className="input-premium" placeholder="Group" value={editForm.group} onChange={(e) => setEditForm((p) => ({ ...p, group: e.target.value }))} />
              <input className="input-premium" placeholder="Roll No" value={editForm.rollno} onChange={(e) => setEditForm((p) => ({ ...p, rollno: e.target.value }))} />
              <input className="input-premium" placeholder="Region" value={editForm.region} onChange={(e) => setEditForm((p) => ({ ...p, region: e.target.value }))} />
              <label className="col-span-full flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active user
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-ghost" onClick={() => setShowEditModal(false)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="btn-premium" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;