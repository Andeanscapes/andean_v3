'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Stepper } from '@/components/ui/Stepper/Stepper';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { usePeopleAndMode } from '@/hooks/experiences/useReservationContext';
import type { RoomMode } from '@/lib/experiences/types';

interface PeopleSelectorProps {
  maxPeople?: number;
  minPeople?: number;
}

export function PeopleSelector({
  maxPeople = 4,
  minPeople = 1,
}: PeopleSelectorProps) {
  const t = useTranslations('experiences.ui');
  const { peopleCount, roomMode, setPeopleCount, setRoomMode } =
    usePeopleAndMode();

  const isCouple = roomMode === 'couple';

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-6">{t('howManyPeople')}</h2>

      <div className="mb-6">
        <Stepper
          value={peopleCount}
          onChange={setPeopleCount}
          min={minPeople}
          max={maxPeople}
          disabled={isCouple}
          label={t('peopleLabel')}
        />
      </div>

      <div>
        <p className="text-sm text-base-content/80 mb-3">{t('roomType')}</p>
        <SegmentedControl
          options={[
            { label: t('private'), value: 'private' },
            { label: t('couple'), value: 'couple' },
          ]}
          value={roomMode}
          onChange={(mode) => setRoomMode(mode as RoomMode)}
          fullWidth
        />
      </div>

      {isCouple && (
        <p className="text-xs text-base-content/75 mt-3">
          {t('coupleNote')}
        </p>
      )}
    </Card>
  );
}
