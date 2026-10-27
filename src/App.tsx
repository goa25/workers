import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PledgeCatalog from './pages/PledgeCatalog';
import ActivityReport from './pages/ActivityReport';
import Leaderboard from './pages/Leaderboard';
import Certificates from './pages/Certificates';
import ReviewerPortal from './pages/ReviewerPortal';
import CampaignDashboard from './pages/CampaignDashboard';
import ProfilePage from './pages/ProfilePage';
import StandardsPage from './pages/StandardsPage';
import AppealsPage from './pages/AppealsPage';
import { useApp } from './context/AppContext';

interface AuthUser {
  id: string; name: string; email: string;
  role: 'participant' | 'reviewer' | 'admin';
  organization?: string;
  city?: string;
  state?: string;
  ageGroup?: string;
  occupation?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (u: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null, login: () => {}, logout: () => {}, isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

// Sign-in is not required: all routes are open to everyone.
const isLocalPreview = true;

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireRole?: 'reviewer' | 'admin' }> = ({ children, requireRole }) => {
  const { isAuthenticated, user } = useAuth();
  if (isLocalPreview) return <>{children}</>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (requireRole && user?.role !== requireRole && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppPage: React.FC<{ children: React.ReactNode }> = ({ children }) => <><Navbar /><main className="pt-16">{children}</main><Footer /></>;

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { login: appLogin, logout: appLogout } = useApp();

  const login = (u: AuthUser) => {
    setUser(u);
    appLogin({
      id: u.id,
      name: u.name,
      email: u.email,
      organization: u.organization,
      role: u.role === 'participant' ? 'user' : u.role as any,
      authMethod: 'otp',
      co2Saved: 0,
      pledgesActive: [],
      certificatesEarned: [],
      joinedAt: new Date().toISOString(),
    });
  };

  const logout = () => { setUser(null); appLogout(); };

  const authValue: AuthContextType = { user, login, logout, isAuthenticated: !!user };

  // AuthPage onAuth callback signature now includes userId
  const handleAuth = (u: { name: string; email: string; userId: string; organization?: string; role: 'user' | 'reviewer' | 'admin' }) => {
    login({ id: u.userId, name: u.name, email: u.email, organization: u.organization, role: u.role === 'user' ? 'participant' : u.role });
  };

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={isLocalPreview || user ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={handleAuth} />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppPage><Dashboard /></AppPage></ProtectedRoute>} />
            <Route path="/pledges" element={<AppPage><PledgeCatalog /></AppPage>} />
            <Route path="/activity" element={<ProtectedRoute><AppPage><ActivityReport /></AppPage></ProtectedRoute>} />
            <Route path="/leaderboard" element={<AppPage><Leaderboard /></AppPage>} />
            <Route path="/certificates" element={<ProtectedRoute><AppPage><Certificates /></AppPage></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppPage><ProfilePage /></AppPage></ProtectedRoute>} />
            <Route path="/reviewer" element={<ProtectedRoute requireRole="reviewer"><AppPage><ReviewerPortal /></AppPage></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute requireRole="admin"><AppPage><CampaignDashboard /></AppPage></ProtectedRoute>} />
            <Route path="/standards" element={<AppPage><StandardsPage /></AppPage>} />
            <Route path="/appeals" element={<ProtectedRoute><AppPage><AppealsPage /></AppPage></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
