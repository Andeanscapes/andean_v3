'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Stepper } from '@/components/ui/Stepper/Stepper';
import { Modal } from '@/components/ui/Modal/Modal';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { useReservationRoomModes, useReservationRooms } from '@/hooks/experiences/useReservationContext';
import type { RoomMode, RoomSelection } from '@/lib/schemas';
import { computePeopleCount } from '@/utils/helpers';

interface RoomTypeGroup {
  id: string;
  name: string;
  unitsAvailable: number;
  occupancyOptions: Array<{
    value: RoomMode;
    peopleCount: number;
    label: string;
  }>;
}

interface PeopleSelectorProps {
  maxPeople?: number;
  minPeople?: number;
}

export function PeopleSelector({
  maxPeople = 4,
}: PeopleSelectorProps) {
  const t = useTranslations('experiences.ui');
  const { peopleCount, roomSelections, setRoomSelections } =
    useReservationRooms();
  const roomModes = useReservationRoomModes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [occupancyByRoomType, setOccupancyByRoomType] = useState<Record<string, RoomMode>>({});

  const roomTypeGroups = useMemo<RoomTypeGroup[]>(() => {
    const groupMap = new Map<string, RoomTypeGroup>();
    
    roomModes.forEach((mode) => {
      const typeId = mode.room_type_id;
      if (!groupMap.has(typeId)) {
        const typeLabel = t(`roomMode.${typeId}`);
        groupMap.set(typeId, {
          id: typeId,
          name: typeLabel,
          unitsAvailable: mode.units_available,
          occupancyOptions: [],
        });
      }
      
      const group = groupMap.get(typeId)!;
      group.occupancyOptions.push({
        value: mode.value,
        peopleCount: mode.fixed_people ?? 1,
        label: `${mode.fixed_people ?? 1}`,
      });
    });
    
    return Array.from(groupMap.values());
  }, [roomModes, t]);

  const selectionsByMode = useMemo(() => {
    return roomSelections.reduce<Record<RoomMode, number>>((acc, selection) => {
      acc[selection.roomMode] = selection.quantity;
      return acc;
    }, {} as Record<RoomMode, number>);
  }, [roomSelections]);

  const updateSelection = (roomMode: RoomMode, quantity: number) => {
    const baseSelections = roomSelections.filter(
      (selection) => selection.roomMode !== roomMode
    );
    const otherPeople = computePeopleCount(baseSelections, roomModes);
    const mode = roomModes.find((room) => room.value === roomMode);
    const peoplePerRoom = mode?.fixed_people ?? 1;
    const maxRoomsForMode = Math.max(
      0,
      Math.floor((maxPeople - otherPeople) / peoplePerRoom)
    );
    const safeQuantity = Math.min(Math.max(0, quantity), maxRoomsForMode);
    const nextSelections: RoomSelection[] = baseSelections.concat(
      safeQuantity > 0 ? [{ roomMode, quantity: safeQuantity }] : []
    );
    setRoomSelections(nextSelections);
  };

  const selectedRooms = useMemo(() => {
    return roomSelections
      .map((selection) => {
        const mode = roomModes.find((room) => room.value === selection.roomMode);
        const roomLabel = typeof mode?.label === 'string' ? mode.label : '';
        const guestCount = mode?.fixed_people ?? 1;
        return {
          roomLabel,
          guestCount,
          quantity: selection.quantity,
        };
      })
      .filter((selection) => selection.quantity > 0);
  }, [roomModes, roomSelections]);

  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
        <h2 className="text-xl font-semibold">{t('howManyPeople')}</h2>
        <p className="text-xs text-primary/90">
          {t('peopleLabel')}: {peopleCount}
        </p>
      </div>

      <div>
        <p className="text-sm text-base-content/80 mb-3">{t('roomType')}</p>
        <div className="rounded-xl border border-base-300/60 bg-base-200/40 px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-primary/90">
              {t('selectedRoomsLabel')}
            </p>
            {selectedRooms.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setRoomSelections([]);
                  setOccupancyByRoomType({});
                }}
                className="text-xs text-base-content/50 hover:text-base-content/70 transition-colors underline"
              >
                {t('clearSelection')}
              </button>
            )}
          </div>
          {selectedRooms.length === 0 ? (
            <p className="text-sm text-base-content/80">
              {t('noRoomsSelected')}
            </p>
          ) : (
            <div className="space-y-2">
              {selectedRooms.map((selection, idx) => (
                <div
                  key={`${selection.roomLabel}-${selection.guestCount}-${idx}`}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-base-content/90 font-medium">
                    {selection.quantity} × {selection.roomLabel}
                  </span>
                  <span className="text-base-content/70">
                    ({selection.guestCount} {t('guests')}, {t('privateBathroom')})
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              {t('addRoom')}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-primary/90 mt-4">
        {t('roomMixHint')}
      </p>

      <Modal
        open={isModalOpen}
        title={t('roomSelectionTitle')}
        closeLabel={t('closeModal')}
        onClose={() => setIsModalOpen(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roomTypeGroups.map((group) => {
            const defaultOccupancy = occupancyByRoomType[group.id] ?? group.occupancyOptions[0]?.value;
            const currentOccupancy = defaultOccupancy;
            const selectedCount = selectionsByMode[currentOccupancy] ?? 0;
            const currentMode = roomModes.find((m) => m.value === currentOccupancy);
            const peoplePerRoom = currentMode?.fixed_people ?? 1;
            
            const roomTypeCount = roomSelections.reduce((sum, selection) => {
              const mode = roomModes.find((m) => m.value === selection.roomMode);
              return mode?.room_type_id === group.id
                ? sum + selection.quantity
                : sum;
            }, 0);
            
            const remainingUnits = Math.max(0, group.unitsAvailable - roomTypeCount + selectedCount);
            const computedMax = Math.min(
              remainingUnits,
              Math.max(0, Math.floor(maxPeople / peoplePerRoom))
            );
            
            const handleOccupancyChange = (newOccupancy: RoomMode) => {
              const oldMode = currentOccupancy;
              const oldCount = selectionsByMode[oldMode] ?? 0;
              
              // Calculate max for new occupancy
              const newMode = roomModes.find((m) => m.value === newOccupancy);
              const newPeoplePerRoom = newMode?.fixed_people ?? 1;
              const otherSelections = roomSelections.filter((s) => s.roomMode !== oldMode);
              const otherPeople = computePeopleCount(otherSelections, roomModes);
              const maxForNewOccupancy = Math.min(
                remainingUnits,
                Math.max(0, Math.floor((maxPeople - otherPeople) / newPeoplePerRoom))
              );
              
              // Keep current count if valid, otherwise clamp to max
              const newCount = Math.min(oldCount, maxForNewOccupancy);
              
              // Only change if no rooms selected OR the change is valid (newCount > 0)
              if (oldCount === 0 || newCount > 0) {
                // Update occupancy selection in UI
                setOccupancyByRoomType(prev => ({
                  ...prev,
                  [group.id]: newOccupancy,
                }));
                
                // Transfer room count from old mode to new mode if changing modes
                // Do this in a SINGLE state update to avoid race conditions
                if (oldMode !== newOccupancy && oldCount > 0) {
                  // Remove old mode and add new mode in single operation
                  const baseSelections = roomSelections.filter((s) => s.roomMode !== oldMode);
                  if (newCount > 0) {
                    setRoomSelections([...baseSelections, { roomMode: newOccupancy, quantity: newCount }]);
                  } else {
                    setRoomSelections(baseSelections);
                  }
                }
              }
            };
            
            const showCoupleNote = currentOccupancy.endsWith('_couple');

            return (
              <div key={group.id} className="rounded-xl border border-primary/20 bg-base-100 px-4 py-4">
                <div className="mb-3">
                  <h3 className="text-base font-semibold mb-1">
                    {group.name}
                  </h3>
                  <p className="text-xs text-base-content/60">
                    {t('unitsAvailable', { count: group.unitsAvailable })}
                  </p>
                </div>
                
                <div className="mb-3">
                  <label className="text-sm text-base-content/80 mb-2 block">
                    👤 {t('guestsPerRoom')}
                  </label>
                  <SegmentedControl
                    value={currentOccupancy}
                    onChange={(value) => handleOccupancyChange(value as RoomMode)}
                    options={group.occupancyOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                    size="sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-base-content/80 mb-2 block">
                    🛏️ {t('numberOfRooms')}
                  </label>
                  <Stepper
                    value={selectedCount}
                    onChange={(value) => updateSelection(currentOccupancy, value)}
                    min={0}
                    max={computedMax}
                    size="sm"
                  />
                </div>
                
                {showCoupleNote && selectedCount > 0 && (
                  <p className="mt-3 text-xs text-base-content/70 italic">
                    {t('coupleNote')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </Card>
  );
}
