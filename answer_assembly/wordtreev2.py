import itertools
from collections import defaultdict
import json
from answer_assembly.pretty_print_tree import pretty_print_tree
import argparse
import numpy as np
from time import time

def get_permutations(s):
    permutations = itertools.permutations(s)
    return [''.join(p) for p in permutations]


def readlines(filename):
    with open(filename, 'r') as file:
        lines = file.readlines()
    return lines


def assemble(filename, n=2):
    lines = readlines(filename)
    new_lines = []
    for line in lines:
        new_lines.append(line.rstrip('\n'))
    lines = new_lines

    sets = []
    for word in lines:
        short = [word]
        for combo in get_permutations(word):
            if combo in lines and combo != word:
                short.append(combo)
                lines.remove(combo)
        sets.append(short)

    new_sets = []
    for set in sets:
        if len(set) >= n:
            new_sets.append(set)

    return new_sets


def get_trees(root = [0], n = 0, max = 6):
    trees = []
    
    def generate(root, n, max):
        # if n >= max -1:
        #     return None
        # if root[-1] >= (2**max)-1:
        #     return None
        if len(root) == max:
            trees.append(root)
            return None
        if len(root) > max:
            return None
        if n >= len(root):
            return None
        
        left = (root[n] * 2) + 1
        lefter = root + [left]
        right = (root[n] * 2) + 2
        righter = root + [right]
        doubler = lefter + [right]
        
        generate(lefter, n+1, max)
        generate(righter, n+1, max)
        generate(doubler, n+1, max)
        generate(root, n+1, max)

    generate(root, n, max)

    return trees


def breadth_first(tree):
    result = ''
    for char in tree.values():
        result += char
    return result

def pre_order(tree):
    word = []
    def traverse(key, tree):
        if key in tree.keys():
            word.append(tree[key])
            traverse((2*key)+1, tree)
            traverse((2*key)+2, tree)
    traverse(0, tree)
    return ''.join(word)

def in_order(tree):
    word = []
    def traverse(key, tree):
        if key in tree.keys():
            traverse((2*key)+1, tree)
            word.append(tree[key])
            traverse((2*key)+2, tree)
    traverse(0, tree)
    return ''.join(word)

def post_order(tree):
    word = []
    def traverse(key, tree):
        if key not in tree.keys():
            return
        traverse((2*key)+1, tree)
        traverse((2*key)+2, tree)
        word.append(tree[key])
    traverse(0, tree)
    return ''.join(word)

def find_words(n):
    mapper = {4:'four', 5:'five', 6:'six', 7:'seven', 8:'eight'}
    num = mapper[n]
    with open(f'../resources/words_{num}.txt', 'r') as file:
        words = file.read().split()
    return words

def make_tree(combo, array):
    tree = {}
    for num, char in zip(array, combo):
        tree[num] = char
    return tree


def check_tree(tree, n, words):
    #words = find_words(len(combo))
    #tree = make_tree(combo, array)
    count = 0
    used = []
    checker = {"pre-order": pre_order,
               "in-order": in_order,
               "post-order": post_order,
               "breadth-first": breadth_first}
    traversals = {}
    for key in checker.keys():
        word = checker[key](tree)
        if word in words and word not in used:
            used.append(word)
            traversals[key] = word
            count += 1
    if count >= n:
        return (("tree", tree2tuple(tree)), ("traversals", tree2tuple(traversals)))
    else:
        return None


def tree2tuple(tree):
    tup = tuple(list(tree.items()))
    return tup

def tuple2tree(trees):
    solutions = []
    for tree in trees:
        solutions.append(dict(tree))
    return solutions

def tuple2entry(tup):
    solutions = []
    for entry in tup:
        solution = dict(entry)
        solution['tree'] = dict(solution['tree'])
        solution['traversals'] = dict(solution['traversals'])
        solutions.append(solution)
    return solutions

    

def check_word(s,n, solutions, words, trees):
    combos = get_permutations(s)
    good_words = set()
    entry_set = set()
    for combo in combos:
        for t in trees:
            tree = make_tree(combo, t)
            result = check_tree(tree, n, words)
            if result: 
                entry_set.add(result)
                gooders = []
                for value in result[1][1]:
                    gooders.append(value[1])
                good_words.update(gooders)
    results = tuple2entry(entry_set)
    solutions[tuple(good_words)] = results


def get_solutions(n, words, trees):
    solutions = defaultdict(list)
    for combo in words:
        s = combo[0]
        check_word(s, n , solutions, words = combo, trees = trees)
    return solutions


def tuple2string(tup):
    i = 0
    s = ''
    for item in tup:
        if i > 0:
            s += '/'
        s+=item
        i+=1
    return s

def solutions2json(solutions):
    nsolutions = {}
    for key, value in solutions.items():
        nsolutions[tuple2string(key)] = value
    
    with open(args.output_file, 'w') as json_file:
        json.dump(nsolutions, json_file, indent=4)
    
def str2int(tree):
    ntree = {}
    for key, value in tree.items():
        ntree[int(key)] = value
    return ntree

def solve(word, trees=True):
    with open(args.solutions, 'r') as file:
        solutions = json.load(file)

    result = {}
    for key, value in solutions.items():
        if word in key:
            result[key] = value

    if result:
        for key, value in result.items():
            print(f"solved anagrams: {key}")
            print("List of possible trees:")
            for item in value:
                if trees:
                    nitem = str2int(item["tree"])
                    print(pretty_print_tree(nitem))
                    print('-'*50)
                else:
                    print(item)
    else:
        print(f"No solutions found for word '{word}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_file", type=str)
    parser.add_argument("--output_file", type=str)
    parser.add_argument("--min_combo", type=int, default=2)
    parser.add_argument("--solve", type = str, default=None)
    parser.add_argument("--solutions", type = str)
    args = parser.parse_args()

    if args.solve:
        solve(args.solve, args.solutions)

    else:
        start_time = time()
        words = assemble(args.input_file)
        print(f'assemble time: {round(time()-start_time, 1)}')
        assemble_time = time()
        trees = get_trees([0], 0, max = 8)
        print(f'get trees time: {round(time()-assemble_time, 1)}')
        tree_time = time()
        solutions = get_solutions(args.min_combo, words, trees)
        print(f'get solutioins time: {round(time()-tree_time, 1)}')

        solutions2json(solutions)
        print(f'total time: {round(time() - start_time, 1)}')

