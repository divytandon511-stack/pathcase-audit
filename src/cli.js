import { scanDirectory } from './index.js';
import { parseCliOptions } from './cli-options.js';

const help = `Usage: pathcase-audit [directory] [options]

Scan existing names for ASCII case collisions. Default directory: .

  -h, --help        Show this help
  --ignore NAME     Replace default ignores; repeat for multiple names
  --no-ignore       Include all directories
  --                End options (for a directory beginning with -)

Defaults: ignore .git and node_modules directories; never follow symlinks.
Exit codes: 0 clean/help, 1 collisions, 2 invalid arguments or scan failure.
`;

/** Render a report with quoted names so control characters remain visible.
 * @param {import('./index.d.ts').CheckResult} result
 */
export function formatReport(result) {
  if (!result.hasCollisions) return 'No ASCII case collisions found.\n';
  const lines = [`Found ${result.collisions.length} ASCII case collision group(s).`];
  for (const collision of result.collisions) {
    lines.push('', `Component ${collision.componentIndex + 1} at ${JSON.stringify(collision.key)}`,
      `  Variants: ${collision.variants.map((value) => JSON.stringify(value)).join(', ')}`,
      `  Reason: ${collision.reason}`, '  Paths:');
    for (const path of collision.paths) lines.push(`    ${JSON.stringify(path)}`);
  }
  return `${lines.join('\n')}\n`;
}

/** Run the CLI without forcing process termination or truncating output.
 * @param {string[]} args
 * @returns {Promise<number>}
 */
export async function runCli(args) {
  try {
    const options = parseCliOptions(args);
    if (options.help) { process.stdout.write(help); return 0; }
    const result = await scanDirectory(options.directory, options.scanOptions);
    process.stdout.write(formatReport(result));
    return result.hasCollisions ? 1 : 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`pathcase-audit: ${JSON.stringify(message)}\n`);
    return 2;
  }
}
