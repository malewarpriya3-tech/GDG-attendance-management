import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import AttendanceForm from './components/AttendanceForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

function App() {
  const [currentPage, setCurrentPage] = useState<'form' | 'login' | 'dashboard'>('form');
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setAdminToken(savedToken);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleAdminLoginSuccess = (token: string) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setCurrentPage('form');
  };

  const handleNavigateToAdmin = () => {
    if (adminToken) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {currentPage === 'form' && (
        <AttendanceForm onNavigateToAdmin={handleNavigateToAdmin} />
      )}

      {currentPage === 'login' && (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToForm={() => setCurrentPage('form')}
        />
      )}

      {currentPage === 'dashboard' && adminToken && (
        <div>
          <div className="flex justify-between items-center bg-white border-b border-blue-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
          <AdminDashboard token={adminToken} />
        </div>
      )}
    </div>
  );
}

export default App;
