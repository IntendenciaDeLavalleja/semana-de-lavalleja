import { useStore } from '@nanostores/react';

import { festival } from '../../data/festival';
import { $activeDay } from '../../features/agenda/store';

function goToDay(index: number) {
  const day = festival.days[index];
  if (!day) return;
  const target = document.getElementById(`dia-${String(day.day).padStart(2, '0')}`);
  if (!target) return;
  window.dispatchEvent(new CustomEvent('festival:go-day', { detail: index }));
}

export function DateNavigation() {
  const activeDay = useStore($activeDay);
  return (
    <nav className="date-nav" aria-label="Elegir día de la programación">
      {festival.days.map((day, index) => (
        <button
          className="date-button"
          type="button"
          key={day.date}
          aria-pressed={activeDay === index}
          aria-label={`Ver ${day.weekday.toLowerCase()} ${day.day} de octubre`}
          onClick={() => goToDay(index)}
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? festival.days.length - 1
                  : Math.max(
                      0,
                      Math.min(
                        festival.days.length - 1,
                        index + (event.key === 'ArrowRight' ? 1 : -1),
                      ),
                    );
            const buttons = event.currentTarget.parentElement?.querySelectorAll('button');
            buttons?.[next]?.focus();
            goToDay(next);
          }}
        >
          <span>{day.short}</span>
          <b>{String(day.day).padStart(2, '0')}</b>
        </button>
      ))}
    </nav>
  );
}
