export type ExperienceCatalogItem = {
  experienceId: string;
  experienceName: string;
  metadataNamespace: string;
};

export const EXPERIENCES_CATALOG_MOCK: readonly ExperienceCatalogItem[] = [
  {
    experienceId: 'emeraldMining',
    experienceName: 'emerald-mining-adventure',
    metadataNamespace: 'EmeraldMiningAdventure',
  },
];