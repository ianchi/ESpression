/** 
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Array Destructuring Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 10, s: 'abc', o: {} };
  });

  it('should assign to variables', () => {
    const result = evaluate('[a, b]= [10, 20]', context);
    expect(result).toEqual([10, 20]);
    expect(context.a).toBe(10);
    expect(context.b).toBe(20);
  });

  it('should assign to object properties', () => {
    const result = evaluate('[o.a, o.b]= [10, 20]', context);
    expect(result).toEqual([10, 20]);
    expect(context.o.a).toBe(10);
    expect(context.o.b).toBe(20);
  });

  it('should collect rest ', () => {
    const result = evaluate('[o.a, o.b, ...c]= [10, 20, 30, 40, 50]', context);
    expect(result).toEqual([10, 20, 30, 40, 50]);
    expect(context.o.a).toBe(10);
    expect(context.o.b).toBe(20);
    expect(context.c).toEqual([30, 40, 50]);
  });

  it('should allow to ignore values', () => {
    const result = evaluate('[o.a, ,c]= [10, 20, 30, 40, 50]', context);
    expect(result).toEqual([10, 20, 30, 40, 50]);
    expect(context.o.a).toBe(10);
    expect(context.c).toEqual(30);
  });

  it('should assign default value', () => {
    const result = evaluate('[a, , c=b++ ]= [10, 20]', context);
    expect(result).toEqual([10, 20]);
    expect(context.a).toBe(10);
    expect(context.c).toBe(10);
    expect(context.b).toBe(11);
  });

  it('should not evaluate default value if not used', () => {
    const result = evaluate('[a, c=b++ ]= [10, 20]', context);
    expect(result).toEqual([10, 20]);
    expect(context.a).toBe(10);
    expect(context.c).toBe(20);
    expect(context.b).toBe(10);
  });
});
