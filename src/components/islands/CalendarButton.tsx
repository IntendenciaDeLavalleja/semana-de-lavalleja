import { downloadCalendar } from '../../features/calendar/ics';
import type { Performance } from '../../types/festival';
import { Icon } from './Icon';

export function CalendarButton({
  day,
  performances,
}: {
  day: number;
  performances: readonly Performance[];
}) {
  return (
    <button
      className="text-button"
      type="button"
      aria-label={`Descargar al calendario las actuaciones del ${day} de octubre`}
      onClick={() => downloadCalendar(performances, `dia-${String(day).padStart(2, '0')}`)}
    >
      Guardá esta noche <Icon name="calendar" />
    </button>
  );
}
