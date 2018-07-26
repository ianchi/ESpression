/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export class JsonPath {
  values: any[] = [];
  paths: string[][] = [];
  root: object;

  constructor(obj: JsonPath | object) {
    if (obj instanceof JsonPath) {
      this.root = obj.root;
    } else {
      this.values.push(obj);
      this.paths.push(['$']);
      this.root = obj;
    }
  }

  // array like functions

  push(value: any, path: string[]) {
    this.values.push(value);
    this.paths.push(path);
  }

  slice(start?: number | string, end?: number | string, step?: number | string, descendant?: boolean) {
    const ret = new JsonPath(this);

    if (step === 0) return ret;
    const _step = toInt(step) || 1,
      _start = toInt(start),
      _end = toInt(end);

    this.forEach((val, path, _depth) => {
      if (!Array.isArray(val)) return;

      let first: number = _start === 0 ? 0 :
        _start ?
          (_start < 0 ? val.length + _start : _start) :
          (_step > 0 ? 0 : val.length - 1);

      let last: number = _end === 0 ? 0 :
        _end ?
          (_end < 0 ? val.length + _end : _end) :
          (_step > 0 ? val.length : -1);

      for (let i = first; (_step > 0 && i < last || _step < 0 && i > last) && i < val.length && i >= 0; i += _step) {
        ret.push(val[i], path.concat(i.toString()));
      }
    }, descendant ? undefined : 0);
    return ret;
  }

  forEach(callback: (value: any, path: string[], depth: number) => void, maxDepth?: number) {
    for (let i = 0; i < this.values.length; i++) {
      if (callback) callback(this.values[i], this.paths[i], 0);
      if (maxDepth !== 0) traverse(this.values[i], this.paths[i], maxDepth, callback, 1);
    }
  }

  concat(partial: JsonPath) {
    const ret = new JsonPath(this);

    if (partial.root !== this.root) return null;

    ret.values = this.values.concat(partial.values);
    ret.paths = this.paths.concat(partial.paths);

    return ret;
  }

}

// auxiliary functions

function traverse(obj: any, root: string[], maxDepth: number | undefined, callback: (val: any, path: string[], depth: number) => void, depth: number) {

  let path: string[];

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      path = root.concat(i.toString());
      if (callback) callback(obj[i], path, depth);
      if (!maxDepth || depth < maxDepth) traverse(obj[i], path, maxDepth, callback, depth + 1);
    }

  } else if (typeof obj === 'object') {
    for (const prop in obj) {
      if (!obj.hasOwnProperty(prop)) continue;
      path = root.concat(prop);
      if (callback) callback(obj[prop], path, depth);
      if (!maxDepth || depth < maxDepth) traverse(obj[prop], path, maxDepth, callback, depth + 1);
    }
  }
}

function toInt(val: number | string | undefined): number | undefined {
  let ret: number | undefined;
  if (typeof val === 'string') {
    if (!val) {
      ret = undefined;
    } else {
      ret = parseInt(val, 10);
      if (isNaN(ret)) throw new Error('Invalid number');
    }
  } else ret = val;

  return ret;
}
