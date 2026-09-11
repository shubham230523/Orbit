import { formatDate } from '../date';

describe('date utils', () => {
  it('formats a date correctly', () => {
    const date = new Date('2026-09-11T12:00:00Z');
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2026-09-11');
  });

  it('returns Invalid Date for invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
  });
});
