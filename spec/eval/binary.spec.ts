import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Binary Expression', () => {
  let context: any = {};

  describe('Basic numeric operations', () => {
    it('should return the sum of numbers', () => {
      const result = evaluate('2 + 2', context);
      expect(result).toBe(4);
    });

    it('should return the substraction of numbers', () => {
      const result = evaluate('5 - 2', context);
      expect(result).toBe(3);
    });

    it('should return the multiplication of numbers', () => {
      const result = evaluate('5 * 2', context);
      expect(result).toBe(10);
    });
    it('should return the division of numbers', () => {
      const result = evaluate('6 / 2', context);
      expect(result).toBe(3);
    });

    it('should return the remainder of division of numbers', () => {
      const result = evaluate('5 % 2', context);
      expect(result).toBe(1);
    });

    it('should return the exponentiation of numbers', () => {
      const result = evaluate('5 ** 2', context);
      expect(result).toBe(25);
    });

    it('should return the bit shift << of numbers', () => {
      const result = evaluate(' 1 << 3', context);
      expect(result).toBe(8);
    });
    it('should return the bit shift >> of numbers', () => {
      const result = evaluate(' 10 >> 3', context);
      expect(result).toBe(1);
    });
    it('should return the bit shift >>> of numbers', () => {
      const result = evaluate(' 10 >>> 3', context);
      expect(result).toBe(1);
    });

    it('should return the bit OR of numbers', () => {
      const result = evaluate(' 2 | 1', context);
      expect(result).toBe(3);
    });

    it('should return the bit AND of numbers', () => {
      const result = evaluate(' 25 & 11', context);
      expect(result).toBe(9);
    });

    it('should return the bit XOR of numbers', () => {
      const result = evaluate(' 25 ^ 11', context);
      expect(result).toBe(18);
    });
  });

  describe('Basic comparison operations', () => {
    it('should compare the strict greater', () => {
      const result = evaluate('4 > 2', context);
      expect(result).toBeTrue();
    });
    it('should compare the strict smaller', () => {
      const result = evaluate('4 < 4', context);
      expect(result).toBeFalse();
    });

    it('should compare the greater', () => {
      const result = evaluate('4 >= 2', context);
      expect(result).toBeTrue();
    });
    it('should compare the strict smaller', () => {
      const result = evaluate('4 <= 4', context);
      expect(result).toBeTrue();
    });
  });

  describe('Basic equality comparisons', () => {
    it('should compare to equal', () => {
      const result = evaluate('4 == 2', context);
      expect(result).toBeFalse();
    });

    it('should compare loose equal', () => {
      const result = evaluate('0 == ""', context);
      expect(result).toBeTrue();
    });

    it('should compare with conversion', () => {
      const result = evaluate('1 == "1"', context);
      expect(result).toBeTrue();
    });

    it('should compare to not equal', () => {
      const result = evaluate('4 != 2', context);
      expect(result).toBeTrue();
    });

    it('should compare to identity', () => {
      const result = evaluate('0 === "0"', context);
      expect(result).toBeFalse();
    });

    it('should compare to not equal identity', () => {
      const result = evaluate('0 !== "0"', context);
      expect(result).toBeTrue();
    });
  });

  describe('Other binary operators', () => {
    beforeAll(() => {
      context = { f: () => 0, r: /a/, RegExp, o: { a: 1, b: 2 } };
    });
    it('should compare the instanceof', () => {
      const result = evaluate('r instanceof RegExp', context);
      expect(result).toBeTrue();
    });

    it('should check if property exist', () => {
      const result = evaluate('"a" in o', context);
      expect(result).toBeTrue();
    });

    it('should check if property exist', () => {
      const result = evaluate('"z" in o', context);
      expect(result).toBeFalse();
    });

    it('should fail "in" on non objects', () => {
      expect(() => evaluate('"z" in 4', context)).toThrowError();
    });
  });
});
