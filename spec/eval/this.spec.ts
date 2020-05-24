/** 
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('This Expression', () => {
  const context = {};

  it('should return the context object', () => {
    const result = evaluate('this', context);

    expect(result).toBe(context);
  });
});
