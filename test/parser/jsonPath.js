module.exports = [
  "$",
  "$.a",
  "$['a']",
  "$.a['b']",
  "$.a[(b)]",
  "$.*",
  "$[*]",
  "$.a.*",
  "$.a[*]",
  "$.a[0:10:1]",
  "$.a[-1:-10:2]",
  "$.a[:10]",
  "$.a[::2]",
  "$.a[-1:]",
  "$..a",
  "$..*",
  "$..[ \t*]",
  "$.a..b",
  "$.a..['b']",
  "$.a[ (@.length-1)]",
  "$.a[?(@.b>10)]",
  "$..a[(@.length-1)]",
  "$..a[?(@.b>10)]",

  "$.a[1,5, 8]",
  "$.a[0, (@.length-1), ?(@.b>10)]"

];
