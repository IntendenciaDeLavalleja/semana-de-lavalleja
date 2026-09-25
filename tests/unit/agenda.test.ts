import { beforeEach, describe, expect, it } from 'vitest';

import { festival } from '../../src/data/festival';
import {
  AGENDA_KEY,
  LEGACY_AGENDA_KEY,
  MIGRATION_KEY,
  migrateLegacyAgenda,
  sanitizeAgenda,
} from '../../src/features/agenda/migrations';
import { createStorageProxy, persistentStorage } from '../../src/features/agenda/storage';

const firstId = festival.days[0].acts[0].id;

describe('agenda persistence', () => {
  beforeEach(() => {
    delete persistentStorage[AGENDA_KEY];
    delete persistentStorage[LEGACY_AGENDA_KEY];
    delete persistentStorage[MIGRATION_KEY];
  });

  it('validates, deduplicates and removes retired IDs', () => {
    expect(sanitizeAgenda({ version: 2, ids: [firstId, firstId, 'removed'] })).toEqual({
      version: 2,
      ids: [firstId],
    });
    expect(sanitizeAgenda({ version: 1, ids: [firstId] })).toEqual({ version: 2, ids: [] });
  });

  it('migrates the legacy key once and never resurrects it after an empty new agenda', () => {
    persistentStorage[LEGACY_AGENDA_KEY] = JSON.stringify([firstId, firstId, 'removed']);
    expect(migrateLegacyAgenda().ids).toEqual([firstId]);
    persistentStorage[AGENDA_KEY] = JSON.stringify({ version: 2, ids: [] });
    expect(migrateLegacyAgenda().ids).toEqual([]);
  });

  it('does not remove unrelated storage keys', () => {
    persistentStorage['unrelated-key'] = 'keep';
    persistentStorage[LEGACY_AGENDA_KEY] = 'not-json';
    migrateLegacyAgenda();
    expect(persistentStorage['unrelated-key']).toBe('keep');
  });

  it('falls back to memory when storage reads and writes throw', () => {
    const blocked = {
      get length(): number {
        throw new Error('blocked');
      },
      clear() {
        throw new Error('blocked');
      },
      getItem() {
        throw new Error('blocked');
      },
      key() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    } as Storage;
    const fallback = createStorageProxy(blocked);
    expect(() => {
      fallback.example = 'value';
    }).not.toThrow();
    expect(fallback.example).toBe('value');
  });
});
