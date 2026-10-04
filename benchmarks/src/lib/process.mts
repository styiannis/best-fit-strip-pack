// Every measurement runs in a Node process of its own, which allocates only
// what it measures. A script starts itself again with `--child` and the
// arguments of one scenario, and reads back the single number it prints.

import { execFileSync } from 'node:child_process';

export function childArgs() {
  const at = process.argv.indexOf('--child');

  return at === -1 ? undefined : process.argv.slice(at + 1);
}

export function inChild(
  file: string,
  args: (number | string)[],
  flags: string[] = []
) {
  return Number(
    execFileSync(
      process.execPath,
      [
        ...process.execArgv,
        '--disable-warning=ExperimentalWarning',
        ...flags,
        file,
        '--child',
        ...args.map(String),
      ],
      { encoding: 'utf8' }
    )
  );
}

export function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)] as number;
}
