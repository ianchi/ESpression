import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Unary Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2 };
  });

  it('should return an empty string', () => {
    const result = evaluate('``', context);
    expect(result).toBe('');
  });

  it('should return a composed string', () => {
    const result = evaluate('`ab-${a}-${b}`', context);
    expect(result).toBe('ab-1-2');
  });

  it('should return a string', () => {
    const result = evaluate('`abc`', context);
    expect(result).toBe('abc');
  });
});
