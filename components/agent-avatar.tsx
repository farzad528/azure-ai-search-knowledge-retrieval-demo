"use client";
import React from 'react';
import { Bot20Regular } from '@fluentui/react-icons';
import { cn } from '@/lib/utils';

interface AgentAvatarProps {
  size?: number; // outer square
  iconSize?: number; // inner icon
  className?: string;
  variant?: 'solid' | 'subtle' | 'outline';
  title?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  size = 40,
  iconSize = 20,
  className = '',
  variant = 'subtle',
  title = 'Agent'
}) => {
  const variantClasses = {
    solid: 'bg-accent text-fg-on-accent',
    subtle: 'bg-accent-subtle text-accent',
    outline: 'border border-stroke-divider text-accent'
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0 flex-none aspect-square',
        variantClasses,
        className
      )}
      style={{ width: size, height: size, lineHeight: 0 }}
      title={title}
    >
      <Bot20Regular style={{ width: iconSize, height: iconSize }} />
    </span>
  );
};
