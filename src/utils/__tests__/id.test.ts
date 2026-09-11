import { generateId } from '../id';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

describe('Id utils', () => {
  it('generates a valid uuid string', () => {
    const id = generateId();
    expect(id).toBe('mock-uuid');
  });
});
