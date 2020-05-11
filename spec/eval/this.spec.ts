import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('This Expression', () => {
  const context = {};

  it('should return the context object', () => {
    const result = evaluate('this', context);

    expect(result).toBe(context);
  });
});
