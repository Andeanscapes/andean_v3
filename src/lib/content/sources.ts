import type { Locale } from '@/i18n/locales';

/**
 * Bibliographic sources shared by the guides and Emerald World. Only
 * non-commercial evidence: never tour operators, review platforms, jewelers,
 * auction houses or emerald sellers (`editorialSources.test.ts` enforces it).
 */

export type SourceLanguage = Locale;

export interface EditorialSource {
  /** Stable kebab-case id; copy cites it inline as `[[id]]`. */
  id: string;
  /** Bibliographic reference; a proper name, not translated. */
  label: string;
  url?: string;
  /** Language of the source itself, so readers know when it is in Spanish or English. */
  language: SourceLanguage;
}

export const GIA_RAINIER_2016: EditorialSource = {
  id: 'gia-rainier-2016',
  language: 'en',
  label:
    'Weldon, R., Ortiz, J. G. & Ottaway, T. (2016). In Rainier’s Footsteps: Journey to the Chivor Emerald Mine. Gems & Gemology, 52(2). GIA.',
  url: 'https://www.gia.edu/gems-gemology/summer-2016-rainier-footsteps-journey-chivor-emerald-mine',
};

export const GIA_CHIVOR_HISTORY_2020: EditorialSource = {
  id: 'gia-chivor-history-2020',
  language: 'en',
  label:
    'Schmetzer, K. & Martayan, G. (2020). History of the Chivor Emerald Mine, Part I (1880–1925). Gems & Gemology, 56(1). GIA.',
};

export const RAINIER_GREEN_FIRE: EditorialSource = {
  id: 'rainier-green-fire-1942',
  language: 'en',
  label: 'Rainier, P. W. (1942). Green Fire. New York: Random House.',
};

export const FCDO_COLOMBIA: EditorialSource = {
  id: 'fcdo-colombia',
  language: 'en',
  label: 'UK Foreign, Commonwealth & Development Office. Colombia travel advice (updated 30 October 2026).',
  url: 'https://www.gov.uk/foreign-travel-advice/colombia',
};

export const CHIVOR_PLANT: EditorialSource = {
  id: 'wiki-es-chivor-plant',
  language: 'es',
  label: 'Central hidroeléctrica de Chivor. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Central_hidroel%C3%A9ctrica_de_Chivor',
};

export const GUAVIO_PLANT: EditorialSource = {
  id: 'wiki-es-guavio-plant',
  language: 'es',
  label: 'Central hidroeléctrica del Guavio. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Central_hidroel%C3%A9ctrica_del_Guavio',
};

export const GREEN_WARS: EditorialSource = {
  id: 'wiki-es-guerras-verdes',
  language: 'es',
  label: 'Guerras verdes. Wikipedia en español (citing El Tiempo, Semana, El Espectador and Verdad Abierta).',
  url: 'https://es.wikipedia.org/wiki/Guerras_verdes',
};

export const FURA_TENA_HILLS: EditorialSource = {
  id: 'wiki-es-fura-tena',
  language: 'es',
  label: 'Fura y Tena. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Fura_y_Tena',
};

export const MUZO_MUNICIPALITY: EditorialSource = {
  id: 'wiki-es-muzo',
  language: 'es',
  label: 'Muzo (Boyacá). Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Muzo',
};

export const TRAPICHE_GIA_2015: EditorialSource = {
  id: 'gia-trapiche-2015',
  language: 'en',
  label:
    'Pignatelli, I., Giuliani, G., Ohnenstetter, D. et al. (2015). Colombian Trapiche Emeralds: Recent Advances in Understanding Their Formation. Gems & Gemology, 51(3), 222–259.',
  url: 'https://doi.org/10.5741/GEMS.51.3.222',
};

export const GACHALA_EMERALD: EditorialSource = {
  id: 'wiki-en-gachala-emerald',
  language: 'en',
  label: 'Gachalá Emerald. Wikipedia (citing the Smithsonian National Museum of Natural History).',
  url: 'https://en.wikipedia.org/wiki/Gachal%C3%A1_Emerald',
};

export const SMITHSONIAN_GACHALA: EditorialSource = {
  id: 'smithsonian-gachala',
  language: 'en',
  label: 'Smithsonian National Museum of Natural History. Gachala Emerald (NMNH 122078). GeoGallery.',
  url: 'https://naturalhistory.si.edu/explore/collections/geogallery/10002797',
};

export const AFI_GREEN_FIRE_1954: EditorialSource = {
  id: 'afi-green-fire-1954',
  language: 'en',
  label:
    'AFI Catalog of Feature Films. Green Fire, Metro-Goldwyn-Mayer (New York opening 24 December 1954), based on Peter W. Rainier’s 1942 book.',
  url: 'https://catalog.afi.com/Catalog/moviedetails/51218',
};

