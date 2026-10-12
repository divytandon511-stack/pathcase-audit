/** One component with conflicting ASCII case spellings in a folded namespace. */
export interface Collision {
  /** Folded prefix through the conflicting component, using / separators. */
  key: string;
  /** Zero-based position of the component in the input path. */
  componentIndex: number;
  /** Sorted distinct spellings of the component. */
  variants: string[];
  /** Sorted distinct original input strings contributing to this group. */
  paths: string[];
  /** Human-readable explanation; not a machine-readable error code. */
  reason: string;
}

export interface CheckResult {
  hasCollisions: boolean;
  collisions: Collision[];
}

/**
 * Check proposed relative paths without filesystem access or input mutation.
 * Folds ASCII A–Z only. Both slash styles separate components.
 * @throws {TypeError} Invalid container or relative path; no partial result.
 */
export declare function checkPaths(paths: readonly string[]): CheckResult;

/**
 * Scan existing entries relative to a real directory (defaults to .).
 * Skips .git and node_modules directories and never intentionally follows symlinks.
 * Rejects invalid roots, unrepresentable names and filesystem errors.
 */
export interface ScanOptions {
  /** Exact case-sensitive directory basenames; replaces .git/node_modules defaults. */
  ignore?: readonly string[];
}
export declare function scanDirectory(directory?: string, options?: ScanOptions): Promise<CheckResult>;
