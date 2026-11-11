import styles from '@/components/Guide/GuideMotion.module.css';
import { staggerStyle } from '@/components/Guide/motion';

const hexagon = (radius: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });

interface TrapicheIllustrationProps {
  alt: string;
  labels: { core: string; arm: string; sector: string };
}

/** Cross-section of a trapiche emerald: a core, six dark arms and six green sectors. */
export function TrapicheIllustration({ alt, labels }: TrapicheIllustrationProps) {
  const outer = hexagon(88);
  const core = hexagon(20);

  return (
    <svg viewBox="-100 -100 300 200" role="img" aria-label={alt} className="mx-auto h-auto w-full max-w-md">
      {outer.map((point, i) => {
        const next = (i + 1) % 6;
        return (
          <polygon
            key={`sector-${i}`}
            points={`${core[i].x},${core[i].y} ${point.x},${point.y} ${outer[next].x},${outer[next].y} ${core[next].x},${core[next].y}`}
            className={`fill-emerald-500/80 ${styles.fadeIn}`}
            style={staggerStyle(9 + i)}
          />
        );
      })}
      <polygon points={core.map((p) => `${p.x},${p.y}`).join(' ')} className="fill-emerald-900" />
      {outer.map((point, i) => (
        <path
          key={`arm-${i}`}
          d={`M${core[i].x} ${core[i].y} L${point.x} ${point.y}`}
          pathLength={1}
          className={`fill-none stroke-neutral-800 stroke-[5] ${styles.draw}`}
          style={staggerStyle(i)}
        />
      ))}
      <polygon
        points={outer.map((p) => `${p.x},${p.y}`).join(' ')}
        className="fill-none stroke-emerald-900 stroke-2"
      />

      <g className="fill-base-content text-[11px] font-semibold">
        <path d="M14 -12 L110 -60" className="stroke-base-content/50 stroke-1" />
        <text x={114} y={-57}>{labels.core}</text>
        <path d="M60 -35 L110 -10" className="stroke-base-content/50 stroke-1" />
        <text x={114} y={-7}>{labels.arm}</text>
        <path d="M55 30 L110 45" className="stroke-base-content/50 stroke-1" />
        <text x={114} y={48}>{labels.sector}</text>
      </g>
    </svg>
  );
}

interface ThreePhaseIllustrationProps {
  alt: string;
  labels: { liquid: string; gas: string; crystal: string };
}

/**
 * Jagged fluid inclusion with three phases: brine (liquid), a gas bubble and
 * a cubic halite crystal. Schematic, not to scale.
 */
export function ThreePhaseIllustration({ alt, labels }: ThreePhaseIllustrationProps) {
  const cavity = 'M20 70 L45 48 L60 62 L85 40 L100 55 L130 35 L150 52 L180 38 L200 58 L230 45 L250 75 L228 100 L205 88 L180 110 L160 95 L130 115 L110 98 L80 118 L60 100 L35 108 Z';

  return (
    <svg viewBox="0 0 440 160" role="img" aria-label={alt} className="mx-auto h-auto w-full max-w-lg">
      <rect x="0" y="0" width="270" height="160" rx="12" className="fill-emerald-600/25" />
      <path d={cavity} className={`fill-sky-200/80 stroke-emerald-900 stroke-[1.5] ${styles.fadeIn}`} />
      <circle cx="175" cy="72" r="16" className={`fill-base-100 stroke-emerald-900 stroke-[1.5] ${styles.fadeIn}`} style={staggerStyle(5)} />
      <rect
        x="92"
        y="64"
        width="20"
        height="20"
        transform="rotate(12 102 74)"
        className={`fill-white stroke-neutral-700 stroke-[1.5] ${styles.fadeIn}`}
        style={staggerStyle(9)}
      />

      <g className="fill-base-content text-[15px] font-semibold">
        <path d="M225 90 L282 120" className="stroke-base-content/50 stroke-1" />
        <text x={286} y={124}>{labels.liquid}</text>
        <path d="M190 64 L282 40" className="stroke-base-content/50 stroke-1" />
        <text x={286} y={44}>{labels.gas}</text>
        <path d="M110 66 L150 20 L282 20" className="fill-none stroke-base-content/50 stroke-1" />
        <text x={286} y={24}>{labels.crystal}</text>
      </g>
    </svg>
  );
}
