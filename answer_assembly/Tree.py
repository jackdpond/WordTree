import numpy as np
from collections import deque

class Tree:

    def breadth_first(self):
        result = ''
        for char in self.tree.values():
            result += char
        return result

    def pre_order(self):
        word = []
        def traverse(key, tree):
            if key in tree.keys():
                word.append(tree[key])
                traverse((2*key)+1, tree)
                traverse((2*key)+2, tree)
        traverse(0, self.tree)
        return ''.join(word)

    def in_order(self):
        word = []
        def traverse(key, tree):
            if key in tree.keys():
                traverse((2*key)+1, tree)
                word.append(tree[key])
                traverse((2*key)+2, tree)
        traverse(0, self.tree)
        return ''.join(word)

    def post_order(self):
        word = []
        def traverse(key, tree):
            if key not in tree.keys():
                return
            traverse((2*key)+1, tree)
            traverse((2*key)+2, tree)
            word.append(tree[key])
        traverse(0, self.tree)
        return ''.join(word)

    def __init__(self, combo, array):
        tree = {}
        for num, char in zip(array, combo):
            tree[num] = char
        self.tree = tree
        self.breadth_first = self.breadth_first()
        self.pre_order = self.pre_order()
        self.in_order = self.in_order()
        self.post_order = self.post_order()

    def check_tree(self, min, words):
        count = 0
        words_found = {'tree' : self.tree,
                       'solutions' : {}}
        used = []
        for trav in [("breadth first", self.breadth_first), ("pre-order", self.pre_order), ("in-order", self.in_order), ("post-order", self.post_order)]:
            if trav[1] in words and trav not in used:
                count += 1
                used.append(trav[1])
                words_found['solutions'][trav[0]] = trav[1]
        if count >= min:
            return words_found
        else:
            return None
                

    def tree_height(self):
        nodes = list(self.tree.keys())
        max = nodes[-1] + 1
        height = np.floor(np.log2(max))+1
        return int(height)

    def pretty_print_tree(self):
        def num_spaces_for_level(height, level):
            return (2**(height-level-1))-1

        def num_nodes_in_level(level):
            if level == 0:
                return 1
            else:
                return (2 * level)

        def print_spaces(quantity):
            quantity = int(quantity)
            s = ''
            for i in range(quantity):
                s += ' '
            return s

        def get_left(tup, tree):
            node, value = tup
            left_child = (node * 2) + 1
            if left_child in tree.keys():
                print(f'get_left--parent: {tup}, left_child: {left_child}, {tree[left_child]}')
                return (left_child, tree[left_child])
            else:
                return None

        def get_right(tup, tree):
            node, value = tup
            right_child = (node * 2) + 2
            if right_child in tree.keys():
                print(f'get_right--parent: {tup}, right_child: {right_child}, {tree[right_child]}')
                return (right_child, tree[right_child])
            else:
                return None

        result = ''
        traversal = deque()
        traversal.append(list(self.tree.items())[0])
        print(traversal)
        height = self.tree_height()
        print(f'height is {height}')
        for l in range(height):
            spaces_before = num_spaces_for_level(height, l)
            spaces_in_between = (2*spaces_before)+1
            print(f'level: {l}, spaces between: {spaces_in_between}')
            result += print_spaces(spaces_before)

            nodes = num_nodes_in_level(l)
            print(f'nodes: {nodes}')
            print_spaces_before = False
            for ni in range(nodes):
                if print_spaces_before:
                    result += print_spaces(spaces_in_between)
                print_spaces_before = True
                node = traversal.popleft()

                if not node:
                    result += ' '
                    traversal.append(None)
                    traversal.append(None)
                else:
                    spot, value = node
                    result += f'{value}'
                    traversal.append(get_left(node, self.tree))
                    traversal.append(get_right(node, self.tree))
            if (l != height -1):
                result += "\n"
        result += "\n"
        return(result)