// Main tour components
export { TourProvider, useTour } from './tour-provider';
export type { TourStep } from './tour-provider';

export { InteractiveTour } from './interactive-tour';
export { Spotlight } from './spotlight';
export { Coachmark } from './coachmark';

// Demo mode utilities
export { DemoModeControls, DemoSeedData, useDemoMode } from './demo-mode';

// Analytics
export {
  initializeAnalytics,
  useAnalytics,
  useTourAnalytics,
  useTourEventTrackers,
  getStoredAnalytics,
  clearStoredAnalytics,
} from './analytics';

// Example implementation
export { TourExample } from './tour-example';

// Re-export commonly used types
export type { AnalyticsEvent, AnalyticsConfig } from './analytics';