import { useEffect, useMemo, useState } from 'react';
import { getAttendance, updateAttendanceLog, deleteAttendanceLog } from '../services/api';

const emptyLogEdit = {
  id: null,
  name: '',
  group: '',
  sessionId: '',
  markedBy: '',
};

const AttendancePage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(emptyLogEdit);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getAttendance();
      setLogs(res.data.records || []);
      setError('');
    } catch {
      setError('Failed to fetch attendance logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return logs;

    return logs.filter((log) =>
      [log.name, log.group, log.sessionId, log.markedBy, log.userId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [logs, query]);

  const openEdit = (log) => {
    setEditForm({
      id: log.id,
      name: log.name || '',
      group: log.group || '',
      sessionId: log.sessionId || '',
      markedBy: log.markedBy || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.id) return;

    setEditLoading(true);
    try {
      await updateAttendanceLog(editForm.id, {
        name: editForm.name,
        group: editForm.group,
        sessionId: editForm.sessionId,
        markedBy: editForm.markedBy,
      });

      setShowEditModal(false);
      setEditForm(emptyLogEdit);
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update log');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await deleteAttendanceLog(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove log');
    }
  };

  const downloadCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Time', 'Name', 'Group', 'Session', 'Marked By'];
    const rows = filteredLogs.map((log) => [
      `"${new Date(log.scannedAt).toLocaleString().replace(/"/g, '""')}"`,
      `"${(log.name || 'Unknown').replace(/"/g, '""')}"`,
      `"${(log.group || 'N/A').replace(/"/g, '""')}"`,
      `"${(log.sessionId || 'default-session').replace(/"/g, '""')}"`,
      `"${(log.markedBy || 'System').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'attendance_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:pt-28">
        <div className="reveal space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">Scanned Logs</h1>
              <p className="mt-1 text-slate-400 font-medium tracking-tight">Search, edit, and remove scanned attendance records.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadCSV} className="btn-ghost disabled:opacity-50" disabled={filteredLogs.length === 0}>
                Download CSV
              </button>
              <button onClick={fetchLogs} className="btn-ghost">Refresh</button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-3 sm:p-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-premium"
              placeholder="Search logs by name, group, session, scanner"
            />
          </div>

          {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>}

          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Attendance Records</h2>
              <span className="text-xs uppercase text-slate-500">{filteredLogs.length} results</span>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Time</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Name</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Group</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Session</th>
                    <th className="px-6 py-4 text-xs uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No logs found</td></tr>
                  ) : filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 text-slate-300">{new Date(log.scannedAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-white font-semibold">{log.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-indigo-400">{log.group || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-300">{log.sessionId || 'default-session'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="btn-ghost" onClick={() => openEdit(log)}>Edit</button>
                          <button className="btn-danger" onClick={() => handleDeleteLog(log.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {filteredLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-base font-bold text-white">{log.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{new Date(log.scannedAt).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-indigo-400">{log.group || 'N/A'} • {log.sessionId || 'default-session'}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-ghost" onClick={() => openEdit(log)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDeleteLog(log.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <form className="glass-panel w-full max-w-lg rounded-3xl p-6" onSubmit={handleEditSubmit}>
            <h3 className="text-xl font-bold text-white">Edit Attendance Log</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="input-premium" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
              <input className="input-premium" placeholder="Group" value={editForm.group} onChange={(e) => setEditForm((p) => ({ ...p, group: e.target.value }))} />
              <input className="input-premium" placeholder="Session ID" value={editForm.sessionId} onChange={(e) => setEditForm((p) => ({ ...p, sessionId: e.target.value }))} />
              <input className="input-premium" placeholder="Marked By" value={editForm.markedBy} onChange={(e) => setEditForm((p) => ({ ...p, markedBy: e.target.value }))} />
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

export default AttendancePage;