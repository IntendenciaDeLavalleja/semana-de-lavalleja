import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import { $agenda } from '../../features/agenda/store';

export function useHydratedAgenda(): string[] {
  const agenda = useStore($agenda);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? agenda.ids : [];
}
