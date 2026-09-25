import { downloadCalendar } from '../../features/calendar/ics';
import type { FestivalDay } from '../../types/festival';
import { FavoriteButton } from './FavoriteButton';
import { Icon } from './Icon';

export function DayLineup({ day }: { day: FestivalDay }) {
  return (
    <div className="lineup-card">
      <div className="card-heading">
        <span>LA NOCHE DEL {String(day.day).padStart(2, '0')} / OCTUBRE</span>
        <span>PARQUE RODÓ</span>
        <Icon name="sun" />
      </div>
      <ol className="act-list">
        {day.acts.map((performance) => (
          <li className="act-row" key={performance.id}>
            <time
              className="act-time"
              dateTime={`${performance.civilDate}T${performance.time}:00-03:00`}
            >
              {performance.time}
            </time>
            <div className="act-name">
              {performance.category && (
                <small className="act-category">{performance.category}</small>
              )}
              {performance.name}
            </div>
            <FavoriteButton performance={performance} day={day.day} />
          </li>
        ))}
      </ol>
      {day.note && <p className="card-note">{day.note}</p>}
      <div className="card-bottom">
        <span>ENTRADA GRATUITA · MINAS</span>
        <button
          className="text-button"
          type="button"
          aria-label={`Descargar al calendario las actuaciones del ${day.day} de octubre`}
          onClick={() => downloadCalendar(day.acts, `dia-${String(day.day).padStart(2, '0')}`)}
        >
          Guardá esta noche <Icon name="calendar" />
        </button>
      </div>
    </div>
  );
}
