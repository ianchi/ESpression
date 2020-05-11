import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Member Expression', () => {
  let context: any = {};

  describe('Normal Member Expression', () => {
    beforeEach(() => {
      context = { a: 1, b: 2, f: () => 1, o: { a: 1, b: 2 } };
    });
    it('should return an identifier member', () => {
      const result = evaluate('o.a', context);
      expect(result).toBe(1);
    });
    it('should return a computed member', () => {
      const result = evaluate('o["b"]', context);
      expect(result).toBe(2);
    });

    it('should compute the member even when failing', () => {
      expect(() => evaluate('z[a++]', context)).toThrowError();
      expect(context.a).toBe(2);
    });
  });

  describe('Shortciruited Member Expression', () => {
    beforeEach(() => {
      context = { a: 1, b: 2, f: () => 1, o: { a: 1, b: 2 } };
    });
    it('should return an identifier member', () => {
      const result = evaluate('o?.a', context);
      expect(result).toBe(1);
    });

    it('should return a computed member', () => {
      const result = evaluate('o?.["b"]', context);
      expect(result).toBe(2);
    });

    it('should not compute the member when shortcircuiting', () => {
      const result = evaluate('z?.[a++]', context);
      expect(result).toBeUndefined();
      expect(context.a).toBe(1);
    });
  });
});
