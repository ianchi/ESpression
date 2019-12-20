/**
 * Copyright (c) 2018 Adrian Panella <ianchi74@outlook.com>
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export * from './baseRule';
export * from './tryBranch';
export { BinaryOperatorRule, IConfBinaryRule, IConfBinaryOp } from './operator/binary';
export { MultiOperatorRule, IConfMultipleRule } from './operator/multiple';
export { TernaryOperatorRule, IConfTernaryRule } from './operator/ternary';
export { UnaryOperatorRule, IConfUnaryRule, IConfUnaryOp } from './operator/unary';

export { IdentifierRule, IConfIdentifierRule } from './token/identifier';
export { NumberRule, IConfNumberRule } from './token/number';
export { RegexRule, IConfRegexRule } from './token/regex';
export { StringRule, IConfStringRule, IPosition, toRawPosition } from './token/string';

// needed to generate typing's' file for pure interface source
import './conf.interface';
