'use client';

import React from 'react';
import { useTour } from './tour-provider';
import { Spotlight } from './spotlight';
import { Coachmark } from './coachmark';
import { useTourEventTrackers } from './analytics';

interface InteractiveTourProps {
  className?: string;
}

export function InteractiveTour({ className }: InteractiveTourProps) {
  const {
    state,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    previousStep,
    endTour,
    canGoNext,
    canGoPrevious,
  } = useTour();

  const {
    onStepNext,
    onStepPrevious,
    onTourComplete,
    onTourExit,
    onTargetNotFound,
  } = useTourEventTrackers();

  if (!state.isActive || !currentStep) {
    return null;
  }

  const handleNext = () => {
    onStepNext();
    nextStep();
  };

  const handlePrevious = () => {
    onStepPrevious();
    previousStep();
  };

  const handleClose = () => {
    onTourExit('user_closed');
    endTour('skipped');
  };

  const handleComplete = () => {
    onTourComplete();
    endTour('completed');
  };

  const isTargetVisible = currentStep.targetSelector
    ? document.querySelector(currentStep.targetSelector) !== null
    : true;

  if (currentStep.targetSelector && !isTargetVisible) {
    onTargetNotFound(currentStep.targetSelector);
  }

  return (
    <div className={className}>
      {/* Spotlight overlay */}
      <Spotlight
        targetSelector={currentStep.targetSelector}
        isActive={state.isActive && isTargetVisible}
        onClick={currentStep.targetSelector ? undefined : handleClose}
      />

      {/* Coachmark popover */}
      <Coachmark
        targetSelector={currentStep.targetSelector}
        isActive={state.isActive}
        title={currentStep.title}
        content={currentStep.content}
        position={currentStep.position}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onClose={handleClose}
        onComplete={handleComplete}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        stepIndex={currentStepIndex}
        totalSteps={totalSteps}
        milestone={currentStep.milestone}
        fallback={currentStep.fallback}
      />
    </div>
  );
}