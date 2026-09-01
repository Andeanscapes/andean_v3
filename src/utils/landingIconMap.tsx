import {
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Car,
  Clock,
  Compass,
  CreditCard,
  Gem,
  Globe2,
  HardHat,
  Headphones,
  Heart,
  HelpCircle,
  Home,
  Languages,
  Laptop,
  LifeBuoy,
  Lock,
  MapPin,
  MessageCircle,
  Mountain,
  Palette,
  Plane,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Undo2,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

/**
 * Brand-level icon map for landing page mock data.
 * Keys mirror the PascalCase Lucide icon names used in landing.mock.ts → iconName fields.
 * Kept separate from EXPERIENCE_ICON_MAP (which serves experience-detail logistics).
 */
export const LANDING_ICON_MAP: Record<string, LucideIcon> = {
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Car,
  Clock,
  Compass,
  CreditCard,
  Gem,
  Globe2,
  HardHat,
  Headphones,
  Heart,
  Home,
  Languages,
  Laptop,
  LifeBuoy,
  Lock,
  MapPin,
  MessageCircle,
  Mountain,
  Palette,
  Plane,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Undo2,
  Users,
  UtensilsCrossed,
};

/**
 * Type-safe accessor with safe fallback to HelpCircle when the name is unknown.
 * Always returns a valid JSX-renderable icon component.
 */
/** Valid icon names, so callers can validate without a lookup attempt. */
export const LANDING_ICON_NAMES: ReadonlySet<string> = new Set(Object.keys(LANDING_ICON_MAP));

export function getLandingIcon(name: string): LucideIcon {
  return LANDING_ICON_MAP[name] ?? HelpCircle;
}
