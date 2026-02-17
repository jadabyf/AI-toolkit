/**
 * Research File Manager
 * Handles saving and loading research outputs
 */

import * as fs from "fs/promises";
import * as path from "path";
import { ResearchOutput } from "./types";
import { MarkdownGenerator } from "./markdown";

export class ResearchFileManager {
  private outputDirectory: string;

  constructor(outputDirectory: string = "docs/research") {
    this.outputDirectory = outputDirectory;
  }

  /**
   * Save research output to file system
   */
  async saveResearch(
    research: ResearchOutput,
    format: "markdown" | "json" | "both" = "both"
  ): Promise<{ markdown?: string; json?: string }> {
    // Ensure output directory exists
    await this.ensureDirectoryExists();

    const savedPaths: { markdown?: string; json?: string } = {};

    // Save Markdown
    if (format === "markdown" || format === "both") {
      const markdownPath = await this.saveMarkdown(research);
      savedPaths.markdown = markdownPath;
    }

    // Save JSON
    if (format === "json" || format === "both") {
      const jsonPath = await this.saveJSON(research);
      savedPaths.json = jsonPath;
    }

    return savedPaths;
  }

  /**
   * Save research as Markdown file
   */
  private async saveMarkdown(research: ResearchOutput): Promise<string> {
    const content = MarkdownGenerator.generateDocument(research);
    const filename = MarkdownGenerator.generateFilename(research, "md");
    const filepath = path.join(this.outputDirectory, filename);

    await fs.writeFile(filepath, content, "utf-8");
    
    return filepath;
  }

  /**
   * Save research as JSON file
   */
  private async saveJSON(research: ResearchOutput): Promise<string> {
    const content = MarkdownGenerator.generateJSON(research);
    const filename = MarkdownGenerator.generateFilename(research, "json");
    const filepath = path.join(this.outputDirectory, filename);

    await fs.writeFile(filepath, content, "utf-8");
    
    return filepath;
  }

  /**
   * Load a research output from JSON file
   */
  async loadResearch(filepath: string): Promise<ResearchOutput> {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content) as ResearchOutput;
  }

  /**
   * List all saved research files
   */
  async listResearch(): Promise<{
    markdown: string[];
    json: string[];
  }> {
    await this.ensureDirectoryExists();

    const files = await fs.readdir(this.outputDirectory);
    
    return {
      markdown: files.filter(f => f.endsWith(".md")).map(f => path.join(this.outputDirectory, f)),
      json: files.filter(f => f.endsWith(".json")).map(f => path.join(this.outputDirectory, f))
    };
  }

  /**
   * Delete a research file
   */
  async deleteResearch(filepath: string): Promise<void> {
    await fs.unlink(filepath);
  }

  /**
   * Ensure the output directory exists
   */
  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.outputDirectory);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(this.outputDirectory, { recursive: true });
    }
  }

  /**
   * Get the full path to the output directory
   */
  getOutputDirectory(): string {
    return path.resolve(this.outputDirectory);
  }

  /**
   * Search for research by query text
   */
  async searchResearch(queryText: string): Promise<ResearchOutput[]> {
    const { json } = await this.listResearch();
    const results: ResearchOutput[] = [];

    for (const filepath of json) {
      try {
        const research = await this.loadResearch(filepath);
        if (research.query.toLowerCase().includes(queryText.toLowerCase())) {
          results.push(research);
        }
      } catch {
        // Skip files that can't be parsed
        continue;
      }
    }

    return results;
  }

  /**
   * Get research by ID
   */
  async getResearchById(id: string): Promise<ResearchOutput | null> {
    const { json } = await this.listResearch();

    for (const filepath of json) {
      try {
        const research = await this.loadResearch(filepath);
        if (research.id === id) {
          return research;
        }
      } catch {
        continue;
      }
    }

    return null;
  }
}
