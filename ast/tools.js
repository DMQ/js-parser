const { tokenTypes } = require('./types');

// 词法工具
const tokenTools = {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#keywords
  isKeyword(word) {
    return [
      'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'].indexOf(word) >= 0;
  },

  // 是否数字
  isNumber(ch) {
    return /[0-9]/.test(ch);
  },

  // 是否标识符开头
  isIdentifierStart(ch) {
    return /[a-zA-Z_$]/i.test(ch);
  },

  // 是否标识符
  isIdentifier(ch) {
    return this.isIdentifierStart(ch) || this.isNumber(ch);
  },

  // 是否运算符
  isOperator(ch) {
    return '+-*/%=&|<>!'.indexOf(ch) >= 0;
  },

  // 是否符号
  isPunctuator(ch) {
    return '.,;(){}[]'.indexOf(ch) >= 0;
  },

  // 是否字符串开头
  isStringStart(ch) {
    return ch === '\'' || ch === '"';
  },

  // 是否空白符
  isWhiteSpace(ch) {
      return ' \s\t\n'.indexOf(ch) >= 0;
  }
};

// ast解析器工具
const parserTools = {
  isKeyword(token, value) {
    return token && token.type === tokenTypes.keyword && (!value || token.value === value);
  },

  isOperator(token, value) {
    return token && token.type === tokenTypes.operator && (!value || token.value === value);
  },

  isIdentifier(token, value) {
    return token && token.type === tokenTypes.identifier && (!value || token.value === value);
  },

  isPunctuator(token, value) {
    return token && token.type === tokenTypes.punctuator && (!value || token.value === value);
  },

  isString(token, value) {
    return token && token.type === tokenTypes.string && (!value || token.value === value);
  },

  isNumber(token, value) {
    return token && token.type === tokenTypes.number && (!value || token.value === value);
  },
};

module.exports = {
  tokenTools,
  parserTools,
};