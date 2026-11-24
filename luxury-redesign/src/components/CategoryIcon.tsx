import React from 'react';
import { stripEmoji } from '../utils/emoji';
import { CategoryGlyph } from './LuxuryIcons';

interface CategoryIconProps {
  name?: string | null;
  className?: string;
}

/**
 * Clean vector stand-in for the emoji that used to decorate categories,
 * badges and dynamic Firestore labels. Uses the bespoke Dukan glyph set.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-3.5 h-3.5',
}) => (
  <CategoryGlyph
    name={name}
    className={className}
    strokeWidth={1.3}
    data-category-glyph={stripEmoji(name) || 'all'}
  />
);
