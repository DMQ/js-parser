const { TokenStream } = require('./token-stream');
const { parserTools, tokenTools } = require('./tools');
const { tokenTypes, astTypes } = require('./types');

class Parser {
  constructor(tokenStream) {
    this.tokenStream = tokenStream instanceof TokenStream ? tokenStream : new TokenStream(tokenStream);
  }

  skipPunctuator(punctuator) {
    if (parserTools.isPunctuator(this.tokenStream.peek(), punctuator)) {
      this.tokenStream.next();
    } else {
      this.tokenStream.error(`异常的符号: ${punctuator}`);
    }
  }

  skipKeyword(keyword) {
    if (parserTools.isKeyword(this.tokenStream.peek(), keyword)) {
      this.tokenStream.next();
    } else {
      this.tokenStream.error(`异常的关键字: ${keyword}`);
    }
  }

  unexpected() {
    this.tokenStream(`意外的token: ${JSON.stringify(this.tokenStream.peek())}`);
  }

  parseIdentifier() {
    const token = this.tokenStream.peek();
    // TODO: 可以对token做类型判断，抛出异常
    var node = {
      type: astTypes.Identifier,
      name: token.value,
    };

    this.tokenStream.next();

    return node;
  }

  parseLiteral() {
    const token = this.tokenStream.peek();
    var node = {
      type: parserTools.isNumber(token) ? astTypes.NumericLiteral : astTypes.StringLiteral,
      value: token.value,
    };

    this.tokenStream.next();

    return node;
  }

  parseVariable() {
    const token = this.tokenStream.next(); // 拿出var

    // 变量声明
    const variableDeclaration = {
      type: astTypes.VariableDeclaration,
      declarations: [], // 可能存在多个变量声明
      kind: token.value,
    };

    // TODO: 处理前可以做一些异常处理
    // 遍历token，遇到分号结束（换行先不考虑），var a = 1; var a,b = 1;均满足
    while(!this.tokenStream.eof()) {
      const node = {
        type: astTypes.VariableDeclarator,
        id: this.parseIdentifier(), // 解析标识符'var'
        init: null, // 初始赋值，多个变量声明的情况，只有最后一个节点赋初始值（estree规范）
      };

      // 将单个变量声明节点，push进去
      variableDeclaration.declarations.push(node);

      // 1、多个变量声明的情况，跳过逗号，进入下一轮循环继续遍历其他变量
      if (parserTools.isPunctuator(this.tokenStream.peek(), ',')) {
        this.tokenStream.next();
        continue;
      }

      // 2、判断是否=号赋值
      if (parserTools.isOperator(this.tokenStream.peek(), '=')) {
        this.tokenStream.next();

        node.init = this.parseStatement(); // 初始值，可能是字面量，可能是表达式，递归调用即可
      }

      break; // 跳出循环
    }

    this.skipPunctuator(';'); // 跳过分号（非分号结尾此处会报错，暂不考虑换行）

    return variableDeclaration;
  }

  parseParams() {
    const params = [];
    this.skipPunctuator('(');

    while (!this.tokenStream.eof()) {
      // 括号闭合，结束
      if (parserTools.isPunctuator(this.tokenStream.peek(), ')')) {
        break;
      }

      // 标识符作为参数
      params.push(this.parseStatement());

      // 跳过逗号（如果有多个参数的场景）
      if (parserTools.isPunctuator(this.tokenStream.peek(), ',')) {
        this.tokenStream.next();
      }
    }

    this.skipPunctuator(')');

    return params;
  }

  parseBlock() {
    this.skipPunctuator('{');

    const node = {
      type: astTypes.BlockStatement,
      body: [],
    };

    // 遇到闭合大括号之前，循环解析语句
    while(!parserTools.isPunctuator(this.tokenStream.peek(), '}')) {
      node.body.push(this.parseStatement()); // 递归遍历即可
    }

    this.skipPunctuator('}');

    return node;
  }

  parseFunction() {
    this.skipKeyword('function');

    const node = {
      type: astTypes.FunctionDeclaration,
      id: this.parseIdentifier(),
    };

    node.params = this.parseParams();
    node.body = this.parseBlock();

    return node;
  }

  // 赋值表达式
  parseAssignExpression(left, operator) {
    return {
      type: astTypes.AssignmentExpression,
      left,
      operator,
      right: this.parseStatement(),
    };
  }

  // 表达式语句
  parseExpressionStatement(expr) {
    const node = {
      type: astTypes.ExpressionStatement,
      expression: expr,
    };
    this.skipPunctuator(';'); // 分号结尾

    return node;
  }

  parseMemberExpression(id) {
    this.skipPunctuator('.');

    const node = {
      type: astTypes.MemberExpression,
      object: id,
      property: this.parseIdentifier(),
    };

    return node;
  }

  // 解析可能存在的二元运算
  parseMaybeBinary(left) {
    const token = this.tokenStream.peek();

    // 赋值操作
    if (parserTools.isOperator(token, '=')) {
      this.tokenStream.next(); // 跳过等号

      const expr = this.parseAssignExpression(left, '=');
      return this.parseExpressionStatement(expr);
    }

    return left;
  }

  // 解析可能存在的调用
  parseMaybeCall(left) {
    // return left;
    const token = this.tokenStream.peek();

    if (parserTools.isPunctuator(token, '(')) {
      let node = {
        type: astTypes.CallExpression,
        callee: left,
        arguments: this.parseParams(),
      };

      return this.parseExpressionStatement(node);
    }

    return left;
  }

  // 解析语句
  parseStatement() {
    const token = this.tokenStream.peek();

    // 变量声明
    if (parserTools.isKeyword(token, 'var')) {
      return this.parseVariable();
    }

    // 函数声明
    if (parserTools.isKeyword(token, 'function')) {
      return this.parseFunction();
    }

    return this.parseExpression();
  }

  // 解析表达式
  parseExpression() {
    const token = this.tokenStream.peek();
    let left;

    // 变量（可能存在二元运算、函数调用）
    if (parserTools.isIdentifier(token)) {
      left = this.parseIdentifier();

      // 成员表达式，不考虑obj.a.b和obj['a']等场景
      if (parserTools.isPunctuator(this.tokenStream.peek(), '.')) {
        left = this.parseMemberExpression(left);
      }
    }

    // 字面量
    if (parserTools.isString(token) || parserTools.isNumber(token)) {
      // 字符串、数字字面量（可能存在二元运算）
      left = this.parseLiteral();
    }

    if (!left) {
      return this.tokenStream.next(); // 避免解析不完整，导致死循环，直接将token输出
    }

    return this.parseMaybeCall(this.parseMaybeBinary(left));
  }

  // 解析入口
  parse() {
    const program = {
      type: astTypes.Program,
      body: [],
    };

    // 逐步解析
    while(!this.tokenStream.eof()) {
      program.body.push(this.parseStatement());
    }

    return program;
  }
}

module.exports = Parser;