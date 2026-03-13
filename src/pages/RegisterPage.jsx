import { useState } from 'react';
import { registerUser } from '../services/api';

const GROUPS = ['Group A', 'Group B', 'Group C', 'Staff', 'VIP'];

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', group: GROUPS[0], rollno: '', region: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerUser(form);
      setResult(res.data.user);
      setForm({ name: '', email: '', phone: '', group: GROUPS[0], rollno: '', region: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:pt-28">
      <div className="reveal">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
            </span>
            Identity Enrollment
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Register Attendee</h1>
          <p className="mt-2 text-slate-400 font-medium tracking-tight">Issue new credentials and generate unique verification keys.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-3">
            <div className="glass-panel p-8 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Satyam Singh"
                      className="input-premium"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="satyam@example.com"
                      className="input-premium"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 99999 99999"
                      className="input-premium"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Classification Group</label>
                    <select
                      className="input-premium appearance-none"
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                    >
                      {GROUPS.map((g) => (
                        <option key={g} value={g} className="bg-slate-900 text-white">{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Roll Number</label>
                    <input
                      type="text"
                      placeholder="2024CS01"
                      className="input-premium"
                      value={form.rollno}
                      onChange={(e) => setForm({ ...form, rollno: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Operational Region</label>
                    <input
                      type="text"
                      placeholder="North Sector"
                      className="input-premium"
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-premium w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <span>Enroll & Generate Key</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result Card */}
          <div className="xl:col-span-2">
            {result ? (
              <div className="glass-panel p-8 rounded-3xl text-center transform scale-100 transition-all border-emerald-500/20 bg-emerald-500/5">
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Enrollment Verified
                  </div>
                </div>
                
                <div className="mb-6 mx-auto w-full aspect-square max-w-[200px] overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
                  <img src={result.qrCode} alt="QR Code" className="h-full w-full object-cover" />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{result.name}</h3>
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{result.group} &bull; {result.region || 'Global'}</p>
                  </div>
                  
                  <div className="rounded-2xl bg-black/20 p-4 text-left space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase">ID Number</span>
                      <span className="text-white font-mono">{result.rollno || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold uppercase">Auth Channel</span>
                      <span className="text-white font-mono">{result.email}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => window.print()}
                    className="btn-ghost w-full uppercase tracking-widest"
                  >
                    Print Verification Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-slate-500">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Awaiting Registration Submission</p>
                <p className="mt-2 text-xs font-medium text-slate-600">The verification key will appear here after processing.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
