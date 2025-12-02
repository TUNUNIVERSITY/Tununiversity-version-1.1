import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Sessions from './pages/Sessions';
import SessionDetails from './pages/SessionDetails';
import TakeAttendance from './pages/TakeAttendance';
import AbsenceRequests from './pages/AbsenceRequests';
import MakeupSessions from './pages/MakeupSessions';
import Messages from './pages/Messages';
import Inbox from './pages/Inbox';
import SentMessages from './pages/SentMessages';
import MessageView from './pages/MessageView';
import ComposeMessage from './pages/ComposeMessage';
import Profile from './pages/Profile';

function App() {
  const [teacherId, setTeacherId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for authentication parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    
    if (authParam) {
      try {
        // Decode the auth data
        const authData = JSON.parse(atob(authParam));
        
        // Store in localStorage
        if (authData.token) localStorage.setItem('token', authData.token);
        if (authData.user) {
          localStorage.setItem('userId', authData.user.id);
          localStorage.setItem('userCin', authData.user.cin);
          localStorage.setItem('userEmail', authData.user.email);
          localStorage.setItem('userFirstName', authData.user.firstName);
          localStorage.setItem('userLastName', authData.user.lastName);
          localStorage.setItem('userName', `${authData.user.firstName} ${authData.user.lastName}`);
          localStorage.setItem('userRole', authData.user.role);
          localStorage.setItem('userIsVerified', authData.user.isVerified);
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to decode auth parameter:', error);
      }
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    
    if (!token || userRole !== 'teacher' || !storedUserId) {
      window.location.href = 'http://localhost:3001';
      return;
    }
    
    // Fetch teacher record from user ID
    const fetchTeacherId = async () => {
      const userIdValue = parseInt(storedUserId);
      
      // Validate userId before proceeding
      if (isNaN(userIdValue)) {
        console.error('Invalid user ID');
        window.location.href = 'http://localhost:3001';
        return;
      }
      
      setUserId(userIdValue);
      
      try {
        const response = await fetch(`http://localhost:4000/api/teachers/by-user/${userIdValue}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setTeacherId(result.data.id);
            localStorage.setItem('teacherId', result.data.id);
          } else {
            console.error('Teacher record not found');
            setTeacherId(2); // Fallback to default teacher
          }
        } else {
          console.error('Failed to fetch teacher data');
          setTeacherId(2); // Fallback
        }
      } catch (error) {
        console.error('Error fetching teacher:', error);
        setTeacherId(2); // Fallback
      }
      setIsAuthenticated(true);
    };
    
    fetchTeacherId();
  }, []);

  if (!isAuthenticated || !teacherId || !userId) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout teacherId={teacherId} />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard teacherId={teacherId} />} />
        <Route path="timetable" element={<Timetable teacherId={teacherId} />} />
        <Route path="sessions" element={<Sessions teacherId={teacherId} />} />
        <Route path="sessions/:sessionId" element={<SessionDetails teacherId={teacherId} />} />
        <Route path="sessions/:sessionId/attendance" element={<TakeAttendance teacherId={teacherId} />} />
        <Route path="absence-requests" element={<AbsenceRequests teacherId={teacherId} />} />
        <Route path="makeup-sessions" element={<MakeupSessions teacherId={teacherId} />} />
        <Route path="profile" element={<Profile teacherId={teacherId} />} />
        <Route path="messages" element={<Messages teacherId={teacherId} />}>
          <Route index element={<Inbox teacherId={teacherId} userId={userId} />} />
          <Route path="inbox" element={<Inbox teacherId={teacherId} userId={userId} />} />
          <Route path="sent" element={<SentMessages teacherId={teacherId} userId={userId} />} />
          <Route path="compose" element={<ComposeMessage teacherId={teacherId} userId={userId} />} />
          <Route path=":messageId" element={<MessageView teacherId={teacherId} userId={userId} />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
