import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaCalendarAlt, FaClipboardList, 
  FaUserClock, FaCalendarPlus, FaEnvelope 
} from 'react-icons/fa';

function Sidebar() {
  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/timetable', icon: <FaCalendarAlt />, label: 'Timetable' },
    { path: '/sessions', icon: <FaClipboardList />, label: 'Sessions' },
    { path: '/absence-requests', icon: <FaUserClock />, label: 'Absence Requests' },
    { path: '/makeup-sessions', icon: <FaCalendarPlus />, label: 'Make-Up Sessions' },
    { path: '/messages', icon: <FaEnvelope />, label: 'Messages' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>TUNUNIVERSITY</h2>
      
      </div>
      <nav>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
