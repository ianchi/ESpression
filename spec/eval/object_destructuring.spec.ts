import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Object Destructuring Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 10, s: 'abc', o: { a: 10, b: 20, s: 'xyz' }, q: {} };
  });

  it('should assign to variables of same name', () => {
    const result = evaluate('{a, b}= o', context);
    expect(result).toBe(context.o);
    expect(context.a).toBe(10);
    expect(context.b).toBe(20);
  });

  it('should allow to use variable of diferent name', () => {
    const result = evaluate('{a:x, b:y}= o', context);
    expect(result).toBe(context.o);
    expect(context.x).toBe(10);
    expect(context.y).toBe(20);
  });

  it('should collect rest ', () => {
    const result = evaluate('{a:x, ...r}= o', context);
    expect(result).toBe(context.o);
    expect(context.x).toBe(10);
    expect(context.r).toEqual({ b: 20, s: 'xyz' });
  });

  it('should assign default value', () => {
    const result = evaluate('{a, z=b++} = o', context);
    expect(result).toBe(context.o);
    expect(context.a).toBe(10);
    expect(context.z).toBe(10);
    expect(context.b).toBe(11);
  });

  it('should assign default value and use diferent name', () => {
    const result = evaluate('{a, z:k=b++} = o', context);
    expect(result).toBe(context.o);
    expect(context.a).toBe(10);
    expect(context.z).toBeUndefined();
    expect(context.k).toBe(10);
    expect(context.b).toBe(11);
  });

  it('should not evaluate default value if not used', () => {
    const result = evaluate('{a, s=b++} = o', context);
    expect(result).toBe(context.o);
    expect(context.a).toBe(10);
    expect(context.s).toBe('xyz');
    expect(context.b).toBe(10);
  });
});
