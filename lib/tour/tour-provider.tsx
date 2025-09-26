'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface TourStep {
  id: string;
  targetSelector?: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  milestone?: boolean;
  fallback?: ReactNode;
  action?: () => void;
  nextCondition?: () => boolean;
}

interface TourState {
  isActive: boolean;
  currentStepId: string | null;
  completedSteps: Set<string>;
  skippedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

interface TourContextValue {
  state: TourState;
  steps: TourStep[];
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isDemoMode: boolean;
  startTour: (stepId?: string) => void;
  endTour: (reason?: 'completed' | 'skipped') => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepId: string) => void;
  markStepComplete: (stepId: string) => void;
  resetTour: () => void;
  setDemoMode: (enabled: boolean) => void;
  registerSteps: (steps: TourStep[]) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const STORAGE_KEY = 'app-tour-state';
const DEMO_MODE_KEY = 'app-demo-mode';

const defaultState: TourState = {
  isActive: false,
  currentStepId: null,
  completedSteps: new Set(),
};

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function TourProvider({
  children,
  defaultSteps = [],
  onStepChange,
  onTourEnd,
  analyticsTracker,
}: {
  children: ReactNode;
  defaultSteps?: TourStep[];
  onStepChange?: (step: TourStep, index: number) => void;
  onTourEnd?: (reason: 'completed' | 'skipped') => void;
  analyticsTracker?: (event: string, data: Record<string, any>) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [steps, setSteps] = useState<TourStep[]>(defaultSteps);
  const [state, setState] = useState<TourState>(defaultState);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const savedDemoMode = localStorage.getItem(DEMO_MODE_KEY);

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState({
          ...parsed,
          completedSteps: new Set(parsed.completedSteps || []),
        });
      } catch (e) {
        console.error('Failed to parse tour state:', e);
      }
    }

    if (savedDemoMode === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  // Handle URL params
  useEffect(() => {
    const tour = searchParams.get('tour');
    const step = searchParams.get('step');

    if (tour === 'on' && !state.isActive) {
      const stepId = step ? steps[parseInt(step, 10) - 1]?.id : undefined;
      startTour(stepId);
    }
  }, [searchParams]);

  // Save state to localStorage
  useEffect(() => {
    const toSave = {
      ...state,
      completedSteps: Array.from(state.completedSteps),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state]);

  // Save demo mode preference
  useEffect(() => {
    localStorage.setItem(DEMO_MODE_KEY, isDemoMode.toString());
  }, [isDemoMode]);

  const currentStepIndex = steps.findIndex(s => s.id === state.currentStepId);
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const totalSteps = steps.length;

  const track = useCallback((event: string, data: Record<string, any> = {}) => {
    if (analyticsTracker) {
      analyticsTracker(event, {
        ...data,
        tourId: 'main',
        timestamp: new Date().toISOString(),
        isDemoMode,
      });
    }
  }, [analyticsTracker, isDemoMode]);

  const startTour = useCallback((stepId?: string) => {
    const firstStep = stepId ? steps.find(s => s.id === stepId) : steps[0];
    if (!firstStep) return;

    setState(prev => ({
      ...prev,
      isActive: true,
      currentStepId: firstStep.id,
      startedAt: new Date().toISOString(),
    }));

    track('tour_started', { stepId: firstStep.id });
  }, [steps, track]);

  const endTour = useCallback((reason: 'completed' | 'skipped' = 'completed') => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentStepId: null,
      ...(reason === 'completed'
        ? { completedAt: new Date().toISOString() }
        : { skippedAt: new Date().toISOString() }
      ),
    }));

    track('tour_ended', {
      reason,
      completedSteps: Array.from(state.completedSteps),
      totalSteps,
    });

    if (onTourEnd) {
      onTourEnd(reason);
    }

    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('tour');
    url.searchParams.delete('step');
    router.push(url.pathname + url.search);
  }, [state.completedSteps, totalSteps, track, onTourEnd, router]);

  const goToStep = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    setState(prev => ({
      ...prev,
      currentStepId: stepId,
    }));

    const index = steps.findIndex(s => s.id === stepId);
    track('tour_step_viewed', { stepId, stepIndex: index });

    if (onStepChange) {
      onStepChange(step, index);
    }
  }, [steps, track, onStepChange]);

  const nextStep = useCallback(() => {
    if (!currentStep) return;

    // Check if we can proceed (milestone validation)
    if (currentStep.nextCondition && !currentStep.nextCondition()) {
      return;
    }

    // Execute step action if defined
    if (currentStep.action) {
      currentStep.action();
    }

    markStepComplete(currentStep.id);

    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= steps.length) {
      endTour('completed');
    } else {
      goToStep(steps[nextIndex].id);
    }
  }, [currentStep, currentStepIndex, steps, endTour, goToStep]);

  const previousStep = useCallback(() => {
    if (currentStepIndex <= 0) return;
    goToStep(steps[currentStepIndex - 1].id);
  }, [currentStepIndex, steps, goToStep]);

  const markStepComplete = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: new Set(Array.from(prev.completedSteps).concat(stepId)),
    }));
  }, []);

  const resetTour = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    track('tour_reset');
  }, [track]);

  const registerSteps = useCallback((newSteps: TourStep[]) => {
    setSteps(newSteps);
  }, []);

  const setDemoModeInternal = useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      track('demo_mode_enabled');
    } else {
      track('demo_mode_disabled');
    }
  }, [track]);

  const canGoNext = currentStepIndex < steps.length - 1 &&
    (!currentStep?.nextCondition || currentStep.nextCondition());
  const canGoPrevious = currentStepIndex > 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isActive) return;

      switch (e.key) {
        case 'ArrowRight':
          if (canGoNext) nextStep();
          break;
        case 'ArrowLeft':
          if (canGoPrevious) previousStep();
          break;
        case 'Escape':
          endTour('skipped');
          break;
        case '?':
          if (e.shiftKey) {
            // Show help overlay
            console.log('Help overlay would show here');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isActive, canGoNext, canGoPrevious, nextStep, previousStep, endTour]);

  const value: TourContextValue = {
    state,
    steps,
    currentStep,
    currentStepIndex,
    totalSteps,
    isDemoMode,
    startTour,
    endTour,
    nextStep,
    previousStep,
    goToStep,
    markStepComplete,
    resetTour,
    setDemoMode: setDemoModeInternal,
    registerSteps,
    canGoNext,
    canGoPrevious,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}