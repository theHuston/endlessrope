"use strict";
var F = require("./functional.js");
class DoublyLinkedNode {
  constructor(prev,x,next) { this.next = next;
    this.prev = prev;
    this.value = x;
  }
  insertAfter(x) {
    var newNode = new DoublyLinkedNode(this,x,this.next);
    this.next.prev = newNode;
    this.next = newNode;
  }
  insertBefore(x) {
    var newNode = new DoublyLinkedNode(this.prev,x,this);
    this.prev.next = newNode;
    this.prev = newNode;
  }
  removeAfter() {
    return this.next.remove();
  }
  removeBefore() {
    return this.prev.remove();
  }
  remove() {
    this.next.prev = this.prev;
    this.prev.next = this.next;
    this.next = null;
    this.prev = null;
    return this.value;
  }
}
class DoublyLinkedList {
  constructor(a) {
    this.head = new DoublyLinkedNode(null,null,null);
    this.tail = new DoublyLinkedNode(this.head,null,null);
    this.head.next = this.tail;
    this.length = 0;
    this.push_array(a||[]);
  }
  push_array(a) {
    a.forEach((e) => {
      this.push(e);
    });
  }
  unshift(x) {
    this.head.insertAfter(x);
    this.length++;

  }
  push(x) {
    this.tail.insertBefore(x);
    this.length++;
  }
  pop() {
    if(this.tail.prev !== this.head) {
      this.length--;
      return this.tail.removeBefore();
    }
    return -1;
  }
  shift() {
    if(this.head.next !== this.tail) {
      this.length--;
      return this.head.removeAfter();
    }
    return -1;
  }
  map(f) {
    var list = new this.constructor();
    this.each((x) => {
      list.unshift(f(x));
    });
    return list;
  }
  copy() {
    return this.map(x => x);
  }
  each(f) {
    return F.maybe
      (this.head.next,(node) => {
        while(node != this.tail) {
          f(node.value);
          node = node.next;
        }
      },() => false);
  }
  reduce(f,v) {
      this.each(x => v = f(x,v));
      return v;
  }
}
module.exports = {
    DoublyLinkedList:DoublyLinkedList,
    DoublyLinkedNode:DoublyLinkedNode
};
