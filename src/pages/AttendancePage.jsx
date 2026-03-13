import { useState, useEffect } from 'react';
import { getAttendance } from '../services/api';

const AttendancePage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getAttendance();
      setLogs(res.data.records || []);
    } catch {
      setError('Failed to fetch attendance logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-12">
      <div className="reveal space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Audit Trail
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Access Journals</h1>
            <p className="mt-1 text-slate-400 font-medium tracking-tight">Real-time chronical of all identity verifications and entry events.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-1">
            <button 
              onClick={fetchLogs}
              className="btn-ghost flex items-center gap-2"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Logs
            </button>
            <button 
              onClick={() => window.print()}
              className="btn-premium flex items-center gap-2 text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="glass-panel overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <h2 className="text-xl font-bold text-white tracking-tight">Verification History</h2>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
               Live Sync Active
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">Timestamp</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">Attendee</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">Classification</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500 text-right">Location Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
                        <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">Fetching Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-500 font-medium">No activity recorded today.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white font-mono">
                            {new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                            {new Date(log.scannedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-indigo-400 font-bold text-xs">
                            {(log.name || '?')[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white tracking-tight">{log.name || 'Unknown'}</span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">Session: {log.sessionId || 'default-session'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                          {log.group || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          {log.markedBy || 'scanner'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