export const GIA_ORIGIN_2019: EditorialSource = {
  id: 'gia-origin-2019',
  language: 'en',
  label:
    'Saeseaw, S., Renfro, N. D., Palke, A. C., Sun, Z. et al. (2019). Geographic Origin Determination of Emerald. Gems & Gemology, 55(4). GIA.',
  url: 'https://www.gia.edu/gems-gemology/winter-2019-emerald-geographic-origin-determination',
};

export const WIKI_EN_COLOMBIAN_EMERALDS: EditorialSource = {
  id: 'wiki-en-colombian-emeralds',
  language: 'en',
  label: 'Colombian emeralds. Wikipedia (English).',
  url: 'https://en.wikipedia.org/wiki/Colombian_emeralds',
};

export const WIKI_ES_BORBUR: EditorialSource = {
  id: 'wiki-es-borbur',
  language: 'es',
  label: 'San Pablo de Borbur. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/San_Pablo_de_Borbur',
};

export const WIKI_ES_MARIPI: EditorialSource = {
  id: 'wiki-es-maripi',
  language: 'es',
  label: 'Maripí. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Marip%C3%AD',
};

export const WIKI_ES_TERRITORIO_VASQUEZ: EditorialSource = {
  id: 'wiki-es-territorio-vasquez',
  language: 'es',
  label: 'Territorio Vásquez. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Territorio_V%C3%A1squez',
};

export const WIKI_ES_CHIVOR: EditorialSource = {
  id: 'wiki-es-chivor',
  language: 'es',
  label: 'Chivor. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Chivor',
};

export const WIKI_ES_GACHALA: EditorialSource = {
  id: 'wiki-es-gachala',
  language: 'es',
  label: 'Gachalá. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Gachal%C3%A1',
};

export const WIKI_ES_ESMERALDA_FURA: EditorialSource = {
  id: 'wiki-es-esmeralda-fura',
  language: 'es',
  label: 'Esmeralda Fura. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Esmeralda_Fura',
};

export const WIKI_ES_ESMERALDA_TENA: EditorialSource = {
  id: 'wiki-es-esmeralda-tena',
  language: 'es',
  label: 'Esmeralda Tena. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Esmeralda_Tena',
};

export const SEMANA_MOLANO_2017: EditorialSource = {
  id: 'semana-molano-2017',
  language: 'es',
  label: 'Molano Bravo, A. (5 September 2017). Esmeraldas y violencia, dos caminos cruzados. Semana.',
  url: 'https://www.semana.com/contenidos-editoriales/esmeraldas-historias-por-contar-/articulo/historia-de-las-primeras-guerras-verdes-segun-alfredo-molano/538733',
};

export const SEMANA_REINSERCION_1992: EditorialSource = {
  id: 'semana-reinsercion-1992',
  language: 'es',
  label: 'Semana (10 May 1992). La reinserción de los esmeralderos.',
  url: 'https://www.semana.com/nacion/articulo/la-reinsercion-de-los-esmeralderos/17376-3',
};

export const VERDAD_ABIERTA_MUJERES_2016: EditorialSource = {
  id: 'verdad-abierta-mujeres-2016',
  language: 'es',
  label: 'Navarrete, T. (2016). Mujeres, las víctimas silenciosas de la esmeralda en Boyacá. Verdad Abierta.',
  url: 'https://www.verdadabierta.com/especiales-v/2016/mujeres-guerra/boyaca-mujeres-esmeraldas.html',
};

export const EL_TIEMPO_EMILIA_1996: EditorialSource = {
  id: 'el-tiempo-emilia-1996',
  language: 'es',
  label: 'Martínez, G. (23 November 1996). Una maldición con nombre de mujer. El Tiempo.',
  url: 'https://www.eltiempo.com/archivo/documento/MAM-599471',
};

export const GIA_EMERALD_DESCRIPTION: EditorialSource = {
  id: 'gia-emerald-description',
  language: 'en',
  label: 'GIA Gem Encyclopedia. Emerald Description. Gemological Institute of America.',
  url: 'https://www.gia.edu/emerald-description',
};

export const GIA_EMERALD_QUALITY: EditorialSource = {
  id: 'gia-emerald-quality',
  language: 'en',
  label: 'GIA Gem Encyclopedia. Emerald Quality Factors. Gemological Institute of America.',
  url: 'https://www.gia.edu/emerald-quality-factor',
};

export const GIA_EMERALD_FACTS: EditorialSource = {
  id: 'gia-emerald-facts',
  language: 'en',
  label: 'GIA Gem Encyclopedia. Emerald (overview and facts). Gemological Institute of America.',
  url: 'https://www.gia.edu/emerald',
};

export const GIA_GEM_TREATMENT: EditorialSource = {
  id: 'gia-gem-treatment',
  language: 'en',
  label: 'Weldon, R. An Introduction to Gem Treatments. GIA Gem Encyclopedia.',
  url: 'https://www.gia.edu/gem-treatment',
};
