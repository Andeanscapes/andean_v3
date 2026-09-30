import PublicLayoutShell from './PublicLayoutShell';
import { getFlagshipExperiencePathSSR } from '@/lib/services/landing.service';

/**
 * Server boundary for the public chrome: resolves feed-owned data the footer
 * links to, then hands off to the client shell for scroll/theme state.
 *
 * Trade-off, accepted deliberately: every public page now depends on
 * `landing.json`, because the flagship is a landing-feed concept. The fetch is
 * shared with the landing page (same path + revalidate), so it costs no extra
 * request there, and an unavailable feed throws into the `[locale]` error
 * boundary like any other service failure.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    const flagshipExperiencePath = await getFlagshipExperiencePathSSR();

    return (
        <PublicLayoutShell flagshipExperiencePath={flagshipExperiencePath}>
            {children}
        </PublicLayoutShell>
    );
}
