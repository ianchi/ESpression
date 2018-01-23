import { IPreResult, INode } from '../../parser.interface';
import { BaseRule, Parser } from '../../parser';
import { ParserContext } from '../../context';
import { OBJECT_EXP } from '../../presets/es5conf';

export type configObjectRule = {
  key: { rules?: BaseRule[][], level?: number },
  value: { rules?: BaseRule[][], level?: number }
};
export class ObjectRule extends BaseRule {

  keyParser: Parser;
  valueParser: Parser;

  constructor(public config: configObjectRule) {
    super();

    if (config.key.rules) this.keyParser = new Parser(config.key.rules);
    if (config.value.rules) this.valueParser = new Parser(config.value.rules);
  }
  pre(ctx: ParserContext): IPreResult {
    const c = this.config;

    let key: INode, value: INode, properties: INode[] = [];

    // object literal must start with '{'
    if (!ctx.tyCh('{')) return null;

    ctx.gbSp();
    while (!ctx.tyCh('}')) {
      if (ctx.eof()) ctx.err('Unterminated Object Expression');

      key = this.keyParser ? this.keyParser.parse(ctx) : ctx.handler([c.key.level, 0]);

      if (!key) ctx.err('Invalid property');
      ctx.gbSp();
      if (!ctx.tyCh(':')) ctx.err();
      ctx.gbSp();

      value = this.valueParser ? this.valueParser.parse(ctx) : ctx.handler([c.value.level, 0]);

      ctx.gbSp();
      if (ctx.gtCh() !== '}') {
        if (!ctx.tyCh(',')) ctx.err();
        ctx.gbSp();
      }

      properties.push({
        type: 'Property',
        key: key,
        value: value,

        kind: 'init',
        method: false,
        computed: false,
        shorthand: false
      });
    }

    return {
      node: {
        type: OBJECT_EXP,
        properties: properties
      }
    };

  }
}
