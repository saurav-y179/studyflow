import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter — rolls up from 0 to `value` on mount/change.
 * Uses requestAnimationFrame for smooth 60fps animation.
 *
 * Props:
 *   value      — target number
 *   duration   — animation duration in ms (default: 1200)
 *   prefix     — string before number (e.g. '$')
 *   suffix     — string after number (e.g. '%', ' days')
 *   decimals   — decimal places (default: 0)
 *   className  — additional CSS classes
 *   style      — additional inline styles
 */
export const AnimatedCounter = ({
  value = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  style = {},
}) => {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafId = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    const diff = to - from;

    if (Math.abs(diff) < 0.01) {
      setDisplay(to);
      prevValue.current = to;
      return;
    }

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + diff * eased;

      setDisplay(current);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setDisplay(to);
        prevValue.current = to;
      }
    };

    startTime.current = null;
    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return (
    <span className={`tabular-nums ${className}`} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

/**
 * Sparkline — tiny SVG line chart for stat cards.
 *
 * Props:
 *   data      — array of numbers
 *   width     — SVG width (default: 80)
 *   height    — SVG height (default: 28)
 *   color     — stroke color
 *   animated  — whether to animate the draw
 */
export const Sparkline = ({
  data = [],
  width = 80,
  height = 28,
  color = '#2EE6D8',
  animated = true,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Area fill */}
      <defs>
        <linearGradient id={`sparkline-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill={`url(#sparkline-grad-${color.replace('#', '')})`}
        className="sparkline-area"
      />
      {/* Line */}
      <path
        d={pathD}
        stroke={color}
        className={`sparkline ${animated ? 'sparkline-animated' : ''}`}
      />
      {/* End dot */}
      <circle
        cx={parseFloat(points[points.length - 1].split(',')[0])}
        cy={parseFloat(points[points.length - 1].split(',')[1])}
        r="2.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
};

/**
 * TrendArrow — shows ↑ or ↓ with percentage change.
 */
export const TrendArrow = ({ value, className = '' }) => {
  if (!value || value === 0) return null;

  const isUp = value > 0;
  const color = isUp ? '#4ADE80' : '#F87171';

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${className}`}
      style={{ color }}
    >
      <span style={{ fontSize: '8px' }}>{isUp ? '▲' : '▼'}</span>
      {Math.abs(value)}%
    </span>
  );
};
