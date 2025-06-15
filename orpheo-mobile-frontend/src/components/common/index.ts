// Exportar todos los componentes comunes
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Loading, LoadingDots, LoadingSkeleton, LoadingButton } from './Loading';
export { default as Card, CardWithHeader, ListCard, StatsCard } from './Card';
export { default as Header, SearchHeader, ProfileHeader, ActionHeader } from './Header';
export { default as SearchBar, SearchBarWithSuggestions, CompactSearchBar } from './SearchBar';
export {
  default as Badge,
  GradoBadge,
  DocumentoBadge,
  ProgramaBadge,
  AsistenciaBadge,
  NotificationBadge,
  CustomBadge,
} from './Badge';

// Re-exportar tipos si es necesario
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';
export type { LoadingProps } from './Loading';
export type { CardProps } from './Card';
export type { HeaderProps } from './Header';
export type { SearchBarProps } from './SearchBar';
export type { BadgeProps } from './Badge';