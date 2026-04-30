interface SkeletonProps {
  className?: string;
}

/**
 * Lightweight pulse skeleton for image/content placeholders.
 * Uses Tailwind animate-pulse. No external dependencies.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded bg-base-300/40 ${className}`.trim()}
    />
  );
}
