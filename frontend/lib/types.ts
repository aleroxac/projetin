export type TabId = "workout" | "diet" | "shape";

export interface WidgetMeta {
  id: string;
  title: string;
  tab: TabId;
  icon: string;
  description: string;
  /** Default column span */
  span?: number;
  /** Minimum column span */
  minSpan?: number;
  /** Maximum column span */
  maxSpan?: number;
  /** Default row span */
  defaultH?: number;
  /** Minimum row span */
  minH?: number;
}

/** Position and size of one widget on the canvas grid */
export interface WidgetLayout {
  id: string;
  /** Grid column (0-based) */
  x: number;
  /** Grid row (0-based) */
  y: number;
  /** Column span */
  w: number;
  /** Row span */
  h: number;
}

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  badge?: number;
  color?: string;
}
