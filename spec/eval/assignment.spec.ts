import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Assignment Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: 1, b: 10, s: 'abc', o: {} };
  });

  describe('Basic numeric operations', () => {
    it('should return the sum of numbers', () => {
      const result = evaluate('a+=2', context);
      expect(result).toBe(3);
      expect(context.a).toBe(3);
    });

    it('should return the concatenation of string', () => {
      const result = evaluate('s+=2', context);
      expect(result).toBe('abc2');
      expect(context.s).toBe('abc2');
    });

    it('should convert non number to string', () => {
      const result = evaluate('a+=o', context);
      expect(result).toBe('1[object Object]');
    });

    it('should return the substraction of numbers', () => {
      const result = evaluate('a-=2', context);
      expect(result).toBe(-1);
      expect(context.a).toBe(-1);
    });

    it('should return the multiplication of numbers', () => {
      const result = evaluate('a*=2', context);
      expect(result).toBe(2);
      expect(context.a).toBe(2);
    });
    it('should return the division of numbers', () => {
      const result = evaluate('a/= 2', context);
      expect(result).toBe(0.5);
      expect(context.a).toBe(0.5);
    });

    it('should return the remainder of division of numbers', () => {
      const result = evaluate('b%=3', context);
      expect(result).toBe(1);
      expect(context.b).toBe(1);
    });

    it('should return the exponentiation of numbers', () => {
      const result = evaluate('b**=2', context);
      expect(result).toBe(100);
      expect(context.b).toBe(100);
    });

    it('should return the bit shift << of numbers', () => {
      const result = evaluate(' a <<= 3', context);
      expect(result).toBe(8);
      expect(context.a).toBe(8);
    });
    it('should return the bit shift >> of numbers', () => {
      const result = evaluate(' b>>= 3', context);
      expect(result).toBe(1);
      expect(context.b).toBe(1);
    });
    it('should return the bit shift >>> of numbers', () => {
      const result = evaluate(' b >>>= 3', context);
      expect(result).toBe(1);
      expect(context.b).toBe(1);
    });

    it('should return the bit OR of numbers', () => {
      const result = evaluate(' b |= 1', context);
      expect(result).toBe(11);
      expect(context.b).toBe(11);
    });

    it('should return the bit AND of numbers', () => {
      const result = evaluate(' b &= 8', context);
      expect(result).toBe(8);
      expect(context.b).toBe(8);
    });

    it('should return the bit XOR of numbers', () => {
      const result = evaluate(' b ^= 27', context);
      expect(result).toBe(17);
      expect(context.b).toBe(17);
    });
  });

  describe('Simple assignment', () => {
    it('should return the asigned value', () => {
      const result = evaluate('c=20', context);
      expect(result).toBe(20);
      expect(context.c).toBe(20);
    });

    it('should return the asigned object', () => {
      const result = evaluate('c=o', context);
      expect(result).toBe(context.o);
      expect(context.c).toBe(context.o);
    });

    it('should assign to object property', () => {
      const result = evaluate('o.c=25', context);
      expect(result).toBe(25);
      expect(context.o.c).toBe(25);
    });

    it('should assign to object computed property', () => {
      const result = evaluate('o["c"]=25', context);
      expect(result).toBe(25);
      expect(context.o.c).toBe(25);
    });
  });
});
