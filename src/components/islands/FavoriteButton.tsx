import { toggleFavorite } from '../../features/agenda/store';
import type { Performance } from '../../types/festival';
import { Icon } from './Icon';
import { useHydratedAgenda } from './useHydratedAgenda';

export function FavoriteButton({ performance, day }: { performance: Performance; day: number }) {
  const ids = useHydratedAgenda();
  const selected = ids.includes(performance.id);
  return (
    <button
      className="favorite-button"
      type="button"
      aria-pressed={selected}
      aria-label={`${selected ? 'Quitar' : 'Agregar'} ${performance.name}, ${day} de octubre, ${selected ? 'de' : 'a'} mis elegidos`}
      title={selected ? 'Quitar de mis elegidos' : 'Guardar en mi grilla'}
      onClick={() => toggleFavorite(performance.id)}
    >
      <Icon name="star" />
    </button>
  );
}
