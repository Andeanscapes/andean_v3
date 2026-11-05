import { useTranslations } from 'next-intl';
import { BadgeCheck, Building2, CreditCard, Laptop, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO, REVIEW_PLATFORM_LINKS, type ReviewPlatformId } from '@/constant/SiteConfig';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';

/** Display order: the two booking platforms first, then Google reviews. */
const PLATFORM_ORDER: readonly ReviewPlatformId[] = ['airbnb', 'getyourguide', 'google'];

/**
 * "Who runs this tour": the legal operator, the technology provider and the
 * third-party platforms where the same experience is listed. Server-rendered,
 * so crawlers and AI engines read the business identity as plain text.
 */
export function OperatorTrust() {
  const t = useTranslations('Trust');
  const tPlatforms = useTranslations('Landing.reviews.platforms');
  const { legalName, taxId, legalAddress, technologyProvider } = BUSINESS_INFO;

  const platforms = PLATFORM_ORDER.flatMap((id) => {
    const href = REVIEW_PLATFORM_LINKS[id];
    return href ? [{ id, href, label: tPlatforms(id) }] : [];
  });

  const rows = [
    {
      icon: Building2,
      label: t('operatorLabel'),
      detail: t('operatorDetail', {
        legalName,
        taxId,
        address: `${legalAddress.streetAddress}, ${legalAddress.addressLocality}`,
      }),
    },
    {
      icon: Laptop,
      label: t('technologyLabel'),
      detail: t('technologyDetail', { name: technologyProvider.name }),
    },
    { icon: CreditCard, label: t('paymentLabel'), detail: t('paymentDetail') },
    { icon: ShieldCheck, label: t('includedLabel'), detail: t('includedDetail') },
  ];

  return (
    <SectionContainer
      labelledBy="operator-trust-title"
      sectionClassName="border-t border-base-content/10 bg-base-200/40 px-4 py-10 md:px-6 md:py-14 lg:px-10"
      containerClassName="max-w-5xl"
    >
      <h2 id="operator-trust-title" className="text-balance text-xl font-bold leading-tight md:text-3xl">
        {t('title')}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-base-content/75 md:text-base">{t('lead')}</p>

      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="flex gap-3 rounded-2xl border border-base-content/10 bg-base-100 p-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <dt className="text-sm font-semibold text-base-content">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-base-content/75">{detail}</dd>
            </div>
          </div>
        ))}
      </dl>

      {platforms.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-semibold">{t('platformsLabel')}</span>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {platforms.map((platform) => (
              <li key={platform.id}>
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {platform.label}
                  <span className="sr-only"> {t('opensInNewTab')}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionContainer>
  );
}
