import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Sequence Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 2, s: '' };
  });
  it('should evaluate all elements and return the last element', () => {
    const result = evaluate('a++, b++, 30', context);
    expect(result).toBe(30);
    expect(context.b).toBe(3);
  });

  it('should evaluate elements in order', () => {
    const result = evaluate('s+="a", s+="b", s+="c"', context);
    expect(result).toBe('abc');
  });
});
