export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  file?: string;
  entityId?: string;
  path?: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  filesScanned: number;
  entitiesParsed: number;
  issues: ValidationIssue[];
  countsByType: Record<string, number>;
}

export class ContentValidationError extends Error {
  constructor(public readonly report: ValidationReport) {
    super(
      `Content validation failed with ${String(
        report.issues.filter((issue) => issue.severity === "error").length
      )} error(s)`
    );
    this.name = "ContentValidationError";
  }
}
