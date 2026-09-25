import { persistentAtom } from '@nanostores/persistent';
import { atom } from 'nanostores';

import { AGENDA_KEY, emptyAgenda, migrateLegacyAgenda, sanitizeAgenda } from './migrations';
import './storage';

const initial = migrateLegacyAgenda();

export const $agenda = persistentAtom(AGENDA_KEY, initial, {
  decode(value) {
    try {
      return sanitizeAgenda(JSON.parse(value));
    } catch {
      return emptyAgenda();
    }
  },
  encode(value) {
    return JSON.stringify(sanitizeAgenda(value));
  },
});

export const $activeDay = atom(0);

export function toggleFavorite(id: string): void {
  const current = $agenda.get();
  const ids = current.ids.includes(id)
    ? current.ids.filter((candidate) => candidate !== id)
    : [...current.ids, id];
  $agenda.set({ version: 2, ids });
}

export function clearAgenda(): void {
  $agenda.set(emptyAgenda());
}
