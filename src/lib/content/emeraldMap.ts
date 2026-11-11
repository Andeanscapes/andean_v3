/**
 * Points for the emerald-belt map. Belt membership follows Pignatelli et al.
 * (2015, Gems & Gemology 51(3)): western districts Muzo, Coscuez, La Pita,
 * Peñas Blancas and La Glorieta–Yacopí; eastern districts Chivor, Gachalá and
 * Macanal. Mining districts are plotted at their municipal seat, with the
 * coordinates published on each municipality's Spanish Wikipedia article
 * (checked 2026-11-10). Place names are proper names and are not translated.
 */
export type EmeraldBelt = 'western' | 'eastern';

export interface EmeraldMapPoint {
  id: string;
  /** Municipal seat shown on the map. */
  name: string;
  /** Mining districts in this municipality named by the source. */
  districts: readonly string[];
  belt: EmeraldBelt | 'reference';
  lat: number;
  lon: number;
}

export const EMERALD_MAP_POINTS: readonly EmeraldMapPoint[] = [
  { id: 'muzo', name: 'Muzo', districts: ['Muzo'], belt: 'western', lat: 5.5297, lon: -74.1044 },
  {
    id: 'borbur',
    name: 'San Pablo de Borbur',
    districts: ['Coscuez', 'Peñas Blancas'],
    belt: 'western',
    lat: 5.6514,
    lon: -74.0694,
  },
  { id: 'maripi', name: 'Maripí', districts: ['La Pita'], belt: 'western', lat: 5.5489, lon: -74.0067 },
  { id: 'yacopi', name: 'Yacopí', districts: ['La Glorieta'], belt: 'western', lat: 5.4597, lon: -74.3383 },
  { id: 'chivor', name: 'Chivor', districts: ['Chivor'], belt: 'eastern', lat: 4.8878, lon: -73.3683 },
  { id: 'macanal', name: 'Macanal', districts: ['Macanal'], belt: 'eastern', lat: 4.9719, lon: -73.3194 },
  { id: 'gachala', name: 'Gachalá', districts: ['Gachalá'], belt: 'eastern', lat: 4.6931, lon: -73.52 },
  { id: 'bogota', name: 'Bogotá', districts: [], belt: 'reference', lat: 4.6097, lon: -74.0818 },
];
