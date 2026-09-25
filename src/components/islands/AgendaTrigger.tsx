import { Icon } from './Icon';
import { useHydratedAgenda } from './useHydratedAgenda';

export function openAgenda(filter: 'all' | 'favorites' = 'all') {
  window.dispatchEvent(new CustomEvent('festival:open-agenda', { detail: filter }));
}

export function AgendaTrigger({ compact = false }: { compact?: boolean }) {
  const ids = useHydratedAgenda();
  return (
    <button
      className={compact ? 'text-button' : 'my-lineup'}
      type="button"
      aria-label="Abrir mis elegidos"
      onClick={() => openAgenda('favorites')}
    >
      <Icon name="star" />
      <span>{compact ? 'Abrí tu grilla personal' : 'Mi grilla'}</span>
      {compact ? <Icon name="arrow" /> : <b className="favorites-count">{ids.length}</b>}
    </button>
  );
}
