const InputStream = require('./input-stream');
const { tokenTools: tools } = require('./tools');
const { tokenTypes } = require('./types');

class TokenStream {
  constructor(inputStream) {
    this.inputStream = inputStream instanceof InputStream ? inputStream : new InputStream(inputStream);
    this.current = null;
  }

  // 遍历inputStream
  readWhile(reader) {
    let str = '';
    while (!this.inputStream.eof() && reader(this.inputStream.peek())) {
      str += this.inputStream.next();
    }
    return str;
  }

  readString(closer) {
    this.inputStream.next(); // 跳过引号

    const value = this.readWhile((ch) => ch !== closer); // 遍历字符串直到闭合的引号
    this.inputStream.next(); // 跳过最后一个闭合的引号

    return {
      type: tokenTypes.string,
      value,
    }
  }

  readNumber() {
    return {
      type: tokenTypes.number,
      value: +this.readWhile((ch) => tools.isNumber(ch)), // 暂不考虑小数及其他进制
    };
  }

  readIdentifier() {
    const value = this.readWhile((ch) => tools.isIdentifier(ch));

    return {
      type: tools.isKeyword(value) ? tokenTypes.keyword : tokenTypes.identifier,
      value,
    };
  }

  // 读取token
  readNextToken() {
    this.readWhile((ch) => tools.isWhiteSpace(ch)); // 移除空白符

    // 字符串读取完，返回
    if (this.inputStream.eof()) return null;

    const ch = this.inputStream.peek();

    if (tools.isStringStart(ch)) return this.readString(ch);
    if (tools.isNumber(ch)) return this.readNumber();
    if (tools.isIdentifierStart(ch)) return this.readIdentifier();
    if (tools.isPunctuator(ch)) return { type: tokenTypes.punctuator, value: this.inputStream.next() };
    if (tools.isOperator(ch)) return { type: tokenTypes.operator, value: this.inputStream.next() };

    this.inputStream.error(`无法处理字符: ${ch}`);
  }

  // 窥探下一个token
  peek() {
    if (!this.current) {
      this.current = this.readNextToken();
    }

    return this.current;
  }

  // 读取下一个token，改变游标（如果有peek窥探过下一个token，直接返回）
  next() {
    const token = this.current;
    this.current = null;
    return token || this.readNextToken();
  }

  eof() {
    return this.peek() === null;
  }

  error(msg) {
    return this.inputStream.error(msg);
  }
}

module.exports = {
  TokenStream,
  tokenTypes,
};