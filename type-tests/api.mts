import { checkPaths, type CheckResult, type Collision } from 'pathcase-audit';

const readonlyPaths: readonly string[] = ['Docs/a', 'docs/b'];
const report: CheckResult = checkPaths(readonlyPaths);
checkPaths(['A', 'a'] as const);
checkPaths([]);
const flag: boolean = report.hasCollisions;
for (const collision of report.collisions) {
  const key: string = collision.key;
  const index: number = collision.componentIndex;
  const variants: string[] = collision.variants;
  const paths: string[] = collision.paths;
  const reason: string = collision.reason;
  // Reports are intentionally mutable and independent between calls.
  collision.paths.push('another/path');
}
const group: Collision = {
  key: 'a', componentIndex: 0, variants: ['A', 'a'], paths: ['A', 'a'], reason: 'example',
};
report.collisions.push(group);

// Ensure the package did not resolve to an untyped JavaScript module.
type IsAny<T> = 0 extends (1 & T) ? true : false;
const typedReturn: IsAny<ReturnType<typeof checkPaths>> = false;

// @ts-expect-error A string is not a path list.
checkPaths('Docs/a');
// @ts-expect-error Elements must be strings.
checkPaths([12]);
// @ts-expect-error Null is not a valid list.
checkPaths(null);
// @ts-expect-error Required argument is missing.
checkPaths();
// @ts-expect-error Only the root package entry is public.
import { parsePathList } from 'pathcase-audit/src/path.js';
// @ts-expect-error Filesystem scanning has not shipped yet.
import { scanDirectory } from 'pathcase-audit';
// @ts-expect-error Component index must remain numeric.
report.collisions[0]!.componentIndex = 'first';
