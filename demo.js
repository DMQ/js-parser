const InputStream = require('./ast/input-stream');
const Parser = require('./ast/ast-parser');
const { TokenStream } = require('./ast/token-stream');
const { generator } = require('./process-ast/generator');
const { executor } = require('./process-ast/executor');

const code = `
  var a,b = 1;
  function changeA(num) {
    var b = 'b';
    a = num;
  }
  changeA(2);
  console.log(a, b);
`;

const inputStream = new InputStream(code);
const tokenStream = new TokenStream(inputStream);

// while(inputStream.peek()) {
//   console.log(inputStream.next());
// }

// while(tokenStream.peek()) {
//   console.log(tokenStream.next());
// }

const parser = new Parser(tokenStream);
const ast = parser.parse();

console.log('【AST】:\n\n', JSON.stringify(ast));
console.log('\n【根据AST生成代码】:\n');
console.log('```\n',generator(ast), '\n```')
console.log('\n【根据AST执行代码】:');
executor(ast);
