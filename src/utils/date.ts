import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date: Date | string, formatStr = 'PPP') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid Date';
  return format(d, formatStr);
};

export const toISO = (date: Date) => date.toISOString();

export const formatTime12h = (timeStr: string) => {
  if (!timeStr) return '';
  // Handle 24:00 edge case from AI
  if (timeStr === '24:00') return '12:00 AM';

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const mStr = minutes.toString().padStart(2, '0');
    return `${h12}:${mStr} ${period}`;
  } catch (e) {
    return timeStr;
  }
};
