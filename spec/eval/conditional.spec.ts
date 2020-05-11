import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Ternary Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2, f: () => 1, o: { a: 1, b: 2 } };
  });
  it('should return the true branch without evaluating the false', () => {
    const result = evaluate(' true ? 10 : a++', context);
    expect(result).toBe(10);
    expect(context.a).toBe(1);
  });

  it('should return the false branch without evaluating the true', () => {
    const result = evaluate(' false ? a++ : 20', context);
    expect(result).toBe(20);
    expect(context.a).toBe(1);
  });
});
