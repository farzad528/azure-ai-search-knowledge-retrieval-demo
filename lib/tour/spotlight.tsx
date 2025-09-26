'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface SpotlightProps {
  targetSelector?: string;
  isActive: boolean;
  padding?: number;
  borderRadius?: number;
  overlay?: boolean;
  overlayOpacity?: number;
  onClick?: () => void;
  zIndex?: number;
}

export function Spotlight({
  targetSelector,
  isActive,
  padding = 8,
  borderRadius = 8,
  overlay = true,
  overlayOpacity = 0.6,
  onClick,
  zIndex = 9998,
}: SpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number>();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    // Initial update
    updateRect();

    // Watch for changes
    const observer = new ResizeObserver(updateRect);
    const element = document.querySelector(targetSelector);
    if (element) {
      observer.observe(element);
    }

    // Also update on scroll and resize
    const handleUpdate = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRect);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, targetSelector]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {isActive && overlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex,
            pointerEvents: targetRect ? 'auto' : 'none',
          }}
          onClick={onClick}
        >
          {targetRect ? (
            <>
              {/* Dark overlay with cutout */}
              <svg
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <defs>
                  <mask id="spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={targetRect.left - padding}
                      y={targetRect.top - padding}
                      width={targetRect.width + padding * 2}
                      height={targetRect.height + padding * 2}
                      rx={borderRadius}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill={`rgba(0, 0, 0, ${overlayOpacity})`}
                  mask="url(#spotlight-mask)"
                />
              </svg>

              {/* Highlight border */}
              <motion.div
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  left: targetRect.left - padding,
                  top: targetRect.top - padding,
                  width: targetRect.width + padding * 2,
                  height: targetRect.height + padding * 2,
                  borderRadius,
                  border: '2px solid rgba(59, 130, 246, 0.8)',
                  boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
                  pointerEvents: 'none',
                }}
              />

              {/* Click-through area for target element */}
              <div
                style={{
                  position: 'absolute',
                  left: targetRect.left - padding,
                  top: targetRect.top - padding,
                  width: targetRect.width + padding * 2,
                  height: targetRect.height + padding * 2,
                  pointerEvents: 'none',
                }}
              />
            </>
          ) : (
            /* Full overlay when no target */
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}