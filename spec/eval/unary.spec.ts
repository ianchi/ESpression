/** 
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Unary Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2, f: () => 1 };
  });

  it('should negate', () => {
    const result = evaluate('!z', context);
    expect(result).toBeTrue();
  });
  it('should negate', () => {
    const result = evaluate('!a', context);
    expect(result).toBeFalse();
  });

  it('should return number', () => {
    const result = evaluate('+10', context);
    expect(result).toBe(10);
  });

  it('should return number', () => {
    const result = evaluate('+"10"', context);
    expect(result).toBe(10);
  });

  it('should return negative number', () => {
    const result = evaluate('-10', context);
    expect(result).toBe(-10);
  });

  it('should return bitwise not ', () => {
    const result = evaluate('~0xFFF', context);
    // eslint-disable-next-line no-bitwise
    expect(result).toBe(~0xfff);
  });

  it('should return undefined ', () => {
    const result = evaluate('void 0', context);
    expect(result).toBeUndefined();
  });

  it('should return typeof ', () => {
    const result = evaluate('typeof f', context);
    expect(result).toBe('function');
  });
});
