export type ThemeName = 'sunset' | 'magenta' | 'rock' | 'lilac' | 'gold';

export interface Performance {
  id: string;
  editorialDate: string;
  civilDate: string;
  time: string;
  name: string;
  category?: string;
}

export interface FestivalDay {
  day: number;
  date: string;
  weekday: string;
  short: string;
  theme: ThemeName;
  line: string;
  feature: readonly string[];
  note: string;
  acts: readonly Performance[];
}

export interface FogonesDay {
  day: number;
  date: string;
  weekday: string;
  short: string;
  acts: readonly Performance[];
}

export interface FogonesProgram {
  place: string;
  days: readonly FogonesDay[];
}

export interface ParadeEvent {
  date: string;
  time: string;
  place: string;
  city: string;
}

export interface InteriorAct {
  id: string;
  editorialDate: string;
  civilDate: string;
  name: string;
  category?: string;
}

export interface InteriorCulturalDay {
  id: string;
  place: string;
  date: string;
  endDate?: string;
  acts: readonly InteriorAct[];
}

export interface InteriorSportSession {
  id: string;
  editorialDate: string;
  civilDate: string;
  time?: string;
  name: string;
}

export interface InteriorSportEvent {
  id: string;
  name: string;
  place: string;
  venue?: string;
  date: string;
  endDate?: string;
  sessions?: readonly InteriorSportSession[];
  details?: readonly string[];
}

export interface InteriorCinemaScreening {
  id: string;
  editorialDate: string;
  civilDate: string;
  time: string;
  place: string;
  venue?: string;
}

export interface InteriorProgram {
  culturalDays: readonly InteriorCulturalDay[];
  sports: readonly InteriorSportEvent[];
  cinema: readonly InteriorCinemaScreening[];
}

export interface Festival {
  edition: number;
  year: number;
  month: number;
  start: number;
  end: number;
  place: string;
  timezone: 'America/Montevideo';
  instagram: string;
  facebook: string;
  days: readonly FestivalDay[];
  fogones: FogonesProgram;
  parade: ParadeEvent;
  interior: InteriorProgram;
}
