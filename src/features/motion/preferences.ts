import { persistentAtom } from '@nanostores/persistent';
import '../agenda/storage';

export type MotionPreference = 'system' | 'reduce' | 'full';

export const $motionPreference = persistentAtom<MotionPreference>(
  'semana-lavalleja:53:2026:motion:v2',
  'system',
  {
    decode: (value) =>
      ['system', 'reduce', 'full'].includes(value) ? (value as MotionPreference) : 'system',
    encode: (value) => value,
  },
);
