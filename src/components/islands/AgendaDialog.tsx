import { useStore } from '@nanostores/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { festival } from '../../data/festival';
import { $storageStatus } from '../../features/agenda/storage';
import { clearAgenda } from '../../features/agenda/store';
import { allPerformances, selectPerformances } from '../../features/agenda/selectors';
import { downloadCalendar } from '../../features/calendar/ics';
import type { Performance } from '../../types/festival';
import { FavoriteButton } from './FavoriteButton';
import { Icon } from './Icon';
import { useHydratedAgenda } from './useHydratedAgenda';

type Filter = 'all' | 'favorites';

export function AgendaDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const ids = useHydratedAgenda();
  const storageStatus = useStore($storageStatus);

  const selected = useMemo(() => selectPerformances(ids), [ids]);
  const visibleIds = useMemo(
    () => new Set(selected.map((performance) => performance.id)),
    [selected],
  );
  const exportable = filter === 'favorites' ? selected : allPerformances;

  function close() {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    document.body.classList.remove('dialog-open');
    setConfirmClear(false);
    returnFocusRef.current?.focus();
  }

  useEffect(() => {
    const open = (event: Event) => {
      const requested = (event as CustomEvent<Filter>).detail;
      setFilter(requested === 'favorites' ? 'favorites' : 'all');
      returnFocusRef.current = document.activeElement as HTMLElement;
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();
      document.body.classList.add('dialog-open');
      requestAnimationFrame(() => closeRef.current?.focus());
    };
    window.addEventListener('festival:open-agenda', open);
    return () => window.removeEventListener('festival:open-agenda', open);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="lineup-dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="dialog-top">
        <div>
          <span className="eyebrow">PARQUE RODÓ · 7 AL 11 DE OCTUBRE</span>
          <h2 id="dialog-title">La grilla es tuya.</h2>
        </div>
        <button
          ref={closeRef}
          className="icon-button close-dialog"
          type="button"
          aria-label="Cerrar grilla"
          onClick={close}
        >
          <Icon name="close" />
        </button>
      </div>
      {storageStatus !== 'available' && (
        <p className="storage-warning" role="status">
          La selección funciona durante esta visita, pero este navegador no permitió guardarla de
          forma persistente.
        </p>
      )}
      <div className="dialog-controls">
        <div className="dialog-tabs" role="group" aria-label="Filtrar programación">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            Toda la grilla
          </button>
          <button
            type="button"
            aria-pressed={filter === 'favorites'}
            onClick={() => setFilter('favorites')}
          >
            Mis elegidos <span className="favorites-count">{ids.length}</span>
          </button>
        </div>
        <button
          className="calendar-export text-button"
          type="button"
          disabled={exportable.length === 0}
          onClick={() =>
            downloadCalendar(exportable, filter === 'favorites' ? 'mis-elegidos' : 'programacion')
          }
        >
          <Icon name="calendar" /> <span>Descargar calendario</span>
        </button>
      </div>
      <div className="dialog-body">
        {filter === 'favorites' && selected.length === 0 ? (
          <div className="empty-lineup">
            <Icon name="star" />
            <h3>Tu grilla empieza acá.</h3>
            <p>
              Elegí artistas con la estrella. Tu grilla se guarda en este navegador y dispositivo.
              No requiere una cuenta.
            </p>
            <button type="button" onClick={() => setFilter('all')}>
              Ver toda la programación
            </button>
          </div>
        ) : (
          festival.days.map((day) => {
            const performances =
              filter === 'all' ? day.acts : day.acts.filter((act) => visibleIds.has(act.id));
            if (performances.length === 0) return null;
            return (
              <section className="dialog-day" key={day.date}>
                <h3>
                  {day.weekday} {String(day.day).padStart(2, '0')}{' '}
                  <span>OCTUBRE {festival.year}</span>
                </h3>
                {performances.map((performance: Performance) => (
                  <div className="dialog-act" key={performance.id}>
                    <time dateTime={`${performance.civilDate}T${performance.time}:00-03:00`}>
                      {performance.time}
                    </time>
                    <div className="dialog-act-name">
                      {performance.name}
                      {performance.category && <small>{performance.category}</small>}
                    </div>
                    <FavoriteButton performance={performance} day={day.day} />
                  </div>
                ))}
                {day.note && filter === 'all' && <p className="dialog-note">{day.note}</p>}
              </section>
            );
          })
        )}
      </div>
      <div className="dialog-foot">
        <p>
          Tu grilla se guarda en este navegador y dispositivo. No requiere una cuenta. Las
          actuaciones de madrugada se mantienen en su noche de programación.
        </p>
        {ids.length > 0 && !confirmClear && (
          <button
            className="text-button clear-agenda"
            type="button"
            onClick={() => setConfirmClear(true)}
          >
            Vaciar mi grilla
          </button>
        )}
        {confirmClear && (
          <div role="group" aria-label="Confirmar vaciado de la grilla">
            <span>¿Vaciar la grilla? </span>
            <button
              className="text-button clear-agenda"
              type="button"
              onClick={() => {
                clearAgenda();
                setConfirmClear(false);
              }}
            >
              Sí, vaciar
            </button>
            <button className="text-button" type="button" onClick={() => setConfirmClear(false)}>
              Cancelar
            </button>
          </div>
        )}
        <button className="text-button print-button" type="button" onClick={() => window.print()}>
          Imprimir grilla ↗
        </button>
      </div>
    </dialog>
  );
}
