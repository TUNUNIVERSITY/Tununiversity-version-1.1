import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ teacherId }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content-wrapper">
        <Header teacherId={teacherId} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
