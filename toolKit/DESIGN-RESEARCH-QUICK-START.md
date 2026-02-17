# Design Research - Quick Reference

## Install & Setup

### 1. Get OpenAI API Key
Visit: https://platform.openai.com/account/api-keys

### 2. Add to .env
```bash
# Edit toolKit/.env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 3. Run Design Research
```bash
npm run research:design "Your design query"
```

---

## Quick Examples

### By Style + Type + Industry ⭐ (Best)
```bash
npm run research:design "Swiss style e-commerce for makeup"
npm run research:design "Brutalism portfolio for furniture"
npm run research:design "Minimalist newsletter for AI tools"
npm run research:design "Glassmorphism SaaS dashboard"
npm run research:design "Art Deco fashion website"
npm run research:design "Flat design healthcare portal"
```

### By Style + Type
```bash
npm run research:design "Dark mode fintech app"
npm run research:design "Minimalist landing page"
npm run research:design "Retro portfolio website"
```

### By Style Only
```bash
npm run research:design "Cyberpunk design"
npm run research:design "Memphis style website"
```

### By Type Only
```bash
npm run research:design "SaaS website examples"
npm run research:design "Restaurant website design"
```

### By Industry Only
```bash
npm run research:design "AI tools website"
npm run research:design "Furniture e-commerce"
```

---

## Supported Styles (Pick 1)

**Minimalist** • Swiss • **Brutalism** • Art Deco • Art Nouveau  
Bauhaus • Modernism • **Flat Design** • Glassmorphism • Neumorphism  
Cyberpunk • Steampunk • **Retro** • Vintage • Maximalist  
Geometric • Organic • Skeuomorphism • Memphism • Asymmetrical  
Dark Mode • Light Mode • Playful • Colorful • **And more...**

---

## Supported Types (Pick 1)

**E-commerce** • Shop • Store  
**Portfolio** • Freelancer • Artist  
**Landing Page** • Homepage • Blog  
**Newsletter** • Magazine • Publication  
**SaaS** • App • Web App • Dashboard  
**Booking** • Restaurant • Hotel • Travel  
**Agency** • Education • Healthcare  
**And more...**

---

## Supported Industries (Pick 1)

**Makeup** • Cosmetics • Fashion • Jewelry • Beauty  
**Furniture** • Home Decor • Interior • Design • Architecture  
**AI Tools** • SaaS • Software • Productivity • Tech  
**Healthcare** • Medical • Fitness • Wellness • Nutrition  
**Food** • Restaurant • Cafe • Bakery • Delivery  
**Travel** • Tourism • Hotel • Booking • Experience  
**Education** • Learning • Bootcamp • University  
**And more...**

---

## What You Get

### Terminal Output
```
🎨 Design Research: "Your query"

   Detected Components:
   • Style: [parsed]
   • Type: [parsed]
   • Industry: [parsed]

   Optimized search: "[optimized query]"

   ✅ Quality Gates: All passing

   📝 Summary: [Design findings]

   🔗 Design Examples: N sources found
      - [Real website links with descriptions]

   📄 Saved to: docs/research/YYYY-MM-DD-slug.md
```

### Generated Markdown File
```
docs/research/2026-02-17-swiss-style-e-commerce-makeup.md

Contents:
- Title & query details
- Design summary with findings
- Real design examples with official URLs
- Quality Assurance verification
- Metadata (date, sources, searches)
```

---

## Tips & Tricks

### Get Best Results
✅ Include **all three** components (style + type + industry)  
✅ Use **exact keywords** from supported lists  
✅ Be **specific** (not generic)

### Examples
```bash
✅ Good:   "Swiss style e-commerce for makeup"
❌ Vague:  "Modern website"

✅ Good:   "Glassmorphism SaaS dashboard"
❌ Missing: "Glassmorphism"

✅ Good:   "Brutalism portfolio for furniture"
❌ Too generic: "Beautiful portfolio"
```

### If No Results
- Try with different keywords
- Use broader terms
- Add "design" or "trends"
- Check spelling

---

## Running Tests

### Verify Implementation
```bash
npx tsx tests/design-research.test.ts
```

Output: ✅ 7 test categories, 15+ tests, all passing

---

## Commands

### Design Research (NEW!)
```bash
npm run research:design "query"
```

### Generic Research
```bash
npm run research "query"
```

### Lint / Compile Check
```bash
npm run lint
```

### Run All Tests
```bash
npm run test
```

---

## What Gets Saved

**Directory:** `docs/research/`

**Filename:** `YYYY-MM-DD-slug.md`

**Example:** `2026-02-17-swiss-style-e-commerce-makeup.md`

**Contains:**
- Design findings and trends
- Real website examples with URLs
- Best practices and insights
- All sources cited with links
- Quality gate verification

---

## Features

✨ **Live Web Search** - Current 2026 design trends  
✨ **Real Examples** - Actual websites, not generic advice  
✨ **Quality Guaranteed** - All 5 quality gates verified  
✨ **Smart Parsing** - Understands design keywords  
✨ **Optimized Queries** - Better search results  
✨ **Clean Output** - Professional markdown format  

---

## Documentation

**Complete Guide:** [DESIGN-RESEARCH.md](DESIGN-RESEARCH.md)

**Implementation Details:** [DESIGN-RESEARCH-SUMMARY.md](DESIGN-RESEARCH-SUMMARY.md)

**General Research:** [RESEARCH-SETUP.md](RESEARCH-SETUP.md)

**Quality Gates:** [QUALITY-GATES.md](QUALITY-GATES.md)

---

## Start Now

```bash
# 1. Add API key to .env
# 2. Run:
npm run research:design "Swiss style e-commerce for makeup"

# 3. Check output:
cat docs/research/2026-02-17-swiss-style-e-commerce-makeup.md
```

---

**Ready? Let's research design! 🎨**

```bash
npm run research:design "Your design query here"
```
