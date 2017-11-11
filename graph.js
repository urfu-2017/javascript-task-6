'use strict';

class Node {
    constructor(value) {
        this.value = value;
        this.name = value.name;
        this.deep = 9999999999999;
        this.connected = [];
    }

    connect(node) {
        if (!(node in this.connected)) {
            this.connected.push(node);
        }
    }

    disconnect(node) {
        if (node in this.connected) {
            this.connected.remove(node);
        }
    }
}

let compareNode = (node1, node2) => {
    if (node1.deep !== node2.deep) {
        return node1.deep > node2.deep;
    }

    return node1.value.name > node2.value.name;
};

module.exports = class {
    constructor(friends, filter) {
        this.nodes = [];
        friends.forEach(friend => {
            this.nodes.push(new Node(friend));
        });
        this.connectNodes();
        this.setDeeps(this.nodes.filter(node => node.value.best), 0, []);
        this.filter(node => filter.func(node.value));
    }

    connectNodes() {
        this.nodes.forEach(node => {
            node.value.friends.forEach(friend => {
                let friendNode = this.getNode(friend);
                if (friendNode !== null) {
                    node.connect(friendNode);
                }
            });
        });
    }

    setDeeps(nodes, deep, visited) {
        if (nodes.length === 0) {
            return;
        }
        let newNodes = [];
        nodes.forEach(node => {
            if (!(node in visited)) {
                visited.push(node);
                if (node.deep > deep) {
                    node.deep = deep;
                    node.connected.forEach(i => {
                        if (!newNodes.includes(i) && !visited.includes(i)) {
                            newNodes.push(i);
                        }
                    });
                }
            }
        });
        this.setDeeps(newNodes, deep + 1, visited);
    }

    getNode(name) {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].value.name === name) {
                return this.nodes[i];
            }
        }

        return null;
    }

    filter(func) {
        this.nodes = this.nodes.filter(func);
        this.nodes.forEach(node => {
            node.connected.forEach(node2 => {
                if (!(node2 in this.nodes)) {
                    node.disconnect(node2);
                }
            });
        });
        this.nodes = this.nodes.sort(compareNode);
    }

    next() {
        return this.nodes.shift().value;
    }
};

