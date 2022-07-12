# JS 代码解析器
> 极简版本AST代码解析器，支持的js语法有限，但模块较完整：词法分析、语法分析（生成AST)、生成代码（依赖AST)、执行代码（依赖AST）

1. 本项目供学习使用，仅实现以下AST类型，（完整的AST类型有哪些？👉 [estree](https://github.com/estree/estree)）
```javascript
{
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
```
2. 模块指引
- [TokenStream](./ast/token-stream.js)
- [AST Parser](./ast/ast-parser.js)
- [Code Generator](./process-ast/generator.js)
- [Code Excutor](./process-ast/executor.js)

3. 执行Demo
```
node ./demo.js
```