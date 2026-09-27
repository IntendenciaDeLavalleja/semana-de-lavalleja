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
}
