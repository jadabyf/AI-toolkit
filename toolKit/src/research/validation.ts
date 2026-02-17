/**
 * Research Validation and Error Handling
 * Production-quality validation with explicit error messages
 */

import { ResearchQuery, ResearchOutput, ResearchAgentOptions } from "./types";

export class ResearchValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ResearchValidationError";
  }
}

export class InsufficientDataError extends Error {
  constructor(message: string, public sourcesFound: number, public sourcesRequired: number) {
    super(message);
    this.name = "InsufficientDataError";
  }
}

export class ResearchValidator {
  /**
   * Validate research query before sending to API
   */
  static validateQuery(query: ResearchQuery): void {
    // Validate topic
    if (!query.topic || query.topic.trim().length === 0) {
      throw new ResearchValidationError("Research topic cannot be empty", "topic");
    }

    if (query.topic.length < 3) {
      throw new ResearchValidationError("Research topic must be at least 3 characters", "topic");
    }

    if (query.topic.length > 500) {
      throw new ResearchValidationError("Research topic must be 500 characters or less", "topic");
    }

    // Validate context if provided
    if (query.context !== undefined && query.context.length > 1000) {
      throw new ResearchValidationError("Context must be 1000 characters or less", "context");
    }

    // Validate maxResults if provided
    if (query.maxResults !== undefined) {
      if (query.maxResults < 1) {
        throw new ResearchValidationError("maxResults must be at least 1", "maxResults");
      }
      if (query.maxResults > 20) {
        throw new ResearchValidationError("maxResults must be 20 or less", "maxResults");
      }
    }
  }

  /**
   * Validate API key
   */
  static validateApiKey(apiKey: string): void {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new ResearchValidationError("OpenAI API key is required", "apiKey");
    }

    if (!apiKey.startsWith("sk-")) {
      throw new ResearchValidationError("Invalid OpenAI API key format (must start with 'sk-')", "apiKey");
    }

    if (apiKey.length < 20) {
      throw new ResearchValidationError("OpenAI API key appears to be invalid (too short)", "apiKey");
    }
  }

  /**
   * Validate research agent options
   */
  static validateOptions(options: ResearchAgentOptions): void {
    // CRITICAL: Hallucination must always be false
    if (options.allowHallucination === true) {
      throw new ResearchValidationError(
        "SECURITY VIOLATION: allowHallucination must always be false",
        "allowHallucination"
      );
    }

    // CRITICAL: Sources must always be required
    if (options.requireSources === false) {
      throw new ResearchValidationError(
        "SECURITY VIOLATION: requireSources must always be true",
        "requireSources"
      );
    }

    // Validate minSourcesRequired
    if (options.minSourcesRequired < 0) {
      throw new ResearchValidationError(
        "minSourcesRequired must be 0 or greater",
        "minSourcesRequired"
      );
    }

    if (options.minSourcesRequired > 10) {
      throw new ResearchValidationError(
        "minSourcesRequired must be 10 or less",
        "minSourcesRequired"
      );
    }

    // Validate output directory
    if (!options.outputDirectory || options.outputDirectory.trim().length === 0) {
      throw new ResearchValidationError(
        "outputDirectory cannot be empty",
        "outputDirectory"
      );
    }
  }

  /**
   * Validate research output before saving
   */
  static validateOutput(output: ResearchOutput, options: ResearchAgentOptions): void {
    // Check if we have enough sources (only if requireSources is true)
    if (options.requireSources && output.allSources.length < options.minSourcesRequired) {
      throw new InsufficientDataError(
        `Insufficient sources for reliable research. Found ${output.allSources.length}, required ${options.minSourcesRequired}`,
        output.allSources.length,
        options.minSourcesRequired
      );
    }

    // Validate sections exist
    if (output.sections.length === 0) {
      throw new ResearchValidationError("Research output must contain at least one section");
    }

    // Note: We allow zero sources if requireSources is false
    // This enables graceful handling of "no sources found" scenarios

    // Validate summary exists and is not empty
    if (!output.summary || output.summary.trim().length === 0) {
      throw new ResearchValidationError("Research output must contain a summary");
    }

    // Check for error states in summary
    if (output.summary.toUpperCase().includes("RESEARCH FAILED")) {
      throw new ResearchValidationError("Research failed - see summary for details");
    }
  }

  /**
   * Validate file path for saving
   */
  static validateFilePath(filepath: string): void {
    if (!filepath || filepath.trim().length === 0) {
      throw new ResearchValidationError("File path cannot be empty", "filepath");
    }

    // Check for valid extension
    const validExtensions = [".md", ".json"];
    const hasValidExtension = validExtensions.some(ext => filepath.endsWith(ext));
    
    if (!hasValidExtension) {
      throw new ResearchValidationError(
        `File must have a valid extension: ${validExtensions.join(", ")}`,
        "filepath"
      );
    }

    // Check for path traversal attempts
    const normalizedPath = filepath.replace(/\\/g, "/");
    if (normalizedPath.includes("../") || normalizedPath.includes("..\\")) {
      throw new ResearchValidationError(
        "Path traversal not allowed in file path",
        "filepath"
      );
    }
  }

  /**
   * Sanitize topic for safe file naming
   */
  static sanitizeTopic(topic: string): string {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);
  }

  /**
   * Check if URL is valid
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate source URLs in research output
   */
  static validateSources(output: ResearchOutput): void {
    const invalidSources = output.allSources.filter(
      source => !this.isValidUrl(source.url)
    );

    if (invalidSources.length > 0) {
      throw new ResearchValidationError(
        `Found ${invalidSources.length} invalid source URL(s)`
      );
    }
  }
}

/**
 * Safe wrapper for async research operations
 */
export async function safeResearch<T>(
  operation: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ResearchValidationError || 
        error instanceof InsufficientDataError) {
      // Re-throw validation errors
      throw error;
    }

    if (error instanceof Error) {
      // Wrap other errors with context
      const wrappedError = new Error(`${errorContext}: ${error.message}`);
      wrappedError.stack = error.stack;
      throw wrappedError;
    }

    // Unknown error type
    throw new Error(`${errorContext}: ${String(error)}`);
  }
}

/**
 * Format error for user-friendly display
 */
export function formatError(error: Error): string {
  if (error instanceof ResearchValidationError) {
    return `❌ Validation Error: ${error.message}${error.field ? ` (${error.field})` : ""}`;
  }

  if (error instanceof InsufficientDataError) {
    return `⚠️ Insufficient Data: ${error.message}\n   Sources found: ${error.sourcesFound}, Required: ${error.sourcesRequired}`;
  }

  return `❌ Error: ${error.message}`;
}
