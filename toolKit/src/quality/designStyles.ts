/**
 * Design Styles Library
 * Internal reference for website design styles and their characteristics.
 * Not exposed to end users.
 */

export type DesignStyle =
  | "swiss"
  | "minimalism"
  | "brutalism"
  | "material"
  | "flat"
  | "skeuomorphism"
  | "neumorphism"
  | "glassmorphism"
  | "bauhaus"
  | "memphis"
  | "art-deco"
  | "organic"
  | "grid-based"
  | "asymmetric";

export interface TypographyRules {
  maxFontFamilies: number;
  maxFontSizes: number;
  minFontSizePx: number;
  maxFontSizePx: number;
  lineHeightRange: [number, number];
  letterSpacingRange?: [number, number];
  preferredFonts?: string[];
  fontWeightRange?: [number, number];
  headingScale?: "major-second" | "minor-third" | "major-third" | "perfect-fourth" | "golden-ratio";
}

export interface SpacingRules {
  useConsistentScale: boolean;
  baseUnit: number; // in px
  scaleMultipliers: number[];
  maxSpacingVariations: number;
  gridSize?: number;
  gapConsistency: "strict" | "moderate" | "flexible";
}

export interface ColorRules {
  maxColors: number;
  contrastRatio: number; // WCAG standard
  monochromaticOnly?: boolean;
  allowGradients?: boolean;
  primaryColorCount: number;
  accentColorCount: number;
}

export interface LayoutRules {
  useGrid: boolean;
  gridColumns?: number;
  symmetry: "strict" | "moderate" | "none";
  alignment: "strict" | "flexible";
  whitespaceRatio: number; // percentage of empty space
  maxNestingDepth?: number;
}

export interface DesignStyleDefinition {
  name: string;
  description: string;
  keywords: string[];
  typography: TypographyRules;
  spacing: SpacingRules;
  color: ColorRules;
  layout: LayoutRules;
  characteristics: string[];
}

/**
 * Complete design styles reference library
 */
export const DESIGN_STYLES: Record<DesignStyle, DesignStyleDefinition> = {
  swiss: {
    name: "Swiss/International Style",
    description: "Clean, grid-based layouts with emphasis on typography and white space",
    keywords: ["grid", "helvetica", "minimal", "clean", "asymmetric", "white space"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 5,
      minFontSizePx: 14,
      maxFontSizePx: 72,
      lineHeightRange: [1.4, 1.6],
      preferredFonts: ["Helvetica", "Univers", "Akzidenz-Grotesk", "Arial"],
      fontWeightRange: [400, 700],
      headingScale: "golden-ratio"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [0.5, 1, 1.5, 2, 3, 4, 6, 8],
      maxSpacingVariations: 8,
      gridSize: 12,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 5,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: false,
      primaryColorCount: 1,
      accentColorCount: 2
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "moderate",
      alignment: "strict",
      whitespaceRatio: 40,
      maxNestingDepth: 4
    },
    characteristics: [
      "Grid-based layouts",
      "Sans-serif typography",
      "Asymmetric balance",
      "Generous white space",
      "Objective photography",
      "Mathematical precision"
    ]
  },

  minimalism: {
    name: "Minimalism",
    description: "Extreme simplicity with focus on essential elements only",
    keywords: ["minimal", "simple", "clean", "essential", "white space", "monochrome"],
    typography: {
      maxFontFamilies: 1,
      maxFontSizes: 4,
      minFontSizePx: 16,
      maxFontSizePx: 48,
      lineHeightRange: [1.5, 1.8],
      preferredFonts: ["Helvetica", "Arial", "San Francisco", "Inter"],
      fontWeightRange: [300, 600],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 2, 3, 4, 6, 8],
      maxSpacingVariations: 6,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 3,
      contrastRatio: 7,
      monochromaticOnly: true,
      allowGradients: false,
      primaryColorCount: 1,
      accentColorCount: 1
    },
    layout: {
      useGrid: true,
      gridColumns: 6,
      symmetry: "strict",
      alignment: "strict",
      whitespaceRatio: 50,
      maxNestingDepth: 3
    },
    characteristics: [
      "Maximum simplicity",
      "Monochromatic palette",
      "Abundant negative space",
      "Minimal UI elements",
      "Single focal point",
      "Hidden navigation"
    ]
  },

  brutalism: {
    name: "Brutalism",
    description: "Raw, unpolished aesthetic with intentional anti-design elements",
    keywords: ["raw", "bold", "asymmetric", "monospace", "contrast", "unconventional"],
    typography: {
      maxFontFamilies: 3,
      maxFontSizes: 8,
      minFontSizePx: 12,
      maxFontSizePx: 120,
      lineHeightRange: [1.0, 1.4],
      preferredFonts: ["Courier", "Monaco", "Consolas", "Arial", "Impact"],
      fontWeightRange: [400, 900],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: false,
      baseUnit: 4,
      scaleMultipliers: [1, 2, 3, 5, 8, 13],
      maxSpacingVariations: 15,
      gapConsistency: "flexible"
    },
    color: {
      maxColors: 8,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: false,
      primaryColorCount: 3,
      accentColorCount: 3
    },
    layout: {
      useGrid: false,
      symmetry: "none",
      alignment: "flexible",
      whitespaceRatio: 20,
      maxNestingDepth: 6
    },
    characteristics: [
      "Raw HTML aesthetics",
      "Unstyled elements",
      "High contrast colors",
      "Asymmetric layouts",
      "Monospace fonts",
      "Intentional clashing"
    ]
  },

  material: {
    name: "Material Design",
    description: "Google's design system with depth, motion, and bold color",
    keywords: ["material", "shadows", "layers", "elevation", "bold color", "grid"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 6,
      minFontSizePx: 12,
      maxFontSizePx: 96,
      lineHeightRange: [1.4, 1.6],
      preferredFonts: ["Roboto", "Noto Sans", "Product Sans"],
      fontWeightRange: [300, 700],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12],
      maxSpacingVariations: 9,
      gridSize: 4,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 6,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: true,
      primaryColorCount: 1,
      accentColorCount: 1
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "moderate",
      alignment: "strict",
      whitespaceRatio: 35,
      maxNestingDepth: 5
    },
    characteristics: [
      "Elevation and shadows",
      "Bold, vibrant colors",
      "Responsive animations",
      "Grid-based layouts",
      "Floating action buttons",
      "Card-based UI"
    ]
  },

  flat: {
    name: "Flat Design",
    description: "Two-dimensional elements without shadows or gradients",
    keywords: ["flat", "2d", "simple", "bright", "minimal depth"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 5,
      minFontSizePx: 14,
      maxFontSizePx: 64,
      lineHeightRange: [1.4, 1.6],
      preferredFonts: ["Open Sans", "Lato", "Montserrat", "Raleway"],
      fontWeightRange: [400, 700],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 2, 3, 4, 6, 8],
      maxSpacingVariations: 6,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 6,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: false,
      primaryColorCount: 2,
      accentColorCount: 2
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "moderate",
      alignment: "strict",
      whitespaceRatio: 30,
      maxNestingDepth: 4
    },
    characteristics: [
      "No shadows or depth",
      "Bright, bold colors",
      "Simple geometric shapes",
      "Clean iconography",
      "Minimal textures",
      "Sharp edges"
    ]
  },

  skeuomorphism: {
    name: "Skeuomorphism",
    description: "Realistic design mimicking real-world objects and textures",
    keywords: ["realistic", "3d", "shadows", "textures", "depth", "glossy"],
    typography: {
      maxFontFamilies: 3,
      maxFontSizes: 6,
      minFontSizePx: 12,
      maxFontSizePx: 72,
      lineHeightRange: [1.3, 1.5],
      preferredFonts: ["Georgia", "Palatino", "Times New Roman", "Helvetica"],
      fontWeightRange: [400, 700],
      headingScale: "perfect-fourth"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [0.5, 1, 1.5, 2, 3, 4],
      maxSpacingVariations: 10,
      gapConsistency: "moderate"
    },
    color: {
      maxColors: 10,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: true,
      primaryColorCount: 3,
      accentColorCount: 3
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "moderate",
      alignment: "flexible",
      whitespaceRatio: 25,
      maxNestingDepth: 6
    },
    characteristics: [
      "Realistic textures",
      "Heavy shadows and depth",
      "Glossy surfaces",
      "3D elements",
      "Physical metaphors",
      "Rich details"
    ]
  },

  neumorphism: {
    name: "Neumorphism",
    description: "Soft UI with subtle shadows creating extruded appearance",
    keywords: ["soft", "subtle", "shadows", "extruded", "monochrome", "minimal"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 5,
      minFontSizePx: 14,
      maxFontSizePx: 56,
      lineHeightRange: [1.5, 1.7],
      preferredFonts: ["Inter", "Poppins", "Montserrat"],
      fontWeightRange: [400, 600],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 2, 3, 4, 6],
      maxSpacingVariations: 5,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 3,
      contrastRatio: 3.0,
      monochromaticOnly: true,
      allowGradients: true,
      primaryColorCount: 1,
      accentColorCount: 1
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "strict",
      alignment: "strict",
      whitespaceRatio: 40,
      maxNestingDepth: 4
    },
    characteristics: [
      "Soft shadows",
      "Monochromatic palette",
      "Extruded elements",
      "Subtle depth",
      "Rounded corners",
      "Low contrast"
    ]
  },

  glassmorphism: {
    name: "Glassmorphism",
    description: "Frosted glass effect with transparency and blur",
    keywords: ["glass", "transparent", "blur", "frosted", "layers", "vibrant"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 5,
      minFontSizePx: 14,
      maxFontSizePx: 64,
      lineHeightRange: [1.5, 1.7],
      preferredFonts: ["Inter", "SF Pro", "Helvetica Neue"],
      fontWeightRange: [400, 700],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 2, 3, 4, 6, 8],
      maxSpacingVariations: 6,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 8,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: true,
      primaryColorCount: 2,
      accentColorCount: 3
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "moderate",
      alignment: "strict",
      whitespaceRatio: 35,
      maxNestingDepth: 5
    },
    characteristics: [
      "Frosted glass effect",
      "Backdrop blur",
      "Transparency layers",
      "Vibrant backgrounds",
      "Subtle borders",
      "Floating elements"
    ]
  },

  bauhaus: {
    name: "Bauhaus",
    description: "Geometric forms, primary colors, and functional design",
    keywords: ["geometric", "primary colors", "functional", "bold", "shapes", "abstract"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 5,
      minFontSizePx: 14,
      maxFontSizePx: 96,
      lineHeightRange: [1.2, 1.4],
      preferredFonts: ["Futura", "Bauhaus", "Avant Garde", "Helvetica"],
      fontWeightRange: [400, 900],
      headingScale: "perfect-fourth"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 2, 3, 4, 6, 8, 12],
      maxSpacingVariations: 7,
      gridSize: 12,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 5,
      contrastRatio: 7,
      monochromaticOnly: false,
      allowGradients: false,
      primaryColorCount: 3,
      accentColorCount: 2
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "moderate",
      alignment: "strict",
      whitespaceRatio: 35,
      maxNestingDepth: 4
    },
    characteristics: [
      "Primary color palette (red, blue, yellow)",
      "Geometric shapes (circles, squares, triangles)",
      "Sans-serif typography",
      "Asymmetric balance",
      "Form follows function",
      "Bold, experimental layouts"
    ]
  },

  memphis: {
    name: "Memphis Design",
    description: "Bold geometric patterns, bright colors, and playful chaos",
    keywords: ["bold", "geometric", "patterns", "colorful", "playful", "chaos", "80s"],
    typography: {
      maxFontFamilies: 3,
      maxFontSizes: 7,
      minFontSizePx: 12,
      maxFontSizePx: 96,
      lineHeightRange: [1.2, 1.5],
      preferredFonts: ["Futura", "Helvetica", "Comic Sans", "Impact"],
      fontWeightRange: [400, 900],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: false,
      baseUnit: 8,
      scaleMultipliers: [0.5, 1, 2, 3, 4, 6, 8, 12],
      maxSpacingVariations: 12,
      gapConsistency: "flexible"
    },
    color: {
      maxColors: 12,
      contrastRatio: 3.0,
      monochromaticOnly: false,
      allowGradients: false,
      primaryColorCount: 4,
      accentColorCount: 4
    },
    layout: {
      useGrid: false,
      symmetry: "none",
      alignment: "flexible",
      whitespaceRatio: 15,
      maxNestingDepth: 6
    },
    characteristics: [
      "Bright, clashing colors",
      "Geometric patterns",
      "Squiggles and shapes",
      "Asymmetric composition",
      "Playful chaos",
      "Bold outlines"
    ]
  },

  "art-deco": {
    name: "Art Deco",
    description: "Luxury, symmetry, and geometric elegance from the 1920s-30s",
    keywords: ["luxury", "geometric", "symmetry", "elegant", "gold", "glamorous"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 5,
      minFontSizePx: 14,
      maxFontSizePx: 72,
      lineHeightRange: [1.3, 1.5],
      preferredFonts: ["Playfair Display", "Didot", "Bodoni", "Futura"],
      fontWeightRange: [400, 700],
      headingScale: "golden-ratio"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 2, 3, 4, 6, 8],
      maxSpacingVariations: 6,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 6,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: true,
      primaryColorCount: 2,
      accentColorCount: 2
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "strict",
      alignment: "strict",
      whitespaceRatio: 30,
      maxNestingDepth: 4
    },
    characteristics: [
      "Symmetrical layouts",
      "Geometric patterns",
      "Metallic accents (gold, silver, bronze)",
      "Luxurious color palette",
      "High contrast",
      "Elegant serif fonts"
    ]
  },

  organic: {
    name: "Organic Design",
    description: "Natural forms, flowing lines, and earth tones",
    keywords: ["natural", "flowing", "curves", "organic", "earthy", "asymmetric"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 6,
      minFontSizePx: 14,
      maxFontSizePx: 64,
      lineHeightRange: [1.5, 1.8],
      preferredFonts: ["Georgia", "Merriweather", "Lora", "Nunito"],
      fontWeightRange: [300, 600],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 1.5, 2, 3, 4, 6],
      maxSpacingVariations: 8,
      gapConsistency: "moderate"
    },
    color: {
      maxColors: 8,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: true,
      primaryColorCount: 2,
      accentColorCount: 3
    },
    layout: {
      useGrid: false,
      symmetry: "none",
      alignment: "flexible",
      whitespaceRatio: 40,
      maxNestingDepth: 5
    },
    characteristics: [
      "Curved, flowing lines",
      "Natural, earthy colors",
      "Irregular shapes",
      "Nature-inspired imagery",
      "Soft edges",
      "Asymmetric balance"
    ]
  },

  "grid-based": {
    name: "Grid-Based Design",
    description: "Strict adherence to modular grid systems",
    keywords: ["grid", "modular", "precise", "structured", "columns", "alignment"],
    typography: {
      maxFontFamilies: 2,
      maxFontSizes: 5,
      minFontSizePx: 14,
      maxFontSizePx: 64,
      lineHeightRange: [1.4, 1.6],
      preferredFonts: ["Helvetica", "Arial", "Roboto", "Inter"],
      fontWeightRange: [400, 700],
      headingScale: "major-third"
    },
    spacing: {
      useConsistentScale: true,
      baseUnit: 8,
      scaleMultipliers: [1, 2, 3, 4, 6, 8, 12],
      maxSpacingVariations: 7,
      gridSize: 12,
      gapConsistency: "strict"
    },
    color: {
      maxColors: 5,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: false,
      primaryColorCount: 2,
      accentColorCount: 2
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "strict",
      alignment: "strict",
      whitespaceRatio: 35,
      maxNestingDepth: 4
    },
    characteristics: [
      "Strict grid alignment",
      "Modular elements",
      "Mathematical precision",
      "Consistent column widths",
      "Rhythm and repetition",
      "Structured hierarchy"
    ]
  },

  asymmetric: {
    name: "Asymmetric Design",
    description: "Dynamic layouts breaking traditional symmetry",
    keywords: ["asymmetric", "dynamic", "unconventional", "creative", "balance", "tension"],
    typography: {
      maxFontFamilies: 3,
      maxFontSizes: 7,
      minFontSizePx: 12,
      maxFontSizePx: 96,
      lineHeightRange: [1.2, 1.6],
      preferredFonts: ["Helvetica", "Futura", "Garamond", "Monaco"],
      fontWeightRange: [300, 900],
      headingScale: "perfect-fourth"
    },
    spacing: {
      useConsistentScale: false,
      baseUnit: 8,
      scaleMultipliers: [0.5, 1, 1.5, 2, 3, 5, 8, 13],
      maxSpacingVariations: 10,
      gapConsistency: "moderate"
    },
    color: {
      maxColors: 8,
      contrastRatio: 4.5,
      monochromaticOnly: false,
      allowGradients: true,
      primaryColorCount: 3,
      accentColorCount: 3
    },
    layout: {
      useGrid: true,
      gridColumns: 12,
      symmetry: "none",
      alignment: "flexible",
      whitespaceRatio: 30,
      maxNestingDepth: 5
    },
    characteristics: [
      "Asymmetric balance",
      "Visual tension",
      "Unconventional layouts",
      "Dynamic composition",
      "Intentional imbalance",
      "Creative hierarchy"
    ]
  }
};

/**
 * Get design style definition by name
 */
export function getDesignStyle(style: DesignStyle): DesignStyleDefinition {
  return DESIGN_STYLES[style];
}

/**
 * Check if a value is a valid design style
 */
export function isValidDesignStyle(style: string): style is DesignStyle {
  return style in DESIGN_STYLES;
}

/**
 * Get all available design style names
 */
export function getAllDesignStyles(): DesignStyle[] {
  return Object.keys(DESIGN_STYLES) as DesignStyle[];
}
