import { parseArgs } from 'node:util';
import { ignoredDirectories } from './scan-options.js';

/** Parse CLI arguments before starting filesystem work.
 * @param {string[]} args
 */
export function parseCliOptions(args) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      ignore: { type: 'string', multiple: true },
      'no-ignore': { type: 'boolean' },
    },
  });
  if (positionals.length > 1) throw new TypeError('Expected at most one directory.');
  if (values.ignore && values['no-ignore']) throw new TypeError('Use either --ignore or --no-ignore.');
  const ignore = values['no-ignore'] ? [] : values.ignore;
  ignoredDirectories({ ignore });
  const directory = positionals[0] ?? '.';
  if (!directory || directory.includes('\0')) throw new TypeError('Directory must be nonempty and contain no NUL.');
  return { directory, help: values.help ?? false, scanOptions: { ignore } };
}
