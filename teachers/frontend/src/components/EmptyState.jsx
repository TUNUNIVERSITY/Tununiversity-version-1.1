import { FaInbox } from 'react-icons/fa';

function EmptyState({ icon: Icon = FaInbox, message = 'No data available' }) {
  return (
    <div className="empty-state">
      <Icon />
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
