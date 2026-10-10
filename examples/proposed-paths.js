import { checkPaths } from 'pathcase-audit';

// No files need to exist: this works on case-insensitive disks too.
const result = checkPaths(['Docs/Guide.md', 'docs/Guide.md']);
console.log(JSON.stringify(result, null, 2));
