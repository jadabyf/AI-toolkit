# Design Styles Quick Reference

## Available Design Styles

### Minimalism (`minimalism`)
**Key Characteristics:**
- Maximum simplicity
- Monochromatic palette (max 3 colors)
- Abundant negative space (50% whitespace)
- Minimal UI elements
- Single font family
- 4 font sizes maximum

**Best For:** Portfolios, luxury brands, content-focused sites

---

### Swiss/International Style (`swiss`)
**Key Characteristics:**
- Grid-based layouts (12 columns)
- Sans-serif typography (Helvetica preferred)
- Asymmetric balance
- Generous white space (40%)
- Mathematical precision
- Max 2 font families, 5 sizes

**Best For:** Corporate sites, editorial, information design

---

### Material Design (`material`)
**Key Characteristics:**
- Elevation and shadows
- Bold, vibrant colors
- Card-based UI
- 8px grid system
- Responsive animations
- Max 6 colors

**Best For:** Web applications, Android-style sites, modern UIs

---

### Flat Design (`flat`)
**Key Characteristics:**
- No shadows or depth
- Bright, bold colors
- Simple geometric shapes
- 2D elements only
- Clean iconography
- Max 6 colors

**Best For:** Modern websites, web apps, clean interfaces

---

### Brutalism (`brutalism`)
**Key Characteristics:**
- Raw HTML aesthetics
- High contrast colors
- Asymmetric layouts
- Monospace fonts
- Intentional clashing
- 8+ colors allowed

**Best For:** Experimental sites, creative agencies, artistic portfolios

---

### Neumorphism (`neumorphism`)
**Key Characteristics:**
- Soft shadows
- Monochromatic palette (max 3 colors)
- Extruded elements
- Rounded corners
- Low contrast (3:1 minimum)
- 40% whitespace

**Best For:** Modern UIs, mobile apps, minimalist interfaces

---

### Glassmorphism (`glassmorphism`)
**Key Characteristics:**
- Frosted glass effect
- Backdrop blur
- Transparency layers
- Vibrant backgrounds
- Subtle borders
- Max 8 colors

**Best For:** Modern websites, landing pages, macOS/iOS-style sites

---

### Bauhaus (`bauhaus`)
**Key Characteristics:**
- Primary color palette (red, blue, yellow)
- Geometric shapes (circles, squares, triangles)
- Sans-serif typography
- Form follows function
- Bold layouts
- Max 5 colors

**Best For:** Creative sites, design studios, educational content

---

### Memphis Design (`memphis`)
**Key Characteristics:**
- Bright, clashing colors
- Geometric patterns
- Playful chaos
- 80s aesthetic
- Bold outlines
- Up to 12 colors

**Best For:** Creative agencies, retro sites, playful brands

---

### Art Deco (`art-deco`)
**Key Characteristics:**
- Symmetrical layouts
- Geometric patterns
- Metallic accents (gold, silver, bronze)
- Luxurious color palette
- Elegant serif fonts
- Max 6 colors

**Best For:** Luxury brands, hotels, elegant portfolios

---

### Organic Design (`organic`)
**Key Characteristics:**
- Curved, flowing lines
- Natural, earthy colors
- Irregular shapes
- Nature-inspired imagery
- Soft edges
- Max 8 colors

**Best For:** Environmental sites, wellness brands, natural products

---

### Grid-Based Design (`grid-based`)
**Key Characteristics:**
- Strict grid alignment (12 columns)
- Modular elements
- Mathematical precision
- Consistent column widths
- Structured hierarchy
- Max 5 colors

**Best For:** Editorial design, magazine layouts, structured content

---

### Asymmetric Design (`asymmetric`)
**Key Characteristics:**
- Asymmetric balance
- Visual tension
- Unconventional layouts
- Dynamic composition
- Intentional imbalance
- Max 8 colors

**Best For:** Creative portfolios, artistic sites, modern brands

---

### Skeuomorphism (`skeuomorphism`)
**Key Characteristics:**
- Realistic textures
- Heavy shadows and depth
- Glossy surfaces
- 3D elements
- Physical metaphors
- Up to 10 colors

**Best For:** Traditional apps, realistic interfaces, nostalgic designs

---

## Typography Scale Reference

### Major Second (1.125)
```
12px → 14px → 16px → 18px → 20px → 23px → 26px → 29px → 33px → 37px
```

### Minor Third (1.2)
```
12px → 14px → 17px → 20px → 24px → 29px → 35px → 42px → 50px → 60px
```

### Major Third (1.25)
```
12px → 15px → 19px → 24px → 30px → 37px → 46px → 58px → 72px → 91px
```

### Perfect Fourth (1.333)
```
12px → 16px → 21px → 28px → 37px → 50px → 66px → 88px → 118px
```

### Golden Ratio (1.618)
```
12px → 19px → 31px → 50px → 81px → 131px
```

## Spacing Scale Reference

### 4px Base Unit
```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
```

### 8px Base Unit (Most Common)
```
8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
```

## Color Contrast Ratios (WCAG)

- **AA Normal Text:** 4.5:1 minimum
- **AA Large Text:** 3:1 minimum  
- **AAA Normal Text:** 7:1 minimum
- **AAA Large Text:** 4.5:1 minimum

## Usage Example

To use a design style in your project:

1. Add to `index.json`:
   ```json
   {
     "siteType": "portfolio",
     "designStyle": "minimalism"
   }
   ```

2. Provide actual metrics (optional but recommended):
   ```json
   {
     "rules": {
       "design.minimalism.typography": {
         "params": {
           "designStyle": "minimalism",
           "fontFamilies": ["Inter"],
           "fontSizes": [16, 18, 24, 32]
         }
       }
     }
   }
   ```

3. Run quality gates to verify compliance
