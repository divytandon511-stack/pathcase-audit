import { scanDirectory } from './index.js';
import { parseCliOptions } from './cli-options.js';

const help = `Usage: pathcase-audit [directory] [options]

Scan existing names for ASCII case collisions. Default directory: .

  -h, --help        Show this help
  --json            Print the API result as JSON
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

/** Wait for output completion and consume asynchronous stream errors.
 * @param {import('node:stream').Writable} stream
 * @param {string} text
 * @returns {Promise<void>}
 */
function writeOutput(stream, text) {
  return new Promise((resolve, reject) => {
    const onError = (/** @type {Error} */ error) => reject(error);
    stream.once('error', onError);
    try {
      stream.write(text, (error) => {
        if (error) { reject(error); return; }
        stream.removeListener('error', onError);
        resolve();
      });
    } catch (error) {
      stream.removeListener('error', onError);
      reject(error);
    }
  });
}

/** Run the CLI without forcing process termination or truncating output.
 * @param {string[]} args
 * @param {{ stdout: import('node:stream').Writable, stderr: import('node:stream').Writable }} [io]
 * @returns {Promise<number>}
 */
export async function runCli(args, io = process) {
  try {
    const options = parseCliOptions(args);
    if (options.help) { await writeOutput(io.stdout, help); return 0; }
    const result = await scanDirectory(options.directory, options.scanOptions);
    await writeOutput(io.stdout, options.json ? `${JSON.stringify(result)}\n` : formatReport(result));
    return result.hasCollisions ? 1 : 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try { await writeOutput(io.stderr, `pathcase-audit: ${JSON.stringify(message)}\n`); }
    catch { /* A failed diagnostic stream still means exit 2. */ }
    return 2;
  }
}
