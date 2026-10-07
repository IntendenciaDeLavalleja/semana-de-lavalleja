type NavigationItem = {
  href: string;
  label: string;
  number: string;
  desktop?: boolean;
  external?: boolean;
};

export const navigation: readonly NavigationItem[] = [
  { href: '/#programacion', label: 'Programación', number: '01' },
  { href: '/fiestas-del-interior/', label: 'Fiestas del interior', number: '02' },
  { href: '/#fogones', label: 'Los Fogones', number: '03' },
  { href: '/#visita', label: 'Planeá tu visita', number: '04', desktop: false },
  { href: 'https://medios.lavalleja.uy/', label: 'Sala de medios', number: '05', external: true },
];
