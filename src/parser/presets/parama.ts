
function toParams(node: INode, ): INode[] {
  const result : INode[];
  
  
  q
  if(node.type === COMMA_EXP) return node.expressions.map( n=>
  toParam(n))
  
  return [toParam(node)];

}

function toParam(node: INode ): INode {

   switch(node.type) {
   
   case IDENTIFIER_EXP:
     return node;
     
    case ASSIGNMENT_EXP:
      if (node.operator!=='=' || node.left.type!==IDENTIFIER_EX) throw new Err
      node.type= 'AssignmentPattern'
      return node;
    default:
      throw new Error;
      }
      }

}