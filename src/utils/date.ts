import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date: Date | string, formatStr = 'PPP') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid Date';
  return format(d, formatStr);
};

export const toISO = (date: Date) => date.toISOString();
