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
  ChevronDown,
  ChevronUp,
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
  MessageSquare,
  Send,
  Sparkles,
  FileText,
  ShieldCheck,
  CheckSquare,
  Download,
  RotateCw,
  Globe,
  Settings,
  Trash2,
  Lock,
  Shield,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, useTheme } from '../../theme';

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
  | 'chevron-down'
  | 'chevron-up'
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
  | 'code'
  | 'message-square'
  | 'send'
  | 'sparkles'
  | 'file-text'
  | 'shield-check'
  | 'check-square'
  | 'download'
  | 'refresh'
  | 'globe'
  | 'settings'
  | 'trash'
  | 'lock'
  | 'shield'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'smartphone'
  | 'system';

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
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
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
  'message-square': MessageSquare,
  send: Send,
  sparkles: Sparkles,
  'file-text': FileText,
  'shield-check': ShieldCheck,
  'check-square': CheckSquare,
  download: Download,
  refresh: RotateCw,
  globe: Globe,
  settings: Settings,
  trash: Trash2,
  lock: Lock,
  shield: Shield,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  smartphone: Smartphone,
  system: Smartphone,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  fill,
  style,
}) => {
  const { colors: themeColors } = useTheme();
  const iconColor = color || themeColors?.text || colors.text;
  const Component = ICON_MAP[name] || CircleHelp;
  const isFilledBookmark = name === 'bookmark-fill';

  return (
    <Component
      size={size}
      color={iconColor}
      strokeWidth={strokeWidth}
      fill={fill || (isFilledBookmark ? iconColor : 'none')}
      style={style}
    />
  );
};
