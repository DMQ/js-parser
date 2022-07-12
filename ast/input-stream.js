class InputStream {
  constructor(input = '') {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

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

  peek() {
    return this.input.charAt(this.pos);
  }

  eof() {
    return this.peek() === '';
  }

  error(msg) {
    throw new Error(`${msg} (${this.line}:${this.col})`);
  }
}


module.exports = InputStream;