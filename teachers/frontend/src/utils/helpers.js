export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    scheduled: 'badge-primary',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    rescheduled: 'badge-warning',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    justified: 'badge-success',
    unjustified: 'badge-danger',
  };
  
  return statusClasses[status?.toLowerCase()] || 'badge-secondary';
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};
