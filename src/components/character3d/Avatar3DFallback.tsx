import React from 'react';
import { InteractiveCharacter } from '@/components/character/InteractiveCharacter';
import type { Avatar3DProps } from './avatar3d.types';

/**
 * The production-safe avatar presentation.
 *
 * It intentionally reuses the existing 2D character rather than rendering a
 * placeholder. Avatar3D uses this component while the optional GLB is
 * unavailable, while it is loading, when WebGL is unsupported, and after any
 * model or canvas error.
 */
export const Avatar3DFallback: React.FC<Avatar3DProps> = ({
  className,
  size = 'hero',
  targetOverride = null,
  showPedestal = true,
  showStatusBadge = true,
  customCoordinateText,
  customBadgeText,
  interactive = true,
  onCharacterClick,
}) => {
  return (
    <InteractiveCharacter
      className={className}
      size={size}
      targetOverride={targetOverride}
      showPedestal={showPedestal}
      showStatusBadge={showStatusBadge}
      customCoordinateText={customCoordinateText}
      customBadgeText={customBadgeText}
      interactive={interactive}
      onCharacterClick={onCharacterClick}
    />
  );
};
