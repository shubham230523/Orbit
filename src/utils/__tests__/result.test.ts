import { success, failure } from '../result';

describe('result utils', () => {
  it('creates success result', () => {
    const res = success('data');
    expect(res).toEqual({ success: true, data: 'data' });
  });

  it('creates failure result', () => {
    const res = failure('error');
    expect(res).toEqual({ success: false, error: 'error' });
  });
});
