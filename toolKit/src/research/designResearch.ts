/**
 * Design Research Module
 * Single responsibility: Transform design queries into comprehensive web research
 * 
 * Supports:
 * - Website styles (Swiss, Brutalism, Minimalism, Art Deco, etc.)
 * - Website types (e-commerce, newsletter, portfolio, landing page, etc.)
 * - Industries/niches (makeup, furniture, AI tools, SaaS, etc.)
 * 
 * Automatically constructs optimized search queries to find:
 * - Design trends and best practices
 * - Real-world examples and case studies
 * - Industry-specific design patterns
 * - Current design tools and techniques
 */

interface DesignQuery {
  style?: string;           // Design style (Swiss, Brutalism, Minimalism)
  type?: string;            // Website type (e-commerce, newsletter, portfolio)
  industry?: string;        // Industry or niche (makeup, furniture, AI tools)
  context?: string;         // Additional context or requirements
  rawQuery: string;         // Original user input
}

/**
 * Parse design-related query into components
 * 
 * Examples:
 * - "Swiss style portfolio for photographers"
 * - "Brutalism e-commerce site for furniture"
 * - "Minimalist newsletter design for AI tools"
 * 
 * @param query - User's design query
 * @returns Parsed design query components
 */
export function parseDesignQuery(query: string): DesignQuery {
  const lowerQuery = query.toLowerCase();

  // Detect design styles
  const styles = [
    "swiss", "brutalism", "minimalism", "minimalist", "art deco", "art nouveau",
    "bauhaus", "modernism", "modernist", "skeuomorphism", "flat design", "glassmorphism",
    "neumorphism", "cyberpunk", "steampunk", "retro", "vintage", "maximalist",
    "geometric", "organic", "asymmetrical", "symmetrical", "brutalist", "memphis",
    "gradient", "dark mode", "light mode", "monochrome", "colorful", "playful"
  ];

  let detectedStyle = "";
  for (const style of styles) {
    if (lowerQuery.includes(style)) {
      detectedStyle = style;
      break;
    }
  }

  // Detect website types
  const types = [
    "e-commerce", "ecommerce", "shop", "store", "landing page", "homepage",
    "portfolio", "blog", "newsletter", "saas", "app", "web app", "dashboard",
    "marketplace", "social", "booking", "reservation", "event", "conference",
    "course", "educational", "magazine", "publication", "agency", "freelancer",
    "restaurant", "hotel", "travel", "photography", "artist", "music", "video"
  ];

  let detectedType = "";
  for (const type of types) {
    if (lowerQuery.includes(type)) {
      detectedType = type;
      break;
    }
  }

  // Industry/niche keywords
  const industries = [
    "makeup", "cosmetics", "fashion", "clothing", "jewelry", "beauty",
    "furniture", "home decor", "interior", "design", "architecture",
    "ai tools", "ai", "saas", "software", "productivity", "tech",
    "healthcare", "medical", "fitness", "wellness", "yoga", "nutrition",
    "food", "restaurant", "cafe", "bakery", "grocery", "delivery",
    "travel", "tourism", "hotel", "booking", "experience",
    "education", "learning", "course", "bootcamp", "university",
    "entertainment", "gaming", "streaming", "music", "podcast",
    "sports", "fitness", "real estate", "automotive", "finance"
  ];

  let detectedIndustry = "";
  for (const industry of industries) {
    if (lowerQuery.includes(industry)) {
      detectedIndustry = industry;
      break;
    }
  }

  return {
    style: detectedStyle || undefined,
    type: detectedType || undefined,
    industry: detectedIndustry || undefined,
    rawQuery: query
  };
}

/**
 * Build an optimized search query for design research
 * Combines components to create comprehensive search that finds relevant examples
 * 
 * @param designQuery - Parsed design query components
 * @returns Optimized query string for web search
 */
export function buildDesignSearchQuery(designQuery: DesignQuery): string {
  const parts: string[] = [];

  // Primary focus: design style or type
  if (designQuery.style) {
    parts.push(`${designQuery.style} design`);
  }

  if (designQuery.type) {
    parts.push(designQuery.type);
  }

  // Secondary focus: industry
  if (designQuery.industry) {
    parts.push(designQuery.industry);
  }

  // Add design-specific keywords emphasizing RECENCY and real examples
  // These keywords prioritize current (2025-2026) implementations and real-world case studies
  // This helps web search find recent articles, trends, and active case studies
  const recencyKeywords = [
    "2026 trends",       // Current year design trends
    "2025 2026",         // Recent implementations (emphasize date range)
    "latest design",     // Most recent approaches
    "new 2025",          // New implementations from recent year
    "case studies",      // Real, verifiable implementations
    "examples",          // Actual live websites
    "showcase"           // Active portfolios and demonstrations
  ];

  // Build comprehensive query
  if (parts.length === 0) {
    return designQuery.rawQuery; // Fallback to original
  }

  const baseQuery = parts.join(" ");
  
  // Format: "style design type industry" + recency-focused keywords
  // Example: "swiss design e-commerce makeup 2026 trends latest design 2025 2026 case studies"
  // This prioritizes finding recent, real-world examples over generic knowledge
  return `${baseQuery} ${recencyKeywords.slice(0, 4).join(" ")} real examples case studies`;
}

/**
 * Build system prompt for design-focused research
 * Instructs model to find design examples, trends, and best practices
 * 
 * @param designQuery - Parsed design query
 * @returns System prompt for design research
 */
