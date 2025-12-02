import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Reports from './pages/Reports'
import StudentsPage from './pages/StudentsPage'
import AbsencesPage from './pages/AbsencesPage'
import GradesPage from './pages/GradesPage'
import ImportExportPage from './pages/ImportExportPage'

function App() {
  useEffect(() => {
    // Check for auth data in URL (from cross-origin redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    
    if (authParam) {
      try {
        // Decode and store auth data from URL
        const authData = JSON.parse(atob(authParam));
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        localStorage.setItem('userRole', authData.user.role);
        localStorage.setItem('userName', `${authData.user.firstName || ''} ${authData.user.lastName || ''}`.trim() || authData.user.cin);
        localStorage.setItem('userEmail', authData.user.email || '');
        
        // Clean URL by removing auth parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        window.location.href = 'http://localhost:3001';
        return;
      }
    }
    
    // Check authentication
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    
    if (!token || (userRole !== 'admin' && userRole !== 'department_head')) {
      // Redirect to login if not authenticated or not admin/department_head
      window.location.href = 'http://localhost:3001'
    }
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Reports />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/absences" element={<AbsencesPage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/import-export" element={<ImportExportPage />} />
      </Routes>
    </Layout>
  )
}

export default App
