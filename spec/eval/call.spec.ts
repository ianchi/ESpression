/**
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Call Expression', () => {
  let context: any = {};

  describe('Normal Member Expression', () => {
    beforeEach(() => {
      context = { a: 1, b: 2, f: (a: any) => a, o: { a: 1, b: 2, f: (a: any) => a } };
    });
    it('should call an identifier', () => {
      const result = evaluate('f(10)', context);
      expect(result).toBe(10);
    });

    it('should call a member', () => {
      const result = evaluate('o.f(10)', context);
      expect(result).toBe(10);
    });

    it('should fail on undefined', () => {
      expect(() => evaluate('u(10)', context)).toThrowError();
    });

    it('should compute the parameters even when failing', () => {
      expect(() => evaluate('u(a++)', context)).toThrowError();
      expect(context.a).toBe(2);
    });
  });

  describe('Shortciruited Call Expression', () => {
    beforeEach(() => {
      context = { a: 1, b: 2, f: (a: any) => a, o: { a: 1, b: 2, f: (a: any) => a } };
    });
    it('should call an identifier', () => {
      const result = evaluate('f?.(10)', context);
      expect(result).toBe(10);
    });

    it('should call a member', () => {
      const result = evaluate('o.f?.(10)', context);
      expect(result).toBe(10);
    });

    it('should not fail on undefined', () => {
      const result = evaluate('z?.(10)', context);
      expect(result).toBeUndefined();
    });

    it('should not fail on undefined', () => {
      const result = evaluate('o.z?.(10)', context);
      expect(result).toBeUndefined();
    });

    it('should not fail on undefined upper in the chain if shortcircuited', () => {
      const result = evaluate('o?.zz?.x(10)', context);
      expect(result).toBeUndefined();
    });

    it('should not fail on undefined upper in the chain if shortcircuited & optional', () => {
      const result = evaluate('o?.zz?.x?.(10)', context);
      expect(result).toBeUndefined();
    });

    it('should not compute the parameters when nullish', () => {
      evaluate('z?.(a++)', context);
      expect(context.a).toBe(1);
    });

    it('should not compute the parameters when nullish', () => {
      evaluate('o.z?.(a++)', context);
      expect(context.a).toBe(1);
    });
  });
});
