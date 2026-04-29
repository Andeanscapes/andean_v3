import { Clock, Car, Flame, Mountain, Sunset } from 'lucide-react';
import type { ReactNode } from 'react';

export const EXPERIENCE_ICON_MAP: Record<string, ReactNode> = {
  clock: <Clock className="h-5 w-5" />,
  hourglass: <Flame className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />,
  activity: <Mountain className="h-5 w-5" />,
  sunset: <Sunset className="h-5 w-5" />,
};
