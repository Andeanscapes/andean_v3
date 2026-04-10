import { Link } from '@/i18n/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageCircle, ShieldCheck, Star, ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SOCIAL_LINKS, CONTACT_INFO, SITE_INFO } from '@/constant/SiteConfig';

const Footer = () => {
    const t = useTranslations('Footer');
    const [supportMode, setSupportMode] = useState<'whatsapp' | 'email'>('whatsapp');
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setShowBackToTop(window.scrollY > 420);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const trustGallery = useMemo(
        () => [
            '/assets/images/hero/h7.webp',
            '/assets/images/hero/h8.webp',
            '/assets/images/hero/h10.webp',
            '/assets/images/hero/h11.webp',
        ],
        []
    );

    const territoryLinks = [
        { label: t('logistics'), href: '/experiences/emerald-mining-adventure#inclusions' },
        { label: t('transportation'), href: '/experiences/emerald-mining-adventure#booking' },
        { label: t('staySelection'), href: '/experiences/emerald-mining-adventure#accommodation' },
    ];

    const allyLinks = [
        { label: t('allyHacienda'), href: '/experiences/emerald-mining-adventure#accommodation' },
        { label: t('allyGlamping'), href: '/experiences/emerald-mining-adventure#accommodation' },
        { label: t('allyExperiences'), href: '/experiences' },
    ];

    const legalLinks = [
        { label: t('certifications'), href: '/#certifications' },
        { label: t('insurance'), href: '/#insurance' },
        { label: t('terms'), href: '/#terms' },
        { label: t('privacy'), href: '/#privacy' },
    ];

    return (
        <footer id="support-module" className="relative mt-0 border-t border-white/10 bg-slate-950 backdrop-blur-xl">
            <div className="container py-10 md:py-12">
                <div className="rounded-3xl border border-white/10 bg-slate-900/45 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-7">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <Link href="/" className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                                <img src={SITE_INFO.logo} alt={SITE_INFO.name} className="h-14 w-[110px] object-contain md:h-16 md:w-[120px]" />
                            </Link>
                            <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-300 md:text-base">
                                {t('valueProposition')}
                            </p>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-100 shadow-[0_0_14px_rgba(0,255,157,0.14)]">
                            <span className="inline-flex h-2 w-2 rounded-full bg-[#00FF9D] shadow-[0_0_10px_rgba(0,255,157,0.65)]" aria-hidden="true" />
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {t('verifiedBySeal')}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-transparent px-4 py-2 text-sm font-bold text-slate-100">
                            <Star className="h-4 w-4 text-[#00FF9D]" />
                            {t('verifiedFiveStarReviews')}
                        </div>

                        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                            {trustGallery.map((src, index) => (
                                <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-xl border border-white/8 bg-slate-900/55">
                                    <img
                                        src={src}
                                        alt={t('ugcAlt', { index: index + 1 })}
                                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_2fr]">
                    <div className="rounded-3xl border border-emerald-500/22 bg-slate-900/40 p-5 shadow-[0_0_0_1px_rgba(0,255,157,0.1),0_0_18px_rgba(0,255,157,0.08)] backdrop-blur-xl">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">{t('supportTitle')}</p>
                        <p className="mt-2 text-sm text-slate-300">{t('supportSubtitle')}</p>

                        <div className="join mt-4 w-full">
                            <button
                                type="button"
                                onClick={() => setSupportMode('whatsapp')}
                                className={`join-item btn btn-sm flex-1 ${supportMode === 'whatsapp' ? 'border-emerald-400/50 bg-emerald-500/15 text-slate-100 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.28)]' : 'border-white/20 bg-transparent text-slate-300 hover:border-emerald-400/40 hover:bg-emerald-500/8'}`}
                                aria-pressed={supportMode === 'whatsapp'}
                            >
                                <MessageCircle className="h-4 w-4" />
                                {t('chatWithGuide')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSupportMode('email')}
                                className={`join-item btn btn-sm flex-1 ${supportMode === 'email' ? 'border-emerald-400/50 bg-emerald-500/15 text-slate-100 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.28)]' : 'border-white/20 bg-transparent text-slate-300 hover:border-emerald-400/40 hover:bg-emerald-500/8'}`}
                                aria-pressed={supportMode === 'email'}
                            >
                                <Mail className="h-4 w-4" />
                                {t('emailSupport')}
                            </button>
                        </div>

                        <div className="mt-4">
                            {supportMode === 'whatsapp' ? (
                                <a
                                    href={SOCIAL_LINKS.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn w-full border-0 bg-primary text-primary-content font-extrabold shadow-[0_0_20px_rgba(0,240,143,0.24)] transition-all duration-200 hover:bg-primary/90 hover:brightness-105 active:scale-[0.98] active:brightness-95"
                                >
                                    {t('startWhatsapp')}
                                </a>
                            ) : (
                                <a href={`mailto:${CONTACT_INFO.email}`} className="btn btn-outline w-full border-white/22 text-slate-100 hover:bg-white/8">
                                    {t('sendEmail')}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
                        <nav className="rounded-3xl border border-white/10 bg-slate-900/35 p-5 sm:rounded-r-none sm:border-r-0">
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-100">{t('territoryEssentials')}</h3>
                            <ul className="mt-3 space-y-2.5">
                                {territoryLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-slate-300 transition-colors hover:text-[#00FF9D]">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <nav className="rounded-3xl border border-white/10 bg-slate-900/35 p-5 sm:rounded-none sm:border-x-0">
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-100">{t('allyNetwork')}</h3>
                            <ul className="mt-3 space-y-2.5">
                                {allyLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-slate-300 transition-colors hover:text-[#00FF9D]">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <nav className="rounded-3xl border border-white/10 bg-slate-900/35 p-5 sm:rounded-l-none sm:border-l-0">
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-100">{t('legalSafety')}</h3>
                            <ul className="mt-3 space-y-2.5">
                                {legalLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-slate-300 transition-colors hover:text-[#00FF9D]">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {new Date().getFullYear()} {SITE_INFO.name}. {t('allRightsReserved')}
                    </p>

                    <div className="flex items-center gap-4">
                        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-slate-300 transition-colors hover:text-[#00FF9D]">
                            {t('instagram')}
                        </a>
                        <span className="text-slate-500">|</span>
                        <a href={`tel:${CONTACT_INFO.phone}`} className="inline-flex min-h-11 items-center text-slate-300 transition-colors hover:text-[#00FF9D]">
                            {CONTACT_INFO.phoneDisplay}
                        </a>
                    </div>
                </div>

                <div className="pointer-events-none mt-2 flex justify-end">
                    <button
                        type="button"
                        aria-label={t('backToTop')}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-slate-900/70 text-[#00FF9D] shadow-[0_0_18px_rgba(0,255,157,0.2)] transition-all duration-300 hover:scale-105 hover:bg-slate-900 ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                    >
                        <ArrowUp className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
