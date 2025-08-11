import { describe, it, expect } from 'vitest';
import { shouldShowRGBanner } from '../src/lib/rg';

describe('shouldShowRGBanner', () => {
  it('returns true for bet-related routes', () => {
    ['/builder/123', '/match/abc', '/my-bets'].forEach((path) => {
      expect(shouldShowRGBanner(path)).toBe(true);
    });
  });

  it('returns false for non-bet routes', () => {
    ['/', '/admin', '/login', '/settings', '/legal/terms'].forEach((path) => {
      expect(shouldShowRGBanner(path)).toBe(false);
    });
  });
});
