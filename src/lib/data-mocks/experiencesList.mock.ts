import type { ExperienceHeroBadgeIcon } from '@/lib/schemas';

interface ExperiencesListCardConfig {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image: string;
  href: string;
  tagKey: string;
  trustKey: string;
  priceQualifierKey?: string;
  metadataKeys?: string[];
  price?: number;
  experienceId?: string;
}

interface ExperiencesListHeroConfig {
  titleKey: string;
  subtitleKey: string;
  summaryKey: string;
  highlightTextKey: string;
  ctaLabelKey: string;
  helperTextKey: string;
  ctaTargetId: string;
  badges: Array<{
    labelKey: string;
    icon: ExperienceHeroBadgeIcon;
  }>;
}

export interface ExperiencesListConfig {
  metaTitleKey: string;
  metaDescriptionKey: string;
  sectionTitleKey: string;
  sectionSubtitleKey: string;
  fromLabelKey: string;
  viewDetailsKey: string;
  hero: ExperiencesListHeroConfig;
  cards: ExperiencesListCardConfig[];
}

export const EXPERIENCES_LIST_CONFIG: ExperiencesListConfig = {
  metaTitleKey: 'ExperiencesList.metaTitle',
  metaDescriptionKey: 'ExperiencesList.metaDescription',
  sectionTitleKey: 'ExperiencesList.sectionTitle',
  sectionSubtitleKey: 'ExperiencesList.sectionSubtitle',
  fromLabelKey: 'ExperiencesList.fromLabel',
  viewDetailsKey: 'ExperiencesList.viewDetails',
  hero: {
    titleKey: 'ExperiencesList.hero.title',
    subtitleKey: 'ExperiencesList.hero.subtitle',
    summaryKey: 'ExperiencesList.hero.summary',
    highlightTextKey: 'ExperiencesList.hero.highlightText',
    ctaLabelKey: 'ExperiencesList.hero.ctaLabel',
    helperTextKey: 'ExperiencesList.hero.helperText',
    ctaTargetId: 'experiences-cards',
    badges: [
      { labelKey: 'ExperiencesList.hero.badges.nature', icon: 'limited' },
      { labelKey: 'ExperiencesList.hero.badges.culture', icon: 'none' },
      { labelKey: 'ExperiencesList.hero.badges.hosted', icon: 'deposit' },
    ],
  },
  cards: [
    {
      id: 'emerald-mining-adventure',
      titleKey: 'experiences.emeraldMining.title',
      descriptionKey: 'experiences.emeraldMining.description',
      image: '/assets/images/details/emerald-mining-card.webp',
      href: '/experiences/emerald-mining-adventure',
      tagKey: 'ExperiencesList.featuredTag',
      trustKey: 'ExperiencesList.transportIncluded',
      priceQualifierKey: 'ExperiencesList.priceQualifierPerPerson',
      metadataKeys: [
        'ExperiencesList.cardMeta.duration2d1n',
        'ExperiencesList.transportIncluded',
        'ExperiencesList.cardMeta.startsInChivor',
      ],
      experienceId: 'emeraldMining',
    },
  ],
};
