import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Logical Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2 };
  });
  it('should compare AND', () => {
    const result = evaluate('4 && 5', context);
    expect(result).toBe(5);
  });

  it('should compare AND', () => {
    const result = evaluate('0 && 5', context);
    expect(result).toBe(0);
  });

  it('should shortcircuit AND', () => {
    const result = evaluate('"" && a++', context);
    expect(result).toBe('');
    expect(context.a).toBe(1);
  });
  it('should compare OR', () => {
    const result = evaluate('4 || 5', context);
    expect(result).toBe(4);
  });

  it('should compare OR', () => {
    const result = evaluate('0 || ++a', context);
    expect(result).toBe(2);
  });

  it('should shortcircuit OR', () => {
    const result = evaluate('24 || a++', context);
    expect(result).toBe(24);
    expect(context.a).toBe(1);
  });

  it('should coalesce nullish', () => {
    const result = evaluate('zz ?? 5', context);
    expect(result).toBe(5);
  });

  it('should shortcircuit on non nullish', () => {
    const result = evaluate('b  ?? a++', context);
    expect(result).toBe(2);
    expect(context.a).toBe(1);
  });

  it('should not coalesce non-nullish', () => {
    const result = evaluate('10 ?? 5', context);
    expect(result).toBe(10);
  });
});
