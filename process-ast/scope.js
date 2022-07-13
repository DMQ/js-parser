/**
 * @desc 原子值，解释执行js代码过程中，要实现对某个变量进行声明、赋值、取值时，需通过一个对象代理实现
 */
class AtomValue {
  constructor(kind, value) {
    this.kinde = kind;
    this.value = value;
  }

  get() {
    return this.value;
  }

  set(value) {
    this.value = value;
  }
}
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
      decl.set(value);
    }
  }

  // 声明一个变量
  declare(name, value) {
    const decl = this.declaration[name];

    if (!decl) {
      this.declaration[name] = new AtomValue('var', value);
    }
  }
}

module.exports = Scope;