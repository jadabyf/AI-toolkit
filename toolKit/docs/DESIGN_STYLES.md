# Design Style Quality Gates

## Overview

The AI Toolkit includes a comprehensive design style library and quality gates to ensure websites maintain consistent design patterns according to established design styles.

## Supported Design Styles

The toolkit supports the following design styles:

- **Swiss/International Style** - Clean, grid-based layouts with emphasis on typography
- **Minimalism** - Extreme simplicity with focus on essential elements only
- **Brutalism** - Raw, unpolished aesthetic with intentional anti-design
- **Material Design** - Google's design system with depth and bold color
- **Flat Design** - Two-dimensional elements without shadows or gradients
- **Skeuomorphism** - Realistic design mimicking real-world objects
- **Neumorphism** - Soft UI with subtle shadows creating extruded appearance
- **Glassmorphism** - Frosted glass effect with transparency and blur
- **Bauhaus** - Geometric forms, primary colors, and functional design
- **Memphis Design** - Bold geometric patterns and playful chaos
- **Art Deco** - Luxury, symmetry, and geometric elegance
- **Organic Design** - Natural forms, flowing lines, and earth tones
- **Grid-Based Design** - Strict adherence to modular grid systems
- **Asymmetric Design** - Dynamic layouts breaking traditional symmetry

## How to Use

### 1. Specify Design Style in index.json

Add the `designStyle` field to your research project's `index.json`:

```json
{
  "siteType": "portfolio",
  "designStyle": "minimalism",
  "createdAt": "2026-02-17T10:00:00Z"
}
```

### 2. Provide Design Metrics (Optional)

You can provide actual design metrics from your website in the gate configuration or as rule parameters. The system can extract these from your pages, but providing them directly gives more accurate results:

```json
{
  "rules": {
    "design.minimalism.typography": {
      "params": {
        "fontFamilies": ["Helvetica", "Arial"],
        "fontSizes": [16, 18, 24, 32],
        "designStyle": "minimalism"
      }
    },
    "design.minimalism.spacing": {
      "params": {
        "spacingValues": [8, 16, 24, 32, 48],
        "designStyle": "minimalism"
      }
    },
    "design.minimalism.color": {
      "params": {
        "colorCount": 3,
        "designStyle": "minimalism"
      }
    },
    "design.minimalism.layout": {
      "params": {
        "hasGrid": true,
        "whitespaceRatio": 50,
        "designStyle": "minimalism"
      }
    }
  }
}
```

## Quality Gates

For each design style, the toolkit provides the following quality gates:

### 1. Typography Consistency
- Maximum number of font families
- Maximum number of font sizes
- Font size range (min/max in pixels)
- Line height range
- Preferred font families for the style

**Example Rule IDs:**
- `design.minimalism.typography`
- `design.swiss.typography`
- `design.material.typography`

### 2. Spacing Consistency
- Consistent spacing scale usage
- Base unit adherence (e.g., 8px)
- Maximum spacing variations
- Grid size compliance

**Example Rule IDs:**
- `design.minimalism.spacing`
- `design.swiss.spacing`
- `design.material.spacing`

### 3. Color Palette
- Maximum number of colors
- Primary and accent color counts
- Monochromatic restrictions (if applicable)
- Contrast ratio requirements (WCAG)

**Example Rule IDs:**
- `design.minimalism.color`
- `design.swiss.color`
- `design.material.color`

### 4. Layout Structure
- Grid system usage
- Whitespace ratio
- Symmetry requirements
- Alignment strictness

**Example Rule IDs:**
- `design.minimalism.layout`
- `design.swiss.layout`
- `design.material.layout`

### 5. Design Characteristics
- Key characteristics checklist for the style
- Informational only (always passes)

**Example Rule IDs:**
- `design.minimalism.characteristics`
- `design.swiss.characteristics`
- `design.material.characteristics`

### 6. General Design Consistency
- Overall consistency check (applies to all sites)
- Reasonable limits on fonts, spacing, and colors
- Rule ID: `design.general.consistency`

## Design Style Reference

### Minimalism Example

```json
{
  "typography": {
    "maxFontFamilies": 1,
    "maxFontSizes": 4,
    "minFontSizePx": 16,
    "maxFontSizePx": 48,
    "lineHeightRange": [1.5, 1.8],
    "preferredFonts": ["Helvetica", "Arial", "San Francisco", "Inter"]
  },
  "spacing": {
    "useConsistentScale": true,
    "baseUnit": 8,
    "scaleMultipliers": [1, 2, 3, 4, 6, 8],
    "maxSpacingVariations": 6,
    "gapConsistency": "strict"
  },
  "color": {
    "maxColors": 3,
    "contrastRatio": 7,
    "monochromaticOnly": true,
    "primaryColorCount": 1,
    "accentColorCount": 1
  },
  "layout": {
    "useGrid": true,
    "gridColumns": 6,
    "symmetry": "strict",
    "alignment": "strict",
    "whitespaceRatio": 50,
    "maxNestingDepth": 3
  }
}
```

### Swiss Style Example

```json
{
  "typography": {
    "maxFontFamilies": 2,
    "maxFontSizes": 5,
    "minFontSizePx": 14,
    "maxFontSizePx": 72,
    "preferredFonts": ["Helvetica", "Univers", "Akzidenz-Grotesk"]
  },
  "spacing": {
    "baseUnit": 8,
    "scaleMultipliers": [0.5, 1, 1.5, 2, 3, 4, 6, 8],
    "gridSize": 12,
    "gapConsistency": "strict"
  },
  "color": {
    "maxColors": 5,
    "contrastRatio": 4.5,
    "primaryColorCount": 1,
    "accentColorCount": 2
  },
  "layout": {
    "useGrid": true,
    "gridColumns": 12,
    "whitespaceRatio": 40
  }
}
```

## Extracting Design Metrics from Your Site

To get the most accurate quality gate results, you should extract the following metrics from your website:

### Font Families
Count unique font-family declarations in your CSS:
```css
/* This counts as 2 font families */
body { font-family: 'Helvetica', sans-serif; }
h1 { font-family: 'Arial', sans-serif; }
```

### Font Sizes
List all unique font-size values (in pixels):
```css
/* This counts as 4 font sizes: 16, 18, 24, 32 */
body { font-size: 16px; }
p { font-size: 18px; }
h2 { font-size: 24px; }
h1 { font-size: 32px; }
```

### Spacing Values
List all unique margin and padding values (in pixels):
```css
/* This counts as 4 spacing values: 8, 16, 24, 32 */
.card { padding: 16px; margin: 24px; }
.button { padding: 8px 16px; }
.section { margin-bottom: 32px; }
```

### Color Count
Count unique color values (excluding black/white/grays):
```css
/* This counts as 3 colors */
.primary { color: #0066cc; }
.accent { color: #ff6b35; }
.success { color: #2ecc71; }
```

## Best Practices

1. **Choose One Primary Style**: Pick the design style that best represents your website's aesthetic
2. **Maintain Consistency**: Use a consistent spacing scale (e.g., 8px base unit)
3. **Limit Variations**: Fewer font families and sizes create more cohesive designs
4. **Follow WCAG**: Ensure proper contrast ratios for accessibility
5. **Document Your Scale**: Create a design tokens file with your spacing/typography scale
6. **Test Regularly**: Run quality gates after design changes to catch inconsistencies

## Disabling Design Style Rules

If you don't want design style checking, you can disable specific rules in your gates config:

```json
{
  "rules": {
    "design.minimalism.typography": { "enabled": false },
    "design.minimalism.spacing": { "enabled": false },
    "design.general.consistency": { "enabled": true }
  }
}
```

## Internal Notes

The design style library is located at `src/quality/designStyles.ts` and contains detailed specifications for each style. This file is not exposed to end users and serves as an internal reference for the quality gate engine.