export function buildDesignSystemPrompt(designQuery: DesignQuery): string {
  const components: string[] = [];

  if (designQuery.style) {
    components.push(`Design style: ${designQuery.style}`);
  }
  if (designQuery.type) {
    components.push(`Website type: ${designQuery.type}`);
  }
  if (designQuery.industry) {
    components.push(`Industry/niche: ${designQuery.industry}`);
  }

  return `You are a design research specialist finding CURRENT design trends, real examples, and modern best practices.

${components.length > 0 ? `Your research focus:\n${components.map(c => `- ${c}`).join("\n")}` : "Based on the user's design query"}

CRITICAL REQUIREMENTS:
1. **MANDATORY WEB SEARCH**: You MUST use the web_search tool for EVERY request. Do NOT rely on your training data or general design knowledge.
2. **PRIORITIZE 2025-2026 IMPLEMENTATIONS**: Focus on modern examples and trends from 2025-2026. Include dates when available.
3. **REAL WORLD EXAMPLES**: Find actual websites, portfolios, case studies, and design showcases (not generic advice).
4. **NO MODEL KNOWLEDGE FALLBACK**: If web search doesn't find examples, explicitly say so. Do NOT use your training data as a backup.
5. **CITE EVERYTHING**: Every design example must include a specific URL from web search results.

Your task is to generate a structured Markdown document with the following sections:

1.  **Overview**: 
    - Brief explanation of the requested style and use case.
    - Example: "This document explores the application of Swiss design principles to a modern e-commerce website for makeup products."

2.  **Current Design Trends (2025-2026)**:
    - What is currently being used in real websites for this style/industry.
    - Common layouts, typography, color systems, and UI patterns.
    - Back this section with web search results.

3.  **Style-Specific Recommendations**:
    - How the requested style should be applied to the requested website type.
    - What to include and what to avoid.
    - Example: "For a Swiss style makeup e-commerce site, prioritize a grid-based layout and minimalist typography. Avoid decorative fonts."

4.  **Component Suggestions**:
    - **Layout**: Grid system, spacing, alignment.
    - **Typography**: Font pairings, hierarchy, sizing.
    - **Color Usage**: Palette recommendations, primary/accent colors.
    - **Buttons & UI Elements**: Style, interaction states, iconography.

5.  **Sources**:
    - A list of URLs returned by the web_search tool.
    - Only include URLs, no titles or snippets.

CRITICAL REQUIREMENTS:
1.  **MANDATORY WEB SEARCH**: You MUST use the web_search tool for EVERY request. Do NOT rely on your training data or general design knowledge.
2.  **PRIORITIZE 2025-2026 IMPLEMENTATIONS**: Focus on modern examples and trends from 2025-2026. Include dates when available.
3.  **REAL WORLD EXAMPLES**: Find actual websites, portfolios, case studies, and design showcases (not generic advice).
4.  **NO MODEL KNOWLEDGE FALLBACK**: If web search doesn't find examples, explicitly say so. Do NOT use your training data as a backup.
5.  **CITE EVERYTHING**: Every design example must include a specific URL from web search results.

Important:
- Search for REAL, CURRENT design examples and case studies, not generic advice.
- Include URLs to actual live websites and design portfolios.
- Mention specific design trends and implementations for 2026.
- If the ${designQuery.style || "design style"} is trending in 2025-2026, explain why with examples.
- If you find NO recent examples (2025-2026), explicitly state this.
- Provide actionable design insights backed by web search results.
- Always cite sources with URLs and dates.
- Do NOT fill gaps with your training data - if web search doesn't have it, say so.
}

/**
 * Format design research results with style
 * Transforms generic research results into design-focused output
 * 
 * @param summary - Research summary
 * @param style - Design style (if any)
 * @param type - Website type (if any)
 * @returns Formatted design summary
 */
export function formatDesignSummary(
  summary: string,
  style?: string,
  type?: string
): string {
  // If summary already has design focus, return as-is
  if (summary.toLowerCase().includes("design") || summary.toLowerCase().includes("trend")) {
    return summary;
  }

  // Otherwise, add design-focused intro if not present
  const designFocus = style || type || "web design";
  const prefixLines = [
    `## Design Focus: ${designFocus}`,
    "",
    summary
  ];

  return prefixLines.join("\n");
}

/**
 * Detect if a query is design-related
 * 
 * @param query - User query
 * @returns True if design-related
 */
export function isDesignQuery(query: string): boolean {
  const designKeywords = [
    "design", "style", "aesthetic", "interface", "ui", "ux",
    "website", "web", "layout", "typography", "color", "theme",
    "minimize", "brutalism", "swiss", "minimalist", "modern",
    "ecommerce", "portfolio", "newsletter", "landing page",
    "furniture", "makeup", "fashion", "beauty", "cosmetics",
    "saas", "app", "dashboard", "booking", "restaurant"
  ];

  return designKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

/**
 * Validate design query has minimum required information
 * 
 * @param designQuery - Parsed design query
 * @returns Object with isValid and message
 */
export function validateDesignQuery(
  designQuery: DesignQuery
): { isValid: boolean; message?: string } {
  // At least one component should be specified
  if (!designQuery.style && !designQuery.type && !designQuery.industry) {
    return {
      isValid: false,
      message: "Please specify a design style, website type, or industry"
    };
  }

  return { isValid: true };
}
