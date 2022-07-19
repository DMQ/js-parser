class InputStream {
  constructor(input = '') {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  // 读取下一个字符
  next() {
    const ch = this.input.charAt(this.pos);
    if (ch === '\n') {
      this.line += 1;
      this.col = 1;
    } else {
      this.col += 1;
    }

    this.pos += 1;

    return ch;
  }

  // 窥探下一个字符
  peek() {
    return this.input.charAt(this.pos);
  }

  // 是否读取结束
  eof() {
    return this.peek() === '';
  }

  // 抛错
  error(msg) {
    throw new Error(`${msg} (${this.line}:${this.col})`);
  }
}


module.exports = InputStream;