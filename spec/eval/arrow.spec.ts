import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Arrow Function Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2, o: { a: 10, b: 20 } };
  });
  it('should return a function', () => {
    const result = evaluate('(a) => a', context);
    expect(result).toBeInstanceOf(Function);
  });

  it('should shadow global', () => {
    const result = evaluate('((a) => a)(100)', context);
    expect(result).toBe(100);
  });

  it('should not create inner variables in global', () => {
    const result = evaluate('((a) => (j=a))(100)', context);
    expect(result).toBe(100);
    expect(context.j).toBeUndefined();
  });

  it('should not create parameters variables in global', () => {
    const result = evaluate('((j) => (j))(100)', context);
    expect(result).toBe(100);
    expect(context.j).toBeUndefined();
  });

  it('should not evaluate body expression until invocation', () => {
    evaluate('(a) => b++', context);
    expect(context.b).toBe(2);
  });

  it('should allow rest parameters', () => {
    const result = evaluate('((p1, ...r) => r)(10,20,30,40)', context);
    expect(result).toEqual([20, 30, 40]);
  });

  it('should allow destructuring', () => {
    const result = evaluate('(([p1], {a} ) => [p1, a])([10,20], o)', context);
    expect(result).toEqual([10, 10]);
  });

  it('should allow default values and evaluate if null', () => {
    const result = evaluate('((x, y=a++) => y)(450)', context);
    expect(result).toBe(1);
    expect(context.a).toBe(2);
  });

  it('should not evaluate default if not undefined', () => {
    const result = evaluate('((x, y=a++) => y)(450, 350)', context);
    expect(result).toBe(350);
    expect(context.a).toBe(1);
  });

  it('should allow destructuring with default values', () => {
    const result = evaluate('(([x, y=a++]) => y)([450])', context);
    expect(result).toBe(1);
    expect(context.a).toBe(2);
  });
  it('should not evaluat destructuring default if it had value', () => {
    const result = evaluate('(([x, y=a++]) => y)([450,550])', context);
    expect(result).toBe(550);
    expect(context.a).toBe(1);
  });

  it('should allow destructuring rest and parameter rest', () => {
    const result = evaluate('(([x,...r], ...param) => [r,param])([450,1,2,3],10,20,30,)', context);
    expect(result).toEqual([
      [1, 2, 3],
      [10, 20, 30],
    ]);
  });
});
