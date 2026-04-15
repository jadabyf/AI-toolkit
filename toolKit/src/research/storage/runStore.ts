import fs from "fs";
import path from "path";
import { ResearchRun } from "../../core/models";
import { toSlug } from "../../utils/text";

export interface StoredRunPaths {
  runDir: string;
  runJson: string;
  reportJson: string;
  reportMd: string;
  gateJson: string;
  gateMd: string;
}

export class ResearchRunStore {
  constructor(private readonly baseDir: string = path.resolve("runs")) {}

  ensureBaseDir(): void {
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  createRunId(query: string, now: Date = new Date()): string {
    const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const slug = toSlug(query).slice(0, 40) || "research";
    return `${stamp}-${slug}`;
  }

  resolveRunDir(runId: string): string {
    return path.join(this.baseDir, runId);
  }

  initRun(runId: string): string {
    this.ensureBaseDir();
    const dir = this.resolveRunDir(runId);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  saveJson(runDir: string, filename: string, data: unknown): string {
    const filePath = path.join(runDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return filePath;
  }

  saveText(runDir: string, filename: string, text: string): string {
    const filePath = path.join(runDir, filename);
    fs.writeFileSync(filePath, text, "utf-8");
    return filePath;
  }

  saveRunArtifacts(run: ResearchRun, reportMarkdown: string, gateMarkdown: string): StoredRunPaths {
    const runDir = this.initRun(run.runId);
    const runJson = this.saveJson(runDir, "run.json", run);
    const reportJson = this.saveJson(runDir, "report.json", run.report);
    const reportMd = this.saveText(runDir, "report.md", reportMarkdown);
    const gateJson = this.saveJson(runDir, "gate.json", run.gate.report);
    const gateMd = this.saveText(runDir, "gate.md", gateMarkdown);

    return {
      runDir,
      runJson,
      reportJson,
      reportMd,
      gateJson,
      gateMd
    };
  }

  loadRun(runIdOrPath: string): ResearchRun {
    const runPath = fs.existsSync(runIdOrPath)
      ? runIdOrPath
      : path.join(this.resolveRunDir(runIdOrPath), "run.json");

    if (!fs.existsSync(runPath)) {
      throw new Error(`Run not found: ${runIdOrPath}`);
    }

    const raw = fs.readFileSync(runPath, "utf-8");
    return JSON.parse(raw) as ResearchRun;
  }
}
