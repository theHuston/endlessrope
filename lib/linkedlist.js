"use strict";
class Node {
    constructor(d,n) {
        this.data = d;
        this.next = n;
    }
    insertAfter(d) {
        var next = new Node(d,this.next);
        this.next = next;
        return next;
    }
    removeAfter() {
        var old = this.next
        this.next = old.next;
        return old.next.data;
    }
}
class LinkedList {
    constructor(el) {
        this.head = new Node(null,null);
        this.tail = this.head.insertAfter(null)
        let current = this.head;
        el.forEach(e =>{
            current = current.insertAfter(e)
        })
    }
    get first() {return this.head.next.data}
    push() {
    }
    pop() {
    }
    shift() {
    }
    unshift() {
    }
    each() {
    }
    map() {
    }
    reduce() {
    }
}
var test = new LinkedList([1,2,3,4,5,6,7]);
console.log(test.first);
