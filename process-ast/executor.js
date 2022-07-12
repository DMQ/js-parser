/**
 * @desc 根据ast执行代码
 */

 const { parserTools } = require('../ast/tools');
const { astTypes } = require('../ast/types');
const Scope = require('./scope');

 // 访问者，定义每种节点类型的执行方式
 const visitor = {
   [astTypes.Program](program, scope) { // 程序入口
     for (const node of program.body) {
      traverse(node, scope); // 递归调用
     }
   },

   [astTypes.Identifier](node, scope) { // 原子类型：标识符
    return scope.get(node.name).value; // 变量或者属性取值
   },

   [astTypes.StringLiteral](node) { // 原子类型：字符串
     return node.value;
   },

   [astTypes.NumericLiteral](node) { // 原子类型：数字
     return node.value;
   },

   [astTypes.VariableDeclaration](node, scope) { // 变量声明，当前作用域声明变量，设置初始值
     const { kind, declarations } = node;

     const initValue = declarations[declarations.length - 1].init; // 如果有多个声明器，初始值是放在最后一个（生成ast的时候的规则）

     for (const declarator of declarations) {
       const { name } = declarator.id;
       scope.declare(name, initValue ? traverse(initValue, scope) : undefined);
     }
   },

   [astTypes.FunctionDeclaration](node, scope) { // 函数声明
    const func = function(...args) {
      const newScope = new Scope('function', scope); // 函数内部作用域
      // 函数参数，声明局部作用域
      for (let i = 0; i < node.params.length; i++) {
        newScope.declare(node.params[i].name, args[i]);
      }

      return traverse(node.body, newScope); // 遍历函数体
    };
    func.name = node.id.name;

    scope.declare(node.id.name, func); // 函数声明
   },

   [astTypes.BlockStatement](node, scope) { // 块级语句，遍历递归即可
     const newScope = new Scope('block', scope);

     for (const bodyNode of node.body) {
      traverse(bodyNode, newScope);
     }
   },

   [astTypes.ExpressionStatement](node, scope) { // 表达式语句，执行相关表达式即可
     return traverse(node.expression, scope);
   },

   [astTypes.AssignmentExpression](node, scope) { // 赋值表达式
     const { left, right } = node;

     // 标识符，取出该变量
     if (left.type === astTypes.Identifier) {
       const { name } = left;
       const varVal = scope.get(name);
       varVal.value = traverse(right, scope); // 变量赋值
     } else if (left.type === astTypes.MemberExpression) {
      // 成员表达式
      const object = traverse(left.object); // 获取对象
      object[perperty] = traverse(right, scope); // 对象属性赋值
     }
   },

   [astTypes.CallExpression](node, scope) { // 调用表达式
     const func = traverse(node.callee, scope);
     const args = node.arguments.map(arg => traverse(arg, scope));

     // 对象调用（成员表达式）
     if (node.callee.type === astTypes.MemberExpression) {
       const object = traverse(node.callee.object, scope);
       return func.apply(object, args)
     } else {
       // 变量调用
       return func.apply(null, args);
     }
   },

   [astTypes.MemberExpression](node, scope) { // 成员表达式（暂不考虑obj['p'] 这种方式）
     const { object, property } = node;

     return traverse(object, scope)[property.name]; // 递归遍历object，可能是obj.a.b多层
   },
 };

// 遍历
function traverse(ast, scope) {
  const exec = visitor[ast.type];

  if (exec) {
    return exec(ast, scope); // 递归调用
  }

  throw new Error(`未找到对应的执行函数: ${ast.type}`);
}

const globalApi = {
  console,
};

// 初始执行
function executor(ast) {
  const scope = new Scope('global');

  for (const apiName of Object.keys(globalApi)) {
    scope.declare(apiName, globalApi[apiName]);
  }

  return traverse(ast, scope);
};

module.exports = {
  executor,
};