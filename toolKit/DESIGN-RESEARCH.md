# Design Research Feature

## Overview

The Design Research feature enhances the Web Research Agent with specialized support for design-focused queries. It intelligently parses design-related questions about website styles, types, and industries, then performs targeted web research to find current design trends, examples, and best practices.

---

## Features

### 1. **Design Query Parsing**
Automatically detects and extracts:
- **Design Styles** (Swiss, Brutalism, Minimalism, Art Deco, Bauhaus, etc.)
- **Website Types** (Portfolio, E-commerce, Newsletter, Landing page, SaaS, Dashboard, etc.)
- **Industries/Niches** (Makeup, Furniture, Fashion, AI Tools, Finance, Healthcare, etc.)

### 2. **Intelligent Query Optimization**
Converts user queries into optimized search queries that target:
- Design examples and case studies
- Current 2026 design trends
- Best practices and guides
- Real-world portfolio examples

### 3. **Design-Focused System Prompts**
Uses specialized prompts that instruct the AI to:
- Find REAL design examples (not generic advice)
- Include URLs to actual websites and portfolios
- Cite design trends for 2026
- Provide actionable design insights

### 4. **Design Metadata**
Generated documents include:
- Detected style, type, and industry
- Optimized search query showing what was searched
- Design-specific examples and resources
- All quality gates verified

---

## Usage

### Basic Command
```bash
npm run research:design "Design style type for industry"
```

### Examples

#### By Style + Type + Industry
```bash
npm run research:design "Swiss style e-commerce for makeup"
npm run research:design "Brutalism portfolio for furniture"
npm run research:design "Minimalist newsletter for AI tools"
```

#### By Style + Type
```bash
npm run research:design "Glassmorphism SaaS dashboard"
npm run research:design "Flat design landing page"
npm run research:design "Dark mode web application"
```

#### By Style Only
```bash
npm run research:design "Art Deco website"
npm run research:design "Minimalist design"
```

#### By Type Only
```bash
npm run research:design "Fashion e-commerce website"
npm run research:design "Healthcare portal design"
```

#### By Industry Only
```bash
npm run research:design "AI tools website"
npm run research:design "Furniture shopping site"
```

---

## Supported Values

### Design Styles
- **Minimalism/Minimalist** - Clean, simple, lots of whitespace
- **Swiss** - Grid-based, geometric, sans-serif focus
- **Brutalism** - Raw, bold, heavy typography
- **Art Deco** - Geometric patterns, luxury feel
- **Art Nouveau** - Organic curves, decorative
- **Bauhaus** - Function meets form
- **Flat Design** - No shadows or depth
- **Glassmorphism** - Frosted glass effect
- **Neumorphism** - Soft, embossed appearance
- **Cyberpunk** - Bold, neon, techy
- **Steampunk** - Industrial, vintage
- **Retro** - Nostalgic, vintage-inspired
- **Maximalist** - Rich, bold, layered
- **Dark Mode** - Light text on dark
- **Light Mode** - Dark text on light
- Plus 10+ more styles supported

### Website Types
- **E-commerce** / **Shop** / **Store** - Product catalog with shopping
- **Portfolio** - Showcase of work/projects
- **Landing Page** - Single-page marketing focus
- **Newsletter** - Email-focused web presence
- **Blog** - Content-driven site
- **SaaS** / **App** / **Web App** - Software-as-a-service
- **Dashboard** - Data visualization interface
- **Booking** / **Reservation** - Appointment/reservation system
- **Marketplace** - Multi-vendor platform
- **Agency** - Service provider showcase
- **Restaurant** - Food service showcase
- Plus 15+ more types supported

### Industries/Niches
- **Makeup** / **Cosmetics** / **Beauty** - Cosmetics and beauty
- **Fashion** / **Clothing** - Fashion and apparel
- **Furniture** / **Home Decor** - Furniture and home
- **AI Tools** / **AI** / **SaaS** / **Software** - Tech/software
- **Fitness** / **Wellness** / **Healthcare** - Health industry
- **Food** / **Restaurant** / **Cafe** - Food and beverage
- **Travel** / **Tourism** / **Hotel** - Travel and tourism
- **Education** / **Learning** - Educational content
- **Real Estate** / **Automotive** / **Finance** - Other industries
- Plus 10+ more industries

---

## Output Format

### Generated Document Structure
```markdown
# Swiss style portfolio for photographers

## Summary
[Key findings about Swiss design for photography portfolios]

## Sources
- [Design Example Title](URL)
  > Description of the resource

## Quality Assurance
| Gate | Status | Details |
|------|--------|---------|
| Web Search | ✅ Pass | web_search tool was invoked |
| Source Integrity | ✅ Pass | All sources from web_search tool only |
| Reproducibility | ✅ Pass | Consistent document structure |
| Honesty | ✅ Pass | Sources disclosed |
| VS Code Workflow | ✅ Pass | Node.js TypeScript environment |

---

*Research conducted: 2/17/2026*
*Total sources: 5*
*Searches performed: 2*
```

### Saved Location
```
docs/research/YYYY-MM-DD-design-query-slug.md
```

Example: `docs/research/2026-02-17-swiss-style-e-commerce-makeup.md`

---

## How It Works

### Step 1: Parse Query
```typescript
// Input: "Swiss style e-commerce for makeup"
// Output:
{
  style: "swiss",
  type: "e-commerce",
  industry: "makeup"
}
```

### Step 2: Optimize Search
```typescript
// Optimized for web search:
// "swiss design e-commerce makeup best practices examples 2026"
```

### Step 3: Create System Prompt
The system prompt explicitly instructs the model to:
- Search for Swiss design e-commerce examples
- Find makeup industry sites
- Look for 2026 trends
- Include real URLs and portfolios

### Step 4: Execute Search
- Calls OpenAI with web_search tool
- Searches for design examples
- Extracts URLs and descriptions

### Step 5: Generate Document
- Creates Markdown with findings
- Includes design metadata
- Shows quality gates verification

---

## Integration with Main Research Tool

The design research feature *complements* the generic research tool:

| Feature | Generic Research | Design Research |
|---------|------------------|-----------------|
| Query | Any topic | Design-focused |
| Optimization | None | Parses components |
| System Prompt | General | Design-specific |
| Results | General information | Design examples |
| Metadata | Basic | Design-focused |

Both tools:
- ✅ Perform live web search
- ✅ Extract real sources only
- ✅ Enforce quality gates
- ✅ Generate Markdown documents
- ✅ Save to `docs/research/`

---

## API Integration

### Design Query Module
```typescript
import {
  parseDesignQuery,
  buildDesignSearchQuery,
  buildDesignSystemPrompt,
  validateDesignQuery,
  isDesignQuery
} from "./designResearch";

// Parse a design query
const query = parseDesignQuery("Swiss style portfolio");
// → { style: "swiss", type: "portfolio" }

// Optimize for search
const optimized = buildDesignSearchQuery(query);
// → "swiss design portfolio best practices examples 2026"

// Generate system prompt
const prompt = buildDesignSystemPrompt(query);
// → Detailed prompt for design research

// Validate query
const validation = validateDesignQuery(query);
// → { isValid: true }
```

### Design Research CLI
```typescript
import { runDesignResearch } from "./research/runDesignResearch";

await runDesignResearch(
  "Swiss style portfolio for photographers",
  apiKey
);
// Executes full design research workflow
```

---

## Examples with Expected Output

### Example 1: Swiss Style E-commerce
```bash
npm run research:design "Swiss style e-commerce for makeup"
```

**Terminal Output:**
```
🎨 Design Research: "Swiss style e-commerce for makeup"

   Detected Components:
   • Style: swiss
   • Type: e-commerce
   • Industry: makeup

   Optimized search: "swiss design e-commerce makeup best practices examples 2026"

   Using model: gpt-4o-mini

   Web Search Gate: ✅ PASS (web_search called: 2)
   Source Integrity: ✅ PASS (only from web_search tool)
   ...

🎨 DESIGN RESEARCH FINDINGS

📝 Summary:
   Swiss design emphasizes clean, minimalist layouts...
   [Shows design principles and examples]

🔗 Design Examples & Resources (5 found):
   1. Swiss Design in E-commerce
      https://www.example.com/swiss-ecommerce
   2. Makeup Brand Design Trends
      https://design.example.com/makeup-trends
   ...

📊 Metadata:
   Original query: "Swiss style e-commerce for makeup"
   Optimized query: "swiss design e-commerce makeup best practices examples 2026"
   Searches performed: 2
   Sources found: 5
```

**Generated File:** `docs/research/2026-02-17-swiss-style-e-commerce-makeup.md`

### Example 2: Brutalism Portfolio
```bash
npm run research:design "Brutalism portfolio for furniture"
```

Would generate:
- Markdown with Brutalism design principles for furniture portfolios
- Real portfolio examples
- 2026 Brutalism trends
- Furniture industry design patterns

### Example 3: Minimalist Newsletter
```bash
npm run research:design "Minimalist newsletter for AI tools"
```

Would generate:
- Minimalist newsletter design guides
- AI tool newsletter examples
- Current best practices
- Specific website examples

---

## Testing

### Run Integration Tests
```bash
npx tsx tests/design-research.test.ts
```

Tests verify:
- ✅ Query parsing for all style/type/industry combinations
- ✅ Search query optimization
- ✅ Design-specific system prompt generation
- ✅ Query validation
- ✅ Design focus detection
- ✅ Markdown generation with metadata

### Manual Testing
```bash
# Test with API key in .env
npm run research:design "Your design query"

# Review generated file
cat docs/research/YYYY-MM-DD-*.md
```

---

## Troubleshooting

### Error: "Please specify a design style, website type, or industry"
- Query doesn't contain recognized design keywords
- **Fix**: Use keywords from supported values above
- **Example**: Instead of "modern website", use "minimalist modern portfolio"

### Error: "Web search returned no results"
- Query is too specific or unsupported combination
- **Fix**: Try broader query
- **Example**: "Swiss style e-commerce" instead of "Swiss 1960s minimalist e-commerce"

### No sources found
- Web search didn't find results for this combination
- **Fix**: Check query validity with `-design examples` suffix
- **Example**: `npm run research:design "Glassmorphism website design examples"`

---

## Best Practices

### 1. Be Specific
```bash
✅ Good:   "Brutalism e-commerce for furniture"
❌ Vague:  "Beautiful website design"
```

### 2. Include Context
```bash
✅ Good:   "Glassmorphism SaaS dashboard for healthcare"
❌ Missing: "Glassmorphism dashboard"
```

### 3. Use Supported Keywords
```bash
✅ Supported:  "Swiss style portfolio"
⚠️ Unsupported: "Frabulous super modern design"
```

### 4. Design Trends
```bash
✅ Current: "Dark mode fintech 2026"
❌ Outdated: "Skeuomorphism iOS"
```

---

## See Also

- [General Research Tool](RESEARCH-SETUP.md) - For non-design queries
- [Quality Gates](QUALITY-GATES.md) - How verification works
- [Research Module](src/research/README.md) - Architecture details

---

## Summary

The Design Research feature provides a specialized interface for finding current design trends, examples, and best practices. By parsing design-specific queries and optimizing searches, it delivers targeted, relevant results for designers, developers, and design enthusiasts.

**Ready to use:**
```bash
npm run research:design "Your design query here"
```
