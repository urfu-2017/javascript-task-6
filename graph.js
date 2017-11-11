'use strict';

class Node {
    constructor(value) {
        this.value = value;
        this.name = value.name;
        this.deep = Infinity;
        this.connected = [];
        this.visited = false;
    }

    connect(node) {
        if (!(node in this.connected)) {
            this.connected.push(node);
        }
    }
}

let compareNode = (node1, node2) => {
    if (node1.value.name === node2.value.name) {
        return 0;
    }
    if (node1.deep !== node2.deep) {
        return node1.deep > node2.deep ? 1 : -1;
    }

    return node1.value.name > node2.value.name ? 1 : -1;
};

module.exports = class {
    constructor(friends, filter) {
        this.nodes = friends.map(friend => new Node(friend));
        this.connectNodes();
        this.setDeeps(this.nodes.filter(node => node.value.best), 0);
        this.filter(node => filter.func(node.value));
    }

    connectNodes() {
        this.nodes.forEach(node => {
            node.value.friends.forEach(name => node.connect(this.nodes.find(node2 => {
                return node2.value.name === name;
            })));
        });
    }

    setDeeps(nodes, deep) {
        if (nodes.length === 0) {
            return this.filter(node => node.deep !== Infinity);
        }
        let newNodes = new Set();
        nodes.sort(compareNode).forEach(node => {
            if (!node.visited) {
                node.visited = true;
                node.deep = deep;
                node.connected.forEach(i => {
                    if (!i.visited) {
                        newNodes.add(i);
                    }
                });
            }
        });
        this.setDeeps([...newNodes], deep + 1);
    }

    filter(func) {
        this.nodes = this.nodes.filter(func).sort(compareNode);
    }

    next() {
        return this.nodes.length > 0 ? this.nodes.shift().value : null;
    }
};
