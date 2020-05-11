import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Identifier Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { x: 10, s: 'some text', undefined: 'overriden' };
  });
  it('should return the value from the context object', () => {
    const result = evaluate('x', context);

    expect(result).toBe(context.x);
  });

  it('should return undefined from the context object', () => {
    const result = evaluate('undefined', context);

    expect(result).toBe('overriden');
  });
});
