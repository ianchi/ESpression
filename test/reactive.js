console.log('test')

const esspression =require( '../');
const rxjs =require( 'rxjs');
const rxop = require('rxjs/operators');

const parser = esspression.es5PathParserFactory();
const rxEval = esspression.reactiveEvalFactory();

const context = {
  a: rxjs.of(1,2,3, rxjs.asyncScheduler),
  b: 0,
  c: rxjs.of(10, 20, 30, 40,rxjs.asyncScheduler).pipe(rxop.share()) };

rxEval.eval(parser.parse('d=c*1000; a + ++b * c + d '), context)
  .subscribe(d =>
    console.log(d)
  );

