'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { useReservationContact } from '@/hooks/experiences/useReservationContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { validateContactField } from '@/utils/validationSchemas';

export function ContactFields() {
  const t = useTranslations('experiences.ui');
  const { contact, setContactField } = useReservationContact();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const cardClass = isDark
    ? 'mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  return (
    <Card className={cardClass}>
      <h2 className="text-xl font-semibold mb-4">
        {t('contactDataTitle')}
      </h2>

      <div className="space-y-4">
        <Input
          label={t('fullName')}
          value={contact.name}
          onChange={(e) => setContactField('name', e.target.value)}
          placeholder={t('fullNamePlaceholder')}
          required
          errorMessage={
            (contact.name && validateContactField('name', contact.name)) ||
            undefined
          }
        />

        <Input
          label={t('phone')}
          type="tel"
          value={contact.phone}
          onChange={(e) => setContactField('phone', e.target.value)}
          placeholder={t('phonePlaceholder')}
          required
          errorMessage={
            (contact.phone &&
              validateContactField('phone', contact.phone)) ||
            undefined
          }
        />

        <Input
          label={t('email')}
          type="email"
          value={contact.email}
          onChange={(e) => setContactField('email', e.target.value)}
          placeholder={t('emailPlaceholder')}
          helperText={t('emailHelper')}
          errorMessage={
            (contact.email &&
              validateContactField('email', contact.email)) ||
            undefined
          }
        />
      </div>
    </Card>
  );
}
