import React, { createElement, Fragment } from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: keyof typeof LucideIcons;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

/**
 * A wrapper component for Lucide icons that works with React 19
 *
 * Usage example:
 * ```tsx
 * <IconWrapper name="Map" size={24} />
 * ```
 */
export const IconWrapper: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
}) => {
  // Make sure the icon exists
  if (!(name in LucideIcons)) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return <Fragment />;
  }

  // Get the icon component
  const IconComponent = LucideIcons[name];

  // Use createElement to create the icon element
  // This is a workaround for the React 19 compatibility issue
  return createElement(IconComponent, {
    size,
    color,
    strokeWidth,
    className,
    'aria-hidden': true,
  });
};
