"use client";
import React from 'react';
import Image from 'next/image';
import { SourceKind, SOURCE_KIND_ICON_PATH, SOURCE_KIND_LABEL } from '@/lib/sourceKinds';
import { cn } from '@/lib/utils';
interface SourceKindIconProps {
  kind: SourceKind | string;
  className?: string;
  /** size refers to inner SVG dimension; outer box will match for square alignment */
  size?: number;
  title?: string;
  /** badge = padded square with subtle background, plain = image only */
  variant?: 'badge' | 'plain';
  /** optional override for outer box size; defaults to size + padding */
  boxSize?: number;
}
export const SourceKindIcon: React.FC<SourceKindIconProps> = ({
  kind,
  className = '',
  size = 18,
  title,
  variant = 'badge',
  boxSize
}) => {
  const normalized = (kind || '').toString().trim();
  const lower = normalized.toLowerCase();
  const enumValues = Object.values<string>(SourceKind as any);
  const matchedEnum = enumValues.find(ev => ev.toLowerCase() === lower) as SourceKind | undefined;
  const isKnown = !!matchedEnum;
  const resolvedKind = matchedEnum || SourceKind.SearchIndex;
  const baseSrc = SOURCE_KIND_ICON_PATH[resolvedKind];

  const inner = isKnown ? (
    <Image src={baseSrc} alt={normalized} width={size} height={size} />
  ) : (
    <span className="text-[10px] font-semibold tracking-tight">
      {(normalized || '?').slice(0,2).toUpperCase()}
    </span>
  );

  if (variant === 'plain') {
    return (
      <span
        className={cn('inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        title={title || (isKnown ? SOURCE_KIND_LABEL[resolvedKind] : kind)}
      >{inner}</span>
    );
  }

  const pad = 6; // uniform padding inside square badge
  const outer = boxSize || size + pad * 2;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-bg-subtle border border-stroke-divider',
        className
      )}
      style={{ width: outer, height: outer }}
      title={title || (isKnown ? SOURCE_KIND_LABEL[resolvedKind] : kind)}
    >
      {inner}
    </span>
  );
};
