import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navItem = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-white/10 text-primary'
      : 'text-secondary hover:bg-white/5 hover:text-primary'
  }`;

const DashboardShell = ({ children }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pb-8 lg:grid-cols-[240px_1fr]">
        <aside className={`glass-panel fixed inset-y-20 left-4 z-40 w-64 rounded-2xl p-4 transition lg:static lg:w-auto ${open ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}`}>
          <Link to="/admin" className="mb-4 block border-b border-white/10 pb-4">
            <p className="text-xs tracking-[0.14em] text-muted">WORKSPACE</p>
            <h2 className="mt-1 text-xl font-bold text-primary">ScanPro Admin</h2>
          </Link>
          <nav className="space-y-1">
            <NavLink to="/admin" end className={navItem} onClick={() => setOpen(false)}>Dashboard</NavLink>
            <NavLink to="/admin/attendance" className={navItem} onClick={() => setOpen(false)}>Attendance</NavLink>
            <NavLink to="/admin/register" className={navItem} onClick={() => setOpen(false)}>Register User</NavLink>
          </nav>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-secondary">
            Tip: Import CSV first, then verify scans in real time.
          </div>
        </aside>

        <main className="space-y-4">
          <div className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3">
            <button className="btn-ghost lg:hidden" onClick={() => setOpen((v) => !v)}>
              Menu
            </button>
            <div className="text-sm text-secondary">
              Signed in as <span className="font-semibold text-primary">{admin?.email}</span>
            </div>
            <button onClick={onLogout} className="btn-danger">Logout</button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
