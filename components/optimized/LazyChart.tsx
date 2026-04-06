/**
 * Lazy-loaded Recharts wrappers.
 *
 * React 19 dropped `defaultProps` support for function components, which
 * conflicts with the types recharts attaches to its components.  Casting each
 * resolved export to `ComponentType<any>` before handing it to `dynamic()`
 * sidesteps that defaultProps type conflict entirely.
 */

'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeletons';

const chartLoader = () => <Skeleton className="h-64 w-full" />;

// Container / axis / helper components – no loading skeleton needed
const bare = { ssr: false } as const;

export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart as unknown as ComponentType<any> })),
  { loading: chartLoader, ssr: false }
);

export const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.LineChart as unknown as ComponentType<any> })),
  { loading: chartLoader, ssr: false }
);

export const LazyPieChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.PieChart as unknown as ComponentType<any> })),
  { loading: chartLoader, ssr: false }
);

export const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer as unknown as ComponentType<any> })),
  { loading: chartLoader, ssr: false }
);

export const LazyBar = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Bar as unknown as ComponentType<any> })),
  bare
);

export const LazyLine = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Line as unknown as ComponentType<any> })),
  bare
);

export const LazyPie = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Pie as unknown as ComponentType<any> })),
  bare
);

export const LazyXAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.XAxis as unknown as ComponentType<any> })),
  bare
);

export const LazyYAxis = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.YAxis as unknown as ComponentType<any> })),
  bare
);

export const LazyCartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid as unknown as ComponentType<any> })),
  bare
);

export const LazyTooltip = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Tooltip as unknown as ComponentType<any> })),
  bare
);

export const LazyLegend = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.Legend as unknown as ComponentType<any> })),
  bare
);

// Backward-compatible aliases (used in docs and any future imports)
export const BarChart = LazyBarChart;
export const LineChart = LazyLineChart;
export const PieChart = LazyPieChart;
export const ResponsiveContainer = LazyResponsiveContainer;
export const Bar = LazyBar;
export const Line = LazyLine;
export const Pie = LazyPie;
export const XAxis = LazyXAxis;
export const YAxis = LazyYAxis;
export const CartesianGrid = LazyCartesianGrid;
export const Tooltip = LazyTooltip;
export const Legend = LazyLegend;

