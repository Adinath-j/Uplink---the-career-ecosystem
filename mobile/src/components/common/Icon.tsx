import React from 'react';
import {
  House,
  Briefcase,
  CircleHelp,
  Users,
  Bookmark,
  Bell,
  BellDot,
  Search,
  SlidersHorizontal,
  User,
  Rss,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  X,
  Check,
  Clock,
  MapPin,
  Calendar,
  ThumbsUp,
  Plus,
  Share2,
  ExternalLink,
  CheckCircle2,
  Pencil,
  GraduationCap,
  Award,
  Code,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '../../theme';

export type IconName =
  | 'home'
  | 'feed'
  | 'bookmark'
  | 'bookmark-fill'
  | 'bell'
  | 'bell-dot'
  | 'search'
  | 'filter'
  | 'user'
  | 'briefcase'
  | 'help-circle'
  | 'users'
  | 'rss'
  | 'chevron-right'
  | 'chevron-left'
  | 'arrow-left'
  | 'close'
  | 'check'
  | 'clock'
  | 'map-pin'
  | 'calendar'
  | 'thumbs-up'
  | 'plus'
  | 'share'
  | 'external-link'
  | 'check-circle'
  | 'edit'
  | 'academic-cap'
  | 'award'
  | 'code';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  style?: any;
}

const ICON_MAP: Record<IconName, LucideIcon> = {
  home: House,
  feed: Rss,
  rss: Rss,
  bookmark: Bookmark,
  'bookmark-fill': Bookmark,
  bell: Bell,
  'bell-dot': BellDot,
  search: Search,
  filter: SlidersHorizontal,
  user: User,
  briefcase: Briefcase,
  'help-circle': CircleHelp,
  users: Users,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'arrow-left': ArrowLeft,
  close: X,
  check: Check,
  clock: Clock,
  'map-pin': MapPin,
  calendar: Calendar,
  'thumbs-up': ThumbsUp,
  plus: Plus,
  share: Share2,
  'external-link': ExternalLink,
  'check-circle': CheckCircle2,
  edit: Pencil,
  'academic-cap': GraduationCap,
  award: Award,
  code: Code,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = colors.text,
  strokeWidth = 2,
  fill,
  style,
}) => {
  const Component = ICON_MAP[name] || CircleHelp;
  const isFilledBookmark = name === 'bookmark-fill';

  return (
    <Component
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill || (isFilledBookmark ? color : 'none')}
      style={style}
    />
  );
};
