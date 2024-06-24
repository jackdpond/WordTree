# WordTree
A new word game involving binary trees, anagrams, and tree traversals. This repo contains the code used to find all possible solutions for words within a given bank of words of the same length.

# WordTree: The guide

## trees: 
A tree is a kind of graph or diagram. It is a set of nodes with connections. It is hierarchical: A tree has levels. The one rule for a tree is that it may have however many children, but only one parent. A node cannot share children with another node. The following is a tree:

                      1
                     / \
                    2   3
                   /   / \
                  4   5   6

The following is not a tree:

                    1   2
                     \ /
                      3   4
                       \ / \
                        5   6
                             \
                              7

This is not a tree because the 3 node and the 5 node both have two parents.

In this game, we will add an additional restraint. We will only consider binary trees, which have the additional rule that a node may only have two children. The first example above is a binary tree since each node has 2 children or less.

## Traversals
There are four tree traversals that are key to play the game: 

### Breadth First
     This is the simplest traversal. Simply take the first layer of the tree, then the second, then the third, and so on, always from left to right.
     For this tree:

                      1
                     / \
                    2   3
                   /   / \
                  4   5   6

     The breadth first traversal would be 1-2-3-4-5-6.

### Pre-Order
     Pre-Order is the first of the ‘depth first’ searches. It is a recursive traversal, meaning that the traverser uses the same rule in a nested fashion—or the rule contains an application of itself. The rule is: print a node, then apply the rule to the left child, then apply the rule to the right child. If a node doesn’t have a left child, move the right. If it doesn’t have a right child, then that branch of the algorithm is done and you can move on to a right child higher up or finish.

     For this tree:
                      1
                     / \
                    2   3
                   /   / \
                  4   5   6

     The pre-order traversal would be 1-2-4-3-5-6.

### In-Order Traversal
     This traversal is similar to pre-order, but in a different order. First, apply the rule to the left child of the node, then print the node, then apply the rule to the right child of the node. If a node does not have a left child, print the node then move on to the right child. If a node doesn’t have a right child, then that branch of the algorithm is done and you can move on to a right child node up the tree, or finish.
     
     For this tree:
                      1
                     / \
                    2   3
                   /   / \
                  4   5   6

     The In-Order traversal is 4-2-1-5-3-6. 

##### A note
     this traversal is called ‘In Order’ because when used on a binary *search* tree—a binary tree with an additional rule—this traversal prints the nodes in sorted order.

### Post-Order
     The last traversal is also similar to the previous two, with a predictable tweak. Apply the rule to the left child and the right child before printing the node. This gets a little surprising since all the descendants of a node get printed before it does.

     For this tree:
                      1
                     / \
                    2   3
                   /   / \
                  4   5   6

     The Post-Order traversal is 4-2-1-5-6-3-1.

𝙜𝙖𝙢𝙚 𝙥𝙡𝙖𝙮: The player is given a list of letters, usually in alphabetical order. Their goal is to arrange the letters in a binary tree so that different traversals yield different valid words. For sets of four or five letters, it is sometimes possible (rarely) to arrange a tree so that three traversals yield three different valid words. Such a tree is worth more points than a tree that only yields two words. 
     For example: 
     letters: ADEELPS
     these may be arranged like so:
                         p
                        / \
                       l   s
                      / \   \
                     e   a   e
                              \
                               d
     pre-order: pleased
     in-order: elapsed
     
     This is one tree the player could make but not the only one! The more trees made, the more points.

your challenges:
1. AEFST
2. APRST
3. OPSST
4. EIMRT
5. AEMNS
6. AELRT
7. CEEPTX
8. EHORSS
9. EORRST
10. ACDEILM
11. AEENRST