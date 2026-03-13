import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { isAuth, logout, admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = window.localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const activeLink = (path) =>
    location.pathname === path
      ? 'text-white bg-white/10'
      : 'text-slate-400 hover:text-white hover:bg-white/5';

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] px-3 pt-3 transition-all duration-300 sm:px-4 sm:pt-4">
      <nav className={`mx-auto max-w-6xl rounded-2xl transition-all duration-300 ${scrolled ? 'glass-panel px-4 py-3 sm:px-6' : 'px-3 py-3 sm:px-2 sm:py-4'}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-110">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 17h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white">SCAN<span className="text-indigo-400">PRO</span></span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold leading-none">Attendance</span>
            </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/scanner" className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeLink('/scanner')}`} onClick={closeMenu}>
              Scanner
            </Link>
            {isAuth && (
              <>
                <Link to="/admin" className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeLink('/admin')}`} onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/admin/attendance" className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeLink('/admin/attendance')}`} onClick={closeMenu}>
                  Logs
                </Link>
              </>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-ghost flex h-10 w-10 items-center justify-center"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M7.05 7.05 5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                </svg>
              )}
            </button>
            {isAuth ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{admin?.email.split('@')[0]}</span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">Administrator</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-1 hidden lg:block" />
                <button
                  onClick={handleLogout}
                  className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                  title="Logout"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="btn-premium flex items-center gap-2 text-sm"
              >
                <span>Login</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l4-4m0 0l-4-4m4 4H4m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Link>
            )}
            <button
              type="button"
              className="btn-ghost flex h-10 w-10 items-center justify-center md:hidden"
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3 md:hidden">
            <Link to="/scanner" onClick={closeMenu} className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-all ${activeLink('/scanner')}`}>
              Scanner
            </Link>
            {isAuth && (
              <>
                <Link to="/admin" onClick={closeMenu} className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-all ${activeLink('/admin')}`}>
                  Dashboard
                </Link>
                <Link to="/admin/attendance" onClick={closeMenu} className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-all ${activeLink('/admin/attendance')}`}>
                  Logs
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
