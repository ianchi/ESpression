module.exports = [
  {
    context: {},
    expr: '[a, b] = [10 ,20] , this',
    result: { a: 10, b: 20 },
  },

  {
    context: { o: {} },
    expr: '[o.a, ,b = 2 * 2] = [10 ,20] , this',
    result: { o: { a: 10 }, b: 4 },
  },
  {
    context: { o: {} },
    expr: '[o.a, ,{c, d}, ...r] = [10 ,20, {c:11, d:12}, 1, 2, 3, 4, 5, 6] , this',
    result: { o: { a: 10 }, c: 11, d: 12, r: [1, 2, 3, 4, 5, 6] },
  },
  {
    context: { o: {} },
    expr: '[o.a,{c, d}={c:11, d:12}, ...r] = [10 , , 1, 2, 3, 4, 5, 6,] , this',
    result: { o: { a: 10 }, c: 11, d: 12, r: [1, 2, 3, 4, 5, 6] },
  },
  {
    context: {},
    expr: '{a, b} ={a:11, b:12} , this',
    result: { a: 11, b: 12 },
  },
  {
    context: {},
    expr: '{a:x, b:z} ={a:11, b:12} , this',
    result: { x: 11, z: 12 },
  },
  {
    context: {},
    expr: '{a:x, b:z, c:y=100} ={a:11, b:12} , this',
    result: { x: 11, z: 12, y: 100 },
  },
  {
    context: { o: {} },
    expr: '{a:o.x, b:o.z="test"} ={a:11, b:12} , this',
    result: { o: { x: 11, z: 12 } },
  },
  {
    context: {},
    expr: '{[true && "a"]:a, "b":b="test", ...r} ={a:11, b:12, c:20, d:30, e:40} , this',
    result: { a: 11, b: 12, r: { c: 20, d: 30, e: 40 } },
  },
  {
    context: {},
    expr: '{1:a, 2:b, 3:c=30} ={1:10, 2:20} , this',
    result: { a: 10, b: 20, c: 30 },
  },
  {
    context: {},
    expr: '{a:x, b:z, c:[a,b,c,d=4]} ={a:11, b:12, c:[1,2,3]} , this',
    result: { x: 11, z: 12, a: 1, b: 2, c: 3, d: 4 },
  },
  {
    context: {},
    expr: '{a:x, b:z, c:{a,b}, d: {f,g} = {f:0,g:0}} ={a:11, b:12, c:{a:100, b:200}} , this',
    result: { x: 11, z: 12, a: 100, b: 200, f: 0, g: 0 },
  },
];
