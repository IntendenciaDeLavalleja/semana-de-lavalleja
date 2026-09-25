import { validPerformanceIds } from './selectors';
import { persistentStorage } from './storage';

export const AGENDA_KEY = 'semana-lavalleja:53:2026:agenda:v2';
export const MIGRATION_KEY = 'semana-lavalleja:53:2026:migration:v2';
export const LEGACY_AGENDA_KEY = 'lavalleja-53-elegidos-v1';

export interface AgendaState {
  version: 2;
  ids: string[];
}

export const emptyAgenda = (): AgendaState => ({ version: 2, ids: [] });

export function sanitizeAgenda(value: unknown): AgendaState {
  if (!value || typeof value !== 'object') return emptyAgenda();
  const candidate = value as { version?: unknown; ids?: unknown };
  if (candidate.version !== 2 || !Array.isArray(candidate.ids)) return emptyAgenda();
  const ids = [
    ...new Set(candidate.ids.filter((id): id is string => typeof id === 'string')),
  ].filter((id) => validPerformanceIds.has(id));
  return { version: 2, ids };
}

export function migrateLegacyAgenda(): AgendaState {
  if (AGENDA_KEY in persistentStorage) return emptyAgenda();
  if (MIGRATION_KEY in persistentStorage) return emptyAgenda();

  let ids: string[] = [];
  try {
    const value = JSON.parse(persistentStorage[LEGACY_AGENDA_KEY] || '[]');
    if (Array.isArray(value)) {
      ids = [...new Set(value.filter((id): id is string => typeof id === 'string'))].filter((id) =>
        validPerformanceIds.has(id),
      );
    }
  } catch {
    ids = [];
  }
  persistentStorage[MIGRATION_KEY] = 'done';
  return { version: 2, ids };
}
