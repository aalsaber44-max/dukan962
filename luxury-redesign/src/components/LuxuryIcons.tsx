import React from 'react';
import { getCategoryFamily, type CategoryFamily } from '../utils/categoryFamily';

/**
 * Bespoke fine-line icon set for the Dukan 962 flagship storefront.
 * Drawn on a 24px grid with architectural strokes (1.25–1.4px) so the chrome
 * reads as a custom brand rather than a template icon pack.
 */

type GlyphProps = React.SVGProps<SVGSVGElement>;

interface GlyphShellProps extends GlyphProps {
  strokeWidth?: string | number;
}

const Glyph: React.FC<GlyphShellProps> = ({
  strokeWidth = 1.35,
  className = 'w-4 h-4',
  children,
  ...rest
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="miter"
    className={className}
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {children}
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   CHROME — navigation & commerce
   ═══════════════════════════════════════════════════════════ */

/** Boutique facade: arch entrance under a slim lintel. */
export const AtelierHomeIcon: React.FC<GlyphProps> = (props) => (
  <Glyph {...props}>
    <path d="M3.6 20.4h16.8" />
    <path d="M6.4 20.4V11.6a5.6 5.6 0 0 1 11.2 0v8.8" />
    <path d="M10.1 20.4v-4.1a1.9 1.9 0 0 1 3.8 0v4.1" />
  </Glyph>
);

/** Sleek minimalist delivery van. */
export const DeliveryIcon: React.FC<GlyphProps> = (props) => (
  <Glyph {...props}>
    <path d="M2.9 16.6V7.4h9.35v9.2" />
    <path d="M12.25 11.5h4.15l3.35 3v2.1h-7.5" />
    <path d="M12.25 11.5v4.1" />
    <circle cx="6.4" cy="16.6" r="1.55" />
    <circle cx="16.55" cy="16.6" r="1.55" />
    <path d="M7.95 16.6h7.05" />
  </Glyph>
);

/** Boutique shopping bag with a fine handle. */
export const BoutiqueBagIcon: React.FC<GlyphProps> = (props) => (
  <Glyph {...props}>
    <path d="M5.35 8.55h13.3l-1.05 11.1H6.4L5.35 8.55Z" />
    <path d="M9.15 8.55V6.9a2.85 2.85 0 0 1 5.7 0v1.65" />
    <path d="M12 12.6v3.4" />
  </Glyph>
);

/* ═══════════════════════════════════════════════════════════
   ATELIER — custom perfume / bespoke fragrance
   ═══════════════════════════════════════════════════════════ */

/** Fine-line flacon: faceted cabochon cap, slim neck, straight body. */
export const PerfumeFlaconIcon: React.FC<GlyphProps> = (props) => (
  <Glyph {...props}>
    <path d="M10.55 2.9h2.9v2.15h-2.9z" />
    <path d="M11.15 5.05v1.55M12.85 5.05v1.55" />
    <path d="M8.95 9.9c0-1.5 1.05-2.55 2.2-2.55h1.7c1.15 0 2.2 1.05 2.2 2.55v8.85a2.25 2.25 0 0 1-2.25 2.25h-1.6A2.25 2.25 0 0 1 8.95 18.75V9.9Z" />
    <path d="M12 12.35v5" strokeOpacity="0.55" />
    <path d="M10.35 12.35v5" strokeOpacity="0.28" />
  </Glyph>
);

/* ═══════════════════════════════════════════════════════════
   CATEGORY GLYPHS
   ═══════════════════════════════════════════════════════════ */

const FAMILY_PATHS: Record<CategoryFamily, React.ReactNode> = {
  furniture: (
    <>
      <path d="M5.6 11.9h12.8v5.5H5.6z" />
      <path d="M7.55 11.9V8.5a1.6 1.6 0 0 1 1.6-1.6h5.7a1.6 1.6 0 0 1 1.6 1.6v3.4" />
      <path d="M7.1 17.4v2.1M16.9 17.4v2.1" />
      <path d="M9.9 14.65h4.2" strokeOpacity="0.45" />
    </>
  ),
  perfume: (
    <>
      <path d="M10.7 3h2.6v1.95h-2.6z" />
      <path d="M9.2 9.75c0-1.35.95-2.3 2-2.3h1.6c1.05 0 2 .95 2 2.3v9a2.1 2.1 0 0 1-2.1 2.1h-1.4a2.1 2.1 0 0 1-2.1-2.1v-9Z" />
      <path d="M12 12.1v4.7" strokeOpacity="0.5" />
    </>
  ),
  shoes: (
    <>
      <path d="M3.4 16.6h16.6" />
      <path d="M3.9 16.45 5 12.6l4.3-1.35 2.85-2.5h3.15l2.6 3.1 3.5 1.15v3.45H3.9Z" />
      <path d="M9.3 11.25 10 13.4" strokeOpacity="0.4" />
    </>
  ),
  lighting: (
    <>
      <path d="M12 3.1v3.6" />
      <path d="M8.35 12.6 12 6.7l3.65 5.9H8.35Z" />
      <path d="M10.55 15.6v1.1M12 16.5v1.5M13.45 15.6v1.1" strokeOpacity="0.55" />
    </>
  ),
  rug: (
    <>
      <path d="M3.6 6.6h16.8v10.8H3.6z" />
      <path d="M6.6 6.6v10.8M17.4 6.6v10.8" strokeOpacity="0.45" />
      <path d="M9.4 13.1c1.7-2.6 3.2 1.4 5.2-1.4" strokeOpacity="0.55" />
    </>
  ),
  watch: (
    <>
      <circle cx="12" cy="12" r="4.15" />
      <path d="M9.55 8.15 10.05 3.5h3.9l.5 4.65M9.55 15.85 10.05 20.5h3.9l.5-4.65" />
      <path d="M12 9.9v2.4l1.65 1.05" />
    </>
  ),
  tech: (
    <>
      <path d="M7.9 3.4h8.2v17.2H7.9z" />
      <path d="M10.85 5.55h2.3" strokeOpacity="0.55" />
      <path d="M12 18.1v.1" />
    </>
  ),
  kitchen: (
    <>
      <path d="M4.4 10.4h15.2v4.2a4.2 4.2 0 0 1-4.2 4.2H8.6a4.2 4.2 0 0 1-4.2-4.2v-4.2Z" />
      <path d="M4.4 11.9H2.6M19.6 11.9h1.8" />
      <path d="M12 7.4v-2.6" />
    </>
  ),
  decor: (
    <>
      <path d="M9.1 8.2h5.8l-.85 6.4a2.1 2.1 0 0 1-2.05 1.85 2.1 2.1 0 0 1-2.05-1.85L9.1 8.2Z" />
      <path d="M12 8.2V4.1" />
      <path d="M12 6.1c1.5-.15 2.5-1.05 2.6-2.5-1.55-.1-2.5.85-2.6 2.5Z" />
    </>
  ),
  ramadan: (
    <>
      <path d="M9.2 6.3a2.8 2.8 0 0 1 5.6 0" />
      <path d="M8.3 6.3h7.4l1.15 9.35H7.15L8.3 6.3Z" />
      <path d="M9.8 17.4h4.4" />
      <path d="M7.35 20.2h9.3" strokeOpacity="0.5" />
      <path d="M12 9.7v3.4" strokeOpacity="0.45" />
    </>
  ),
  all: (
    <>
      <path d="M4.4 4.4h6v6h-6zM13.6 4.4h6v6h-6zM4.4 13.6h6v6h-6zM13.6 13.6h6v6h-6z" />
    </>
  ),
};

interface CategoryGlyphProps extends Omit<GlyphProps, 'name' | 'strokeWidth'> {
  name?: string | null;
  strokeWidth?: string | number;
}

/** Bespoke vector stand-in for category emoji and template category icons. */
export const CategoryGlyph: React.FC<CategoryGlyphProps> = ({
  name,
  strokeWidth = 1.3,
  ...rest
}) => (
  <Glyph strokeWidth={strokeWidth} {...rest}>
    {FAMILY_PATHS[getCategoryFamily(name)]}
  </Glyph>
);
