import { Colors, Spacing, Radius, Typography } from '../theme';

describe('Theme constants', () => {
  it('has required color modes', () => {
    expect(Colors.light).toBeDefined();
    expect(Colors.dark).toBeDefined();
  });

  it('has spacing defined', () => {
    expect(Spacing.three).toBe(16);
  });

  it('has radius defined', () => {
    expect(Radius.medium).toBe(8);
  });

  it('has typography defined', () => {
    expect(Typography.h1).toBeDefined();
  });
});
