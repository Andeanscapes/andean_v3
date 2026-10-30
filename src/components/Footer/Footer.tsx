'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Mail, MessageCircle } from 'lucide-react';
import { SOCIAL_LINKS, CONTACT_INFO, SITE_INFO, FOOTER_PHONE } from '@/constant/SiteConfig';
import { whatsappUrl } from '@/utils/whatsapp';

interface FooterProps {
    /** Locale-free path of the landing flagship, from the feed. */
    flagshipExperiencePath: string;
}

const linkClassName =
    'inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-base-content/75 md:min-h-0 md:py-1 underline-offset-4 transition-colors duration-200 hover:text-base-content hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const Footer = ({ flagshipExperiencePath }: FooterProps) => {
    const t = useTranslations('Footer');

    const territoryLinks = [
        { label: t('logistics'), href: `${flagshipExperiencePath}#inclusions` },
        { label: t('transportation'), href: `${flagshipExperiencePath}#booking` },
        { label: t('staySelection'), href: `${flagshipExperiencePath}#accommodation` },
    ];

    const allyLinks = [
        { label: t('allyHacienda'), href: `${flagshipExperiencePath}#accommodation`, isPartner: true },
        { label: t('allyExperiences'), href: '/experiences', isPartner: false },
    ];

    return (
        <footer id="support-module" className="border-t border-base-200 bg-base-100">
            <div className="container py-12 md:py-16">
                <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <img src={SITE_INFO.logo} alt={SITE_INFO.name} className="h-14 w-auto object-contain md:h-16" />
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed text-base-content/70">
                            {t('valueProposition')}
                        </p>
                        <div className="flex flex-col items-start gap-1">
                            <a href={whatsappUrl(t('whatsappMessage'))} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                {t('startWhatsapp')}
                            </a>
                            <a href={`mailto:${CONTACT_INFO.email}`} className={linkClassName}>
                                <Mail className="h-4 w-4" aria-hidden="true" />
                                {t('sendEmail')}
                            </a>
                        </div>
                    </div>

                    <nav aria-labelledby="footer-territory-heading">
                        <h3 id="footer-territory-heading" className="text-sm font-semibold text-base-content">{t('territoryEssentials')}</h3>
                        <ul className="mt-4 space-y-1">
                            {territoryLinks.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className={linkClassName}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-labelledby="footer-allies-heading">
                        <h3 id="footer-allies-heading" className="text-sm font-semibold text-base-content">{t('allyNetwork')}</h3>
                        <ul className="mt-4 space-y-1">
                            {allyLinks.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className={linkClassName}>
                                        {link.label}
                                        {link.isPartner ? (
                                            <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-base-content">
                                                {t('partner')}
                                            </span>
                                        ) : null}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-base-200 pt-6 text-sm text-base-content/60 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} {SITE_INFO.name}. {t('allRightsReserved')}
                    </p>

                    <div className="flex items-center gap-4">
                        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                            {t('instagram')}
                        </a>
                        <span aria-hidden="true" className="text-base-content/30">|</span>
                        <a href={`tel:+${FOOTER_PHONE.phone}`} className={linkClassName}>
                            {FOOTER_PHONE.phoneDisplay}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
