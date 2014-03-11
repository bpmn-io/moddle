function Stack() {
  var elements = this.elements = [];

  Object.defineProperty(this, 'size', {
    get: function() { return elements.length; }
  });
}

Stack.prototype.push = function push(e) {
  this.elements.push(e);
};

Stack.prototype.top = function top() {
  return this.elements[this.elements.length - 1];
};

Stack.prototype.pop = function pop() {
  var e = this.elements.pop();
  return e;
};

module.exports = Stack;