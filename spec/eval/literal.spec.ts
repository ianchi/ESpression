import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Literal Expression', () => {
  let context = {};

  describe('Numeric literals', () => {
    beforeEach(() => {
      context = {};
    });

    it('should return number', () => {
      const result = evaluate('10', context);

      expect(result).toBe(10);
    });

    it('should return decimal number', () => {
      const result = evaluate('10.23', context);

      expect(result).toBe(10.23);
    });

    it('should return octal number', () => {
      const result = evaluate('0o10', context);

      expect(result).toBe(0o10);
    });

    it('should return hex number', () => {
      const result = evaluate('0x10AF', context);

      expect(result).toBe(0x10af);
    });

    it('should return binary number', () => {
      const result = evaluate('0b01101', context);

      expect(result).toBe(0b01101);
    });
  });

  describe('String literals', () => {
    beforeEach(() => {
      context = {};
    });

    it('should recognize single quotes', () => {
      const result = evaluate("'abc'", context);

      expect(result).toBe('abc');
    });
    it('should recognize double quotes', () => {
      const result = evaluate('"abc"', context);

      expect(result).toBe('abc');
    });

    it('should recognize unicode characters', () => {
      const result = evaluate('"😊✔"', context);

      expect(result).toBe('😊✔');
    });
    it('should recognize escapes', () => {
      const result = evaluate('"a\\n\\r\\t\\b\\f\\v\\"\\\'\\kz"', context);

      expect(result).toBe('a\n\r\t\b\f\v"\'kz');
    });

    it('should recognize line continuation', () => {
      const result = evaluate('"a\\\nbc"', context);

      expect(result).toBe('abc');
    });
    it('should recognize hex escapes', () => {
      const result = evaluate('"00\\x41\\x42\\x43\\x4400"', context);

      expect(result).toBe('00ABCD00');
    });

    it('should recognize hex escapes regardless of case', () => {
      const result = evaluate('"00\\x0a\\x0A"', context);

      expect(result).toBe('00\x0a\x0a');
    });
    it('should fail on wrong hex escapes', () => {
      expect(() => evaluate('"\\xAk"', context))
        .withContext('"\\xAk"')
        .toThrowError();
      expect(() => evaluate('"\\xA"', context))
        .withContext('"\\xA"')
        .toThrowError();
    });

    it('should fail on wrong unicode escapes', () => {
      expect(() => evaluate('"\\uA"', context))
        .withContext('"\\uA"')
        .toThrowError();
      expect(() => evaluate('"\\uAAFXX"', context))
        .withContext('"\\uAAFXX"')
        .toThrowError();
    });

    it('should fail on wrong code point escapes', () => {
      expect(() => evaluate('"\\u{qwer}"', context))
        .withContext('"\\u{qwer}"')
        .toThrowError();
      expect(() => evaluate('"\\u{}"', context))
        .withContext('"\\u{}"')
        .toThrowError();
      expect(() => evaluate('"\\u{AF08"', context))
        .withContext('"\\u{AF08"')
        .toThrowError();
    });
    it('should recognize simple Unicode escapes', () => {
      const result = evaluate('"\\u00A9  \\u2665"', context);

      expect(result).toBe('\u00A9  \u2665');
    });

    it('should recognize surrogate Unicode escapes', () => {
      const result = evaluate('"\\uD834\\uDF06"', context);

      expect(result).toBe('\uD834\uDF06');
    });

    it('should recognize Unicode code point escapes', () => {
      const result = evaluate('"\\u{1D306}"', context);

      expect(result).toBe('\u{1D306}');
    });
  });

  describe('Regex literals', () => {
    beforeEach(() => {
      context = {};
    });

    it('should be a RegExp object', () => {
      const result = evaluate('/ab[a-z]\\s*c/gimuy', context);

      expect(result).toBeInstanceOf(RegExp);

      expect(result.source).toBe('ab[a-z]\\s*c');
    });

    it('should correctly recognize all flags', () => {
      const result: RegExp = evaluate('/abc/gimyu', context);

      expect(result.global).withContext('global').toBeTruthy();
      expect(result.ignoreCase).withContext('ignoreCase').toBeTruthy();
      expect(result.multiline).withContext('multiline').toBeTruthy();
      expect(result.unicode).withContext('unicode').toBeTruthy();
      expect(result.sticky).withContext('sticky').toBeTruthy();
    });
  });

  describe('Built-in literals', () => {
    beforeEach(() => {
      context = { true: 10, false: 20, null: 30 };
    });

    it('should recognize `true` and not the context value', () => {
      const result = evaluate('true', context);

      expect(result).toBe(true);
    });

    it('should recognize `false` and not the context value', () => {
      const result = evaluate('false', context);

      expect(result).toBe(false);
    });

    it('should recognize `null` and not the context value', () => {
      const result = evaluate('null', context);

      expect(result).toBe(null);
    });
  });
});
