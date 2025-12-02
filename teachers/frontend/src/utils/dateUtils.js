import { format, parseISO, isToday, isTomorrow, startOfWeek, endOfWeek } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMM dd, yyyy');
  } catch {
    return date;
  }
};

export const formatTime = (time) => {
  if (!time) return '';
  try {
    // Handle HH:mm:ss or HH:mm format
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return time;
  }
};

export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  try {
    return format(parseISO(datetime), 'MMM dd, yyyy HH:mm');
  } catch {
    return datetime;
  }
};

export const getRelativeDate = (date) => {
  if (!date) return '';
  try {
    const dateObj = parseISO(date);
    if (isToday(dateObj)) return 'Today';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    return formatDate(date);
  } catch {
    return date;
  }
};

export const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber - 1] || '';
};

export const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Academic year starts in September
  if (month >= 8) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

export const getCurrentSemester = () => {
  const now = new Date();
  const month = now.getMonth();
  
  // Semester 1: September - January
  // Semester 2: February - June
  if (month >= 8 || month <= 0) {
    return 1;
  } else {
    return 2;
  }
};
