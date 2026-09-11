import { formatDate, toISO } from '../date';

describe('date utils', () => {
  it('formats a date object correctly', () => {
    const date = new Date(2026, 8, 11); // September 11
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2026-09-11');
  });

  it('formats a date string correctly', () => {
    expect(formatDate('2026-09-11T12:00:00Z', 'yyyy-MM-dd')).toBe('2026-09-11');
  });

  it('returns Invalid Date for invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
  });

  it('converts to ISO string', () => {
    const date = new Date(Date.UTC(2026, 8, 11));
    expect(toISO(date)).toBe('2026-09-11T00:00:00.000Z');
  });
});
