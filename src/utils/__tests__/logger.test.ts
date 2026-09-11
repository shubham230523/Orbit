import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs info, warn and error', () => {
    logger.info('info message');
    expect(console.log).toHaveBeenCalledWith('[INFO]', 'info message');

    logger.warn('warn message');
    expect(console.warn).toHaveBeenCalledWith('[WARN]', 'warn message');

    logger.error('error message');
    expect(console.error).toHaveBeenCalledWith('[ERROR]', 'error message');
  });

  it('logs debug in dev mode', () => {
    // __DEV__ is true in jest by default
    logger.debug('debug message');
    expect(console.log).toHaveBeenCalledWith('[DEBUG]', 'debug message');
  });
});
