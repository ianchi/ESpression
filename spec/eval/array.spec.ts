import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

describe('Array Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { a: [10, 20, 30] };
  });
  it('should return empty array', () => {
    const result = evaluate('[]', context);

    expect(result).toBeInstanceOf(Array);
    expect(result).toEqual([]);
  });

  it('should return simple array', () => {
    const result = evaluate('[1, 2, 3]', context);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should return sparse array', () => {
    const result = evaluate('[1, , 3]', context);

    // eslint-disable-next-line no-sparse-arrays
    expect(result).toEqual([1, , 3]);
  });

  it('should remove trailing element array', () => {
    const result = evaluate('[1, 2 , 3,]', context);

    expect(result).toEqual([1, 2, 3]);
  });

  it('should spread array', () => {
    const result = evaluate('[1, ...a , 3,]', context);

    expect(result).toEqual([1, ...context.a, 3]);
  });

  it('should spread empty array', () => {
    const result = evaluate('[1, ...[], 3,]', context);

    expect(result).toEqual([1, ...[], 3]);
  });
  it('should spread iterator', () => {
    function* makeIterator() {
      yield 1;
      yield 2;
    }

    context.iterator = makeIterator;
    const result = evaluate('[10, ...iterator() , 30,]', context);

    expect(result).toEqual([10, ...makeIterator(), 30]);
  });

  it('should fail spreading non iterable', () => {
    expect(() => evaluate('[1, ...10 , 3,]', context)).toThrowError();
    expect(() => evaluate('[1, ...x , 3,]', context)).toThrowError();
  });
});
