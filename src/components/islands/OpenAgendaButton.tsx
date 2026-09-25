import { openAgenda } from './AgendaTrigger';
import { Icon } from './Icon';

export function OpenAgendaButton({ children = 'Ver toda la grilla' }: { children?: string }) {
  return (
    <button className="text-button" type="button" onClick={() => openAgenda('all')}>
      {children} <Icon name="arrow" />
    </button>
  );
}
