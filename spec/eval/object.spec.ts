import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Object Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { x: 10, s: 'property', o: { a: 1, b: 2 } };
  });

  it('should return an object', () => {
    const result = evaluate('{}', context);

    expect(result).toBeInstanceOf(Object);
  });

  it('should recognize identifier properties', () => {
    const result = evaluate('{a: 1, b:2}', context);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should recognize string properties', () => {
    const result = evaluate('{"- a": 1, "@b":2}', context);

    expect(result).toEqual({ '- a': 1, '@b': 2 });
  });

  it('should recognize number properties', () => {
    const result = evaluate('{1: 1, 2:2, 0xF:16}', context);

    expect(result).toEqual({ 1: 1, 2: 2, 0xf: 16 });
  });

  it('should recognize computed properties', () => {
    const result = evaluate('{[s]:2}', context);

    expect(result).toEqual({ property: 2 });
  });

  it('should allow trailling comma', () => {
    const result = evaluate('{a: 1, b:2,}', context);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should allow spread and clone object', () => {
    const result = evaluate('{...o}', context);

    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).not.toBe(context.o);
  });

  it('should allow spread and overwrite properties', () => {
    const result = evaluate('{...o, a:100}', context);

    expect(result).toEqual({ a: 100, b: 2 });
  });

  it('should allow spread and overwrite properties', () => {
    const result = evaluate('{ a:100, ...o}', context);

    expect(result).toEqual({ a: 1, b: 2 });
  });
});
