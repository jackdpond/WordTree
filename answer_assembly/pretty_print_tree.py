import numpy as np
from collections import deque


def tree_height(tree):
    nodes = list(tree.keys())
    max = nodes[-1] + 1
    height = np.floor(np.log2(max))+1
    return int(height)


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
        return (left_child, tree[left_child])
    else:
        return None
    

def get_right(tup, tree):
    node, value = tup
    right_child = (node * 2) + 2
    if right_child in tree.keys():
        return (right_child, tree[right_child])
    else:
        return None


def pretty_print_tree(tree):
    result = ''
    traversal = deque()
    traversal.append(list(tree.items())[0])
    height = tree_height(tree)
    
    for l in range(height):
        spaces_before = num_spaces_for_level(height, l)
        spaces_in_between = (2*spaces_before)+1
        result += print_spaces(spaces_before)

        nodes = num_nodes_in_level(l)
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
                traversal.append(get_left(node, tree))
                traversal.append(get_right(node, tree))
        if (l != height -1):
            result += "\n"
    result += "\n"
    return result