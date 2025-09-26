'use client';

import { useCallback, useEffect } from 'react';
import { useTour } from './tour-provider';

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize: number;
  flushInterval: number;
  debug?: boolean;
}

const defaultConfig: AnalyticsConfig = {
  enabled: true,
  batchSize: 10,
  flushInterval: 5000,
  debug: false,
};

class AnalyticsBuffer {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig) {
    this.config = { ...defaultConfig, ...config };
    this.startFlushTimer();
  }

  track(event: string, properties: Record<string, any>, userId?: string) {
    if (!this.config.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.getSessionId(),
    };

    this.events.push(analyticsEvent);

    if (this.config.debug) {
      console.log('[Analytics]', analyticsEvent);
    }

    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private startFlushTimer() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      if (this.config.endpoint) {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events: eventsToSend }),
        });
      } else {
        // Fallback: store in localStorage for later processing
        const stored = localStorage.getItem('analytics_buffer') || '[]';
        const buffer = JSON.parse(stored);
        buffer.push(...eventsToSend);
        localStorage.setItem('analytics_buffer', JSON.stringify(buffer));
      }

      if (this.config.debug) {
        console.log('[Analytics] Flushed', eventsToSend.length, 'events');
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[Analytics] Flush failed:', error);
      }
      // Re-add events to buffer for retry
      this.events.unshift(...eventsToSend);
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
    this.flush();
  }
}

let analyticsInstance: AnalyticsBuffer | null = null;

export function initializeAnalytics(config: Partial<AnalyticsConfig> = {}) {
  if (analyticsInstance) {
    analyticsInstance.destroy();
  }
  analyticsInstance = new AnalyticsBuffer({ ...defaultConfig, ...config });
  return analyticsInstance;
}

export function useAnalytics(userId?: string) {
  const track = useCallback((event: string, properties: Record<string, any> = {}) => {
    if (!analyticsInstance) {
      analyticsInstance = new AnalyticsBuffer(defaultConfig);
    }
    analyticsInstance.track(event, properties, userId);
  }, [userId]);

  useEffect(() => {
    return () => {
      if (analyticsInstance) {
        analyticsInstance.destroy();
        analyticsInstance = null;
      }
    };
  }, []);

  return { track };
}

export function useTourAnalytics(userId?: string) {
  const { track } = useAnalytics(userId);
  const { state, currentStep, currentStepIndex, totalSteps, isDemoMode } = useTour();

  const trackTourEvent = useCallback((
    event: string,
    additionalProperties: Record<string, any> = {}
  ) => {
    track(event, {
      tourId: 'main',
      stepId: currentStep?.id,
      stepIndex: currentStepIndex,
      stepTitle: currentStep?.title,
      totalSteps,
      isDemoMode,
      tourStartedAt: state.startedAt,
      completedSteps: Array.from(state.completedSteps),
      ...additionalProperties,
    });
  }, [track, currentStep, currentStepIndex, totalSteps, isDemoMode, state]);

  // Auto-track step views
  useEffect(() => {
    if (state.isActive && currentStep) {
      trackTourEvent('tour_step_viewed', {
        stepPosition: currentStep.position,
        stepMilestone: currentStep.milestone,
      });
    }
  }, [state.isActive, currentStep?.id, trackTourEvent]);

  const trackStepAction = useCallback((action: string, properties: Record<string, any> = {}) => {
    trackTourEvent('tour_step_action', {
      action,
      ...properties,
    });
  }, [trackTourEvent]);

  const trackError = useCallback((error: string, properties: Record<string, any> = {}) => {
    trackTourEvent('tour_error', {
      error,
      ...properties,
    });
  }, [trackTourEvent]);

  const trackMilestone = useCallback((milestone: string, properties: Record<string, any> = {}) => {
    trackTourEvent('tour_milestone', {
      milestone,
      ...properties,
    });
  }, [trackTourEvent]);

  return {
    track,
    trackTourEvent,
    trackStepAction,
    trackError,
    trackMilestone,
  };
}

// Pre-defined event tracking hooks
export function useTourEventTrackers() {
  const { trackTourEvent, trackStepAction, trackError } = useTourAnalytics();

  return {
    onStepNext: () => trackStepAction('next'),
    onStepPrevious: () => trackStepAction('previous'),
    onStepSkip: () => trackStepAction('skip'),
    onTourStart: (stepId?: string) => trackTourEvent('tour_started', { startStepId: stepId }),
    onTourComplete: () => trackTourEvent('tour_completed'),
    onTourSkip: () => trackTourEvent('tour_skipped'),
    onTourExit: (reason: string) => trackTourEvent('tour_exited', { reason }),
    onTargetNotFound: (selector: string) => trackError('target_not_found', { selector }),
    onPositionError: (error: string) => trackError('position_error', { error }),
  };
}

// Utility to get stored analytics data
export function getStoredAnalytics(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem('analytics_buffer');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Utility to clear stored analytics data
export function clearStoredAnalytics() {
  localStorage.removeItem('analytics_buffer');
  sessionStorage.removeItem('analytics_session_id');
}