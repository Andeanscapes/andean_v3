'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { useReservationContact } from '@/hooks/experiences/useReservationContext';
import { validateContactField } from '@/utils/validationSchemas';

export function ContactFields() {
  const t = useTranslations('experiences.ui');
  const { contact, setContactField } = useReservationContact();

  return (
    <Card className="mb-6">
      <h2 className="mb-4 text-md font-semibold text-base-content sm:text-2md md:text-xl">
        {t('contactDataTitle')}
      </h2>

      <div className="space-y-4">
        <Input
          label={t('fullName')}
          value={contact.name}
          onChange={(e) => setContactField('name', e.target.value)}
          placeholder={t('fullNamePlaceholder')}
          required
          className="text-base md:text-sm"
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
          className="text-base md:text-sm"
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
          className="text-base md:text-sm"
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
