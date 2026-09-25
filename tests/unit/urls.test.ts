import { describe, expect, it } from 'vitest';
import { absoluteUrl, getBuildSite } from '../../src/lib/urls';

describe('build URL validation', () => {
  it('works locally with indexing disabled', () => {
    expect(getBuildSite({} as NodeJS.ProcessEnv)).toEqual({
      url: 'http://localhost:4321/',
      indexable: false,
    });
  });

  it('requires a real HTTPS URL for an indexable build', () => {
    expect(() => getBuildSite({ SITE_INDEXABLE: 'true' } as NodeJS.ProcessEnv)).toThrow();
    expect(() =>
      getBuildSite({ SITE_INDEXABLE: 'true', SITE_URL: 'http://example.com' } as NodeJS.ProcessEnv),
    ).toThrow();
    expect(() =>
      getBuildSite({
        SITE_INDEXABLE: 'true',
        SITE_URL: 'https://fiesta.example/',
      } as NodeJS.ProcessEnv),
    ).toThrow();
    expect(
      getBuildSite({
        SITE_INDEXABLE: 'true',
        SITE_URL: 'https://www.gub.uy/',
      } as NodeJS.ProcessEnv).indexable,
    ).toBe(true);
  });

  it('creates consistent absolute URLs', () => {
    expect(absoluteUrl('/programacion/', 'https://example.com/base/')).toBe(
      'https://example.com/base/programacion/',
    );
  });
});
