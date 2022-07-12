/**
 * @desc 根据ast生成代码
 */

const { astTypes } = require('../ast/types');

// 访问者，定义每种节点类型的生成方式
const visitor = {
  [astTypes.Program](program) { // 程序入口
    return program.body.map((node) => generator(node)).join('');
  },

  [astTypes.Identifier](node) { // 原子类型：标识符，直接返回标识符名字
    return node.name;
  },

  [astTypes.StringLiteral](node) { // 原子类型：字符串，加一个双引号括起来
    return `"${node.value}"`;
  },

  [astTypes.NumericLiteral](node) { // 原子类型：数字，直接返回值
    return node.value;
  },

  [astTypes.VariableDeclaration](node) { // 变量声明，生成声明类型（kind)/变量名(id)，以及初始值（init）
    const { declarations } = node;

    let code = `${node.kind} ${declarations.map((declarator) => generator(declarator.id)).join(',')}`; // => var a,b

    const initValue = declarations[declarations.length - 1].init; // 如果有多个声明器，初始值是放在最后一个（生成ast的时候的规则）
    if (initValue) {
      code += ` = ${generator(initValue)}`;
    }

    return code + ';\n';
  },

  [astTypes.FunctionDeclaration](node) { // 函数声明 => function ${生成id}(${生成多个参数，逗号分隔})
    let code = `function ${generator(node.id)}(${node.params.map((p) => generator(p)).join(', ')}) `;
    return code + generator(node.body); // 块级语句递归生成函数体
  },

  [astTypes.BlockStatement](node) { // 块级语句，前后添加'{','}'，中间拼接递归生成代码
    return `{\n${node.body.map((item) => generator(item)).join('')}}\n`;
  },

  [astTypes.ExpressionStatement](node) { // 表达式语句
    return `${generator(node.expression)};\n`;
  },

  [astTypes.AssignmentExpression](node) { // 赋值表达式
    return `${generator(node.left)} = ${generator(node.right)}`;
  },

  [astTypes.CallExpression](node) { // 调用表达式
    return `${generator(node.callee)}(${node.arguments.map((arg) => generator(arg)).join(', ')})`;
  },

  [astTypes.MemberExpression](node) { // 成员表达式（暂不考虑obj['p'] 这种方式）
    return `${generator(node.object)}.${generator(node.property)}`;
  },
};


function generator(ast) {
  const gen = visitor[ast.type];

  if (gen) {
    return gen(ast); // 递归调用
  }

  throw new Error(`未找到对应的生成函数: ${ast.type}`);
};

module.exports = {
  generator,
};