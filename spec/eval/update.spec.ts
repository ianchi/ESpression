import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Unary Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2, f: () => 1, o: { a: 1, b: 2 } };
  });

  it('should increment the value and return the previous', () => {
    const result = evaluate('a++', context);
    expect(result).toBe(1);
    expect(context.a).toBe(2);
  });

  it('should increment the value and return the new', () => {
    const result = evaluate('++a', context);
    expect(result).toBe(2);
    expect(context.a).toBe(2);
  });
  it('should decrement the value and return the previous', () => {
    const result = evaluate('b--', context);
    expect(result).toBe(2);
    expect(context.a).toBe(1);
  });

  it('should decrement the value and return the new', () => {
    const result = evaluate('--b', context);
    expect(result).toBe(1);
    expect(context.a).toBe(1);
  });

  it('should fail on non lvalues', () => {
    expect(() => evaluate('--12', context)).toThrowError();
  });

  it('should remove property', () => {
    const result = evaluate('delete o.a', context);
    expect(result).toBeTrue();
    expect('a' in context.o).toBeFalse();
  });
});
