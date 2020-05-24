/** 
 * Copyright (c) 2020 Adrian Panella <ianchi74@outlook.com>
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import 'jasmine';

const evaluate: (expr: string, context: any) => any = (global as any).espression.evaluate;

class TestObject {
  param: any;
  constructor(param: any) {
    this.param = param;
  }
}
describe('New Expression', () => {
  let context: any = {};

  beforeEach(() => {
    context = { f: TestObject };
  });

  it('should create new object', () => {
    const result = evaluate('new f(123)', context);
    expect(result).toBeInstanceOf(TestObject);
    expect(result.param).toBe(123);
  });
});
