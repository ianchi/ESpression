/**
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/* eslint-disable no-console */

import chalk from 'chalk';
import 'jasmine';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const variableDiff = require('variable-diff'); // eslint-disable-line @typescript-eslint/no-var-requires

const typeColors = {
  modified: 'yellow',
  added: 'green',
  removed: 'red',
};

const defaultOptions = {
  indent: '  ',
  newLine: '\n',
  wrap(type: 'modified' | 'added' | 'removed', text: string): any {
    return (chalk as any)[typeColors[type]](text);
  },
  color: true,
};

const failed: jasmine.CustomReporterResult[] = [];
let total = 0;
const suiteFailures: jasmine.CustomReporterResult[] = [];
export class DiffReporter implements jasmine.CustomReporter {
  jasmineStarted(): void {
    console.log('Starting tests');
  }

  specStarted(): void {
    process.stdout.write(chalk.green('.'));
  }

  specDone(result: jasmine.CustomReporterResult): void {
    total++;
    if (result.failedExpectations) failed.push(result);
  }

  suiteDone(result: jasmine.CustomReporterResult): void {
    if (result.failedExpectations) suiteFailures.push(result);
  }

  jasmineDone(run: jasmine.RunDetails): void {
    console.log('\n');

    if (run.failedExpectations)
      for (const fail of run.failedExpectations) {
        console.log(chalk.red(fail.message));
        console.log(`Trace:\n${fail.trace.message}`);
      }

    this.print(suiteFailures, true);
    const num = this.print(failed);

    console.log(`\n${total} specs, ${num} failures\n`);
  }

  print(failures: jasmine.CustomReporterResult[], stack = false): number {
    let num = 0;
    for (const result of failures)
      if (result.failedExpectations)
        for (const spec of result.failedExpectations) {
          console.log(`\n${++num}) ${result.fullName}\n`);
          if (spec.matcherName === 'toEqual' && typeof spec.expected === 'object') {
            const diff = variableDiff(spec.expected, spec.actual, defaultOptions);
            console.log('Diff:');
            console.log(diff.text);
          } else {
            console.log(`Message: \n ${chalk.red(spec.message)}\n`);
            if (stack) console.log(`\n\nStack:\n${spec.stack}`);
          }
        }
    return num;
  }
}

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new DiffReporter());
