import { Outlet, NavLink } from 'react-router-dom';
import { FaInbox, FaPaperPlane, FaEdit } from 'react-icons/fa';

function Messages({ teacherId }) {
  return (
    <div>
      <h1 className="mb-3">Messages</h1>

      <div className="card">
        <div className="flex gap-2 mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <NavLink 
            to="/messages/inbox" 
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FaInbox /> Inbox
          </NavLink>
          <NavLink 
            to="/messages/sent" 
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FaPaperPlane /> Sent
          </NavLink>
          <NavLink 
            to="/messages/compose" 
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FaEdit /> Compose
          </NavLink>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default Messages;
