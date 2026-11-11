import { EMERALD_MAP_POINTS, type EmeraldBelt, type EmeraldMapPoint } from '@/lib/content/emeraldMap';
import styles from '@/components/Guide/GuideMotion.module.css';
import { staggerStyle } from '@/components/Guide/motion';

/** Equirectangular projection; one degree ≈ 400 viewBox units. Fine at this scale (≈1.3°). */
const SCALE = 400;
const MIN_LON = -74.45;
const MAX_LAT = 5.8;
const WIDTH = 540;
const HEIGHT = 520;

const project = (point: Pick<EmeraldMapPoint, 'lat' | 'lon'>) => ({
  x: (point.lon - MIN_LON) * SCALE,
  y: (MAX_LAT - point.lat) * SCALE,
});

/** Label to the left where a neighbour would collide on the right. */
const LABEL_LEFT = new Set(['muzo', 'chivor']);

const BELT_COLOR: Record<EmeraldBelt | 'reference', string> = {
  western: 'text-emerald-600 dark:text-emerald-400',
  eastern: 'text-teal-700 dark:text-teal-300',
  reference: 'text-base-content/70',
};

function beltEllipse(belt: EmeraldBelt) {
  const points = EMERALD_MAP_POINTS.filter((point) => point.belt === belt).map(project);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, rx: (maxX - minX) / 2 + 40, ry: (maxY - minY) / 2 + 45 };
}

interface BeltMapProps {
  /** Accessible description of the whole map (from the section's figure copy). */
  alt: string;
  beltLabels: Record<EmeraldBelt, string>;
}

/**
 * Schematic map of Colombia's two emerald belts. Static SVG, no JavaScript;
 * routes draw in and points fade in, both skipped under reduced motion.
 */
export function BeltMap({ alt, beltLabels }: BeltMapProps) {
  const bogota = project(EMERALD_MAP_POINTS.find((point) => point.id === 'bogota')!);
  const western = beltEllipse('western');
  const eastern = beltEllipse('eastern');
  const routeTargets = ['muzo', 'chivor'].map((id) => project(EMERALD_MAP_POINTS.find((point) => point.id === id)!));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={alt}
      className="h-auto w-full rounded-xl bg-base-200/60"
    >
      <ellipse {...western} className={`fill-current opacity-10 ${BELT_COLOR.western}`} />
      <ellipse {...eastern} className={`fill-current opacity-10 ${BELT_COLOR.eastern}`} />
      <text
        x={western.cx}
        y={western.cy + western.ry + 26}
        textAnchor="middle"
        className={`fill-current text-[19px] font-bold ${BELT_COLOR.western}`}
      >
        {beltLabels.western}
      </text>
      <text
        x={eastern.cx}
        y={eastern.cy - eastern.ry - 12}
        textAnchor="middle"
        className={`fill-current text-[19px] font-bold ${BELT_COLOR.eastern}`}
      >
        {beltLabels.eastern}
      </text>

      {routeTargets.map((target, index) => (
        <path
          key={index}
          d={`M${bogota.x} ${bogota.y} L${target.x} ${target.y}`}
          pathLength={1}
          className={`fill-none stroke-current stroke-[1.5] text-base-content/40 ${styles.draw}`}
          style={staggerStyle(index * 3)}
        />
      ))}

      {EMERALD_MAP_POINTS.map((point, index) => {
        const { x, y } = project(point);
        const left = LABEL_LEFT.has(point.id);
        return (
          <g
            key={point.id}
            className={`${BELT_COLOR[point.belt]} ${styles.fadeIn}`}
            style={staggerStyle(4 + index)}
          >
            <circle cx={x} cy={y} r={point.belt === 'reference' ? 6 : 8} className="fill-current" />
            <text
              x={left ? x - 13 : x + 13}
              y={y + 6}
              textAnchor={left ? 'end' : 'start'}
              className="fill-base-content text-[18px] font-semibold"
            >
              {point.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
