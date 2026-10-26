import { MapPin, UserCheck } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/Badge/Badge';
import type { PlanCode } from '@/lib/schemas/feed/v2';

const PLAN_VARIANT: Record<PlanCode, NonNullable<BadgeProps['variant']>> = {
  prime: 'plan-prime',
  core: 'plan-core',
  basic: 'plan-basic',
};

interface PlanBadgeProps {
  code: PlanCode;
  label: string;
}

export function PlanBadge({ code, label }: PlanBadgeProps) {
  return (
    <Badge
      variant={PLAN_VARIANT[code]}
      size="sm"
      className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm md:text-xs"
    >
      {label}
    </Badge>
  );
}

interface MineBadgeProps {
  label: string;
}

export function MineBadge({ label }: MineBadgeProps) {
  return (
    <Badge
      variant="place"
      size="sm"
      className="gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-md md:text-xs"
    >
      <MapPin className="h-3.5 w-3.5 text-place-accent" strokeWidth={2.5} aria-hidden="true" />
      {label}
    </Badge>
  );
}

interface PrivateBadgeProps {
  label: string;
}

/** Same photo-overlay weight as the mine badge: a private tour is a defining fact, not an amenity. */
export function PrivateBadge({ label }: PrivateBadgeProps) {
  return (
    <Badge
      variant="place"
      size="sm"
      className="gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-md md:text-xs"
    >
      <UserCheck className="h-3.5 w-3.5 text-place-accent" strokeWidth={2.5} aria-hidden="true" />
      {label}
    </Badge>
  );
}
