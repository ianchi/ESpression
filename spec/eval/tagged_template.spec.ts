/** 
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Tagged Template Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2, tag: (quasi: string[], ...expr: any[]) => ({ quasi, expr }) };
  });

  it('should call tag with quasis and expressions', () => {
    const result = evaluate('tag`quasi1${a}quasi2${b}`', context);
    expect(result).toEqual(context.tag`quasi1${context.a}quasi2${context.b}`);
  });

  it('should call tag with quasis and expressions', () => {
    const result = evaluate('tag`${a}quasi1${b}`', context);
    expect(result).toEqual(context.tag`${context.a}quasi1${context.b}`);
  });

  it('should work without expressions', () => {
    const result = evaluate('tag`quasi1`', context);
    expect(result).toEqual(context.tag`quasi1`);
  });

  it('should work without quasis', () => {
    const result = evaluate('tag`${a}`', context);
    expect(result).toEqual(context.tag`${context.a}`);
  });
});
