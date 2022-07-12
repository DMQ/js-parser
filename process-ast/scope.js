/**
 * @desc 作用域，暂不考虑 let/const 声明
 */
class Scope {
  constructor(type, parent) {
    this.type = type;
    this.parent = parent;
    this.declaration = {}; // 存放作用域变量
  }

  get(name) {
    if (this.declaration[name]) {
      return this.declaration[name];
    }

    if (this.parent) {
      return this.parent.get(name);
    }

    throw new ReferenceError(`${name} is not defined`);
  }

  set(name, value) {
    const decl = this.get(name);
    if (decl) {
      decl.value = value;
    }
  }

  // 声明一个变量
  declare(name, value) {
    const decl = this.declaration[name];

    if (!decl) {
      this.declaration[name] = {
        kind: 'var',
        value: value,
      };
    }
  }
}

module.exports = Scope;