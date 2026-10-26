import { Badge } from '@/components/ui/Badge/Badge';
import type { PackageTagContent } from '@/lib/schemas/experience.schema';

interface PackageTagBadgesProps {
  tags: readonly PackageTagContent[];
  className?: string;
}

const VARIANT_CLASSES: Record<PackageTagContent['variant'], string> = {
  warning: 'border-warning/60 font-semibold text-warning-content',
};

export function PackageTagBadges({ tags, className = '' }: PackageTagBadgesProps) {
  if (tags.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <li key={tag.label}>
          <Badge variant={tag.variant} size="sm" className={`whitespace-nowrap ${VARIANT_CLASSES[tag.variant]}`}>
            {tag.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
