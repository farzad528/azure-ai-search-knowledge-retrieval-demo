'use client';

import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CoachmarkProps {
  targetSelector?: string;
  isActive: boolean;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  onNext?: () => void;
  onPrevious?: () => void;
  onClose?: () => void;
  onComplete?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  milestone?: boolean;
  fallback?: ReactNode;
  zIndex?: number;
  className?: string;
}

export function Coachmark({
  targetSelector,
  isActive,
  title,
  content,
  position = 'bottom',
  onNext,
  onPrevious,
  onClose,
  onComplete,
  canGoNext = true,
  canGoPrevious = false,
  stepIndex = 0,
  totalSteps = 1,
  milestone = false,
  fallback,
  zIndex = 9999,
  className,
}: CoachmarkProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [coachmarkPosition, setCoachmarkPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const coachmarkRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(targetSelector);
      if (!element) {
        setTargetRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      if (!coachmarkRef.current) return;

      const coachmarkRect = coachmarkRef.current.getBoundingClientRect();
      let x = 0;
      let y = 0;

      const spacing = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2 - coachmarkRect.width / 2;
          y = rect.top - coachmarkRect.height - spacing;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - coachmarkRect.width / 2;
          y = rect.bottom + spacing;
          break;
        case 'left':
          x = rect.left - coachmarkRect.width - spacing;
          y = rect.top + rect.height / 2 - coachmarkRect.height / 2;
          break;
        case 'right':
          x = rect.right + spacing;
          y = rect.top + rect.height / 2 - coachmarkRect.height / 2;
          break;
        case 'center':
          x = viewportWidth / 2 - coachmarkRect.width / 2;
          y = viewportHeight / 2 - coachmarkRect.height / 2;
          break;
      }

      // Keep coachmark within viewport
      x = Math.max(spacing, Math.min(x, viewportWidth - coachmarkRect.width - spacing));
      y = Math.max(spacing, Math.min(y, viewportHeight - coachmarkRect.height - spacing));

      setCoachmarkPosition({ x, y });
    };

    // Initial update
    updatePosition();

    // Watch for changes
    const observer = new ResizeObserver(updatePosition);
    const element = document.querySelector(targetSelector);
    if (element) {
      observer.observe(element);
    }

    // Update on scroll and resize
    const handleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, targetSelector, position]);

  if (!mounted) return null;

  const isLastStep = stepIndex === totalSteps - 1;

  const content_element = (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={coachmarkRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            left: position === 'center' ? '50%' : coachmarkPosition.x,
            top: position === 'center' ? '50%' : coachmarkPosition.y,
            transform: position === 'center' ? 'translate(-50%, -50%)' : 'none',
            zIndex,
          }}
          className={cn(
            'bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-96',
            className
          )}
          role="dialog"
          aria-label={title}
          aria-describedby="coachmark-content"
          aria-modal="false"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-auto"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div id="coachmark-content" className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {content}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Step counter */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {totalSteps > 1 && (
                <span>
                  Step {stepIndex + 1} of {totalSteps}
                </span>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {canGoPrevious && onPrevious && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevious}
                  aria-label="Previous step"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              )}

              {isLastStep ? (
                <Button
                  size="sm"
                  onClick={onComplete || onNext}
                  aria-label="Complete tour"
                >
                  Complete
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={onNext}
                  disabled={!canGoNext}
                  aria-label="Next step"
                >
                  {milestone && !canGoNext ? (
                    'Complete task to continue'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Milestone indicator */}
          {milestone && (
            <div
              className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full"
              aria-label="Milestone step"
            >
              Required
            </div>
          )}

          {/* Pointer arrow */}
          {targetRect && position !== 'center' && (
            <div
              className={cn(
                'absolute w-3 h-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45',
                {
                  'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-0 border-l-0': position === 'top',
                  'top-[-6px] left-1/2 -translate-x-1/2 border-b-0 border-r-0': position === 'bottom',
                  'right-[-6px] top-1/2 -translate-y-1/2 border-l-0 border-t-0': position === 'left',
                  'left-[-6px] top-1/2 -translate-y-1/2 border-r-0 border-b-0': position === 'right',
                }
              )}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Show fallback if target not found
  if (isActive && !targetRect && fallback) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>{fallback}</div>
      </motion.div>,
      document.body
    );
  }

  return createPortal(content_element, document.body);
}