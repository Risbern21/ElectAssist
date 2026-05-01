import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home, Users, MessageSquare, Map as MapIcon, ShieldCheck, BookOpen, LogOut, ShieldAlert, Menu, X } from 'lucide-react';
import { auth, googleProvider, db, doc, setDoc, getDoc, serverTimestamp } from '../../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { adminApi, authApi } from '../../lib/api';
import './Layout.css';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 1. Sync User to Firestore and set Custom Claims (Auth Part)
        // We do this via the backend to ensure the role is saved in the ID token claims
        await authApi.syncRole();

        // Force refresh the token to retrieve the newly set custom claims
        await currentUser.getIdToken(true);

        // 2. Check Admin Status
        const adminStatus = await adminApi.verifyStatus();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <div className="layout">
      <nav className="glass-nav">
        <div className="nav-container container flex-between">
          <Link to="/" className="brand flex-center">
            <ShieldCheck className="brand-logo" size={32} />
            <span className="brand-text">ElectAssist</span>
          </Link>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}><Home size={20} /><span>Home</span></Link>
            <Link to="/guide" className="nav-link" onClick={() => setIsMenuOpen(false)}><BookOpen size={20} /><span>Guide</span></Link>
            <Link to="/candidates" className="nav-link" onClick={() => setIsMenuOpen(false)}><Users size={20} /><span>Candidates</span></Link>
            <Link to="/map" className="nav-link" onClick={() => setIsMenuOpen(false)}><MapIcon size={20} /><span>Map</span></Link>
            <Link to="/chat" className="nav-link" onClick={() => setIsMenuOpen(false)}><MessageSquare size={20} /><span>AI Chat</span></Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link" onClick={() => setIsMenuOpen(false)}><ShieldAlert size={20} className="text-accent" /><span>Admin Panel</span></Link>
            )}
          </div>

          <div className="nav-actions flex-center" style={{ gap: '12px' }}>
            <div className="auth-section flex-center" style={{ gap: '12px' }}>
              {user ? (
                <div className="flex-center" style={{ gap: '12px' }}>
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`}
                    alt="User"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--secondary)' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{user.displayName || 'Citizen'}</span>
                    <span className="text-success">Verified</span>
                  </div>
                  <button className="icon-btn" onClick={handleSignOut} title="Sign Out">
                    <LogOut size={18} className="text-muted"
                      color='white' />
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={handleSignIn}>Sign In</button>
              )}
            </div>

            <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer glass-panel">
        <div className="container flex-center">
          <p className="text-muted">© 2026 ElectAssist. Empowering Citizens through Election Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
