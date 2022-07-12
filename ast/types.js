const tokenTypes = {
  string: 'String', // 字符串
  number: 'Number', // 数字
  identifier: 'Identifier', // 标识符
  keyword: 'Keyword', // 关键词
  operator: 'Operator', // 操作符
  punctuator: 'Punctuator', // 符号
};

const astTypes = {
  Program: 'Program', // 程序
  VariableDeclaration: 'VariableDeclaration', // 变量声明，可包含多个 VariableDeclarator，如：var a,b;
  VariableDeclarator: 'VariableDeclarator', // 变量声明器
  FunctionDeclaration: 'FunctionDeclaration', // 函数声明
  Identifier: 'Identifier', // 标识符
  NumericLiteral: 'NumericLiteral', // 数字字面量
  StringLiteral: 'StringLiteral', // 字符串字面量
  BlockStatement: 'BlockStatement', // 块级语句
  ExpressionStatement: 'ExpressionStatement', // 表达式语句
  AssignmentExpression: 'AssignmentExpression', // 赋值表达式
  CallExpression: 'CallExpression', // 函数调用表达式
  MemberExpression: 'MemberExpression', // 成员表达式，如：obj.a
};

const scopeTypes = {
  function: 'Function',
  block: 'Block',
  // switch: 'Switch',
  // loop: 'Loop',
};

module.exports = {
  tokenTypes,
  astTypes,
};