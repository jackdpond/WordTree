// script.js

const MAX_LEVELS = 7;
const MAX_NODES = Math.pow(2, MAX_LEVELS) - 1; // 127 nodes for 7 levels
let tree = Array(7).fill(""); // Start with 3 levels (7 nodes)
let cursor = 0; // index in tree array

const svg = document.querySelector(".tree-svg");
const letters = document.querySelectorAll(".letter");
const nextButton = document.getElementById("next");
const backButton = document.getElementById("back");
const resetButton = document.getElementById("reset");

// Add a div for displaying found words
let wordDisplay = document.createElement('div');
wordDisplay.className = 'word-display';
document.querySelector('.game-container').appendChild(wordDisplay);

let solutions = null;
let currentWord = null;

async function loadRandomWord() {
    try {
        const response = await fetch('/api/random-word');
        const data = await response.json();
        solutions = data;
        currentWord = data.word;
        
        // Update letter bank with the new word's letters
        const letterBank = document.querySelector('.letter-bank');
        letterBank.innerHTML = ''; // Clear existing letters
        
        // Add letters from the word
        [...currentWord].forEach(letter => {
            const button = document.createElement('button');
            button.className = 'letter';
            button.textContent = letter;
            letterBank.appendChild(button);
        });
        
        // Add control buttons
        const controls = ['next', 'back', 'reset'];
        controls.forEach(id => {
            const button = document.createElement('button');
            button.className = 'control';
            button.id = id;
            button.innerHTML = id === 'next' ? '&#8594;' : id === 'back' ? '&#8592;' : '&#8635;';
            letterBank.appendChild(button);
        });
        
        // Reset game state
        tree = Array(7).fill("");
        cursor = 0;
        isAnimating = false;
        isComplete = false;
        setInitialCursor();
        drawTree();
        
        // Clear word display
        wordDisplay.innerHTML = '';

        // Reattach event listeners to the new buttons
        attachEventListeners();
    } catch (error) {
        console.error('Error loading random word:', error);
    }
}

function attachEventListeners() {
    // Get fresh references to the elements
    const letters = document.querySelectorAll('.letter');
    const nextButton = document.getElementById('next');
    const backButton = document.getElementById('back');
    const resetButton = document.getElementById('reset');

    // Remove any existing event listeners
    letters.forEach(letter => {
        letter.replaceWith(letter.cloneNode(true));
    });
    nextButton.replaceWith(nextButton.cloneNode(true));
    backButton.replaceWith(backButton.cloneNode(true));
    resetButton.replaceWith(resetButton.cloneNode(true));

    // Get fresh references after cloning
    const newLetters = document.querySelectorAll('.letter');
    const newNextButton = document.getElementById('next');
    const newBackButton = document.getElementById('back');
    const newResetButton = document.getElementById('reset');

    // Add click handlers for letters
    newLetters.forEach(letter => {
        letter.addEventListener("click", () => {
            if (!tree[cursor]) {
                tree[cursor] = letter.textContent.toLowerCase();
                letter.disabled = true;
                // Only move cursor if not all letters are used
                if (countFilledLetters() < maxLetters()) {
                    const next = findNextViableEmpty(cursor + 1);
                    if (next !== -1) cursor = next;
                }
                drawTree();
                tryCheckAfterInput();
            }
        });
    });

    // Add click handlers for control buttons
    newNextButton.addEventListener("click", () => {
        // Only move cursor if not all letters are used
        if (countFilledLetters() < maxLetters()) {
            const next = findNextViableEmpty(cursor + 1);
            if (next !== -1) cursor = next;
            drawTree();
        }
    });

    newBackButton.addEventListener("click", () => {
        // Always clear the current node (if it has a letter)
        if (tree[cursor]) {
            const letter = tree[cursor];
            tree[cursor] = "";
            // Only re-enable the first matching disabled letter in the bank
            let found = false;
            newLetters.forEach(btn => {
                if (!found && btn.textContent === letter && btn.disabled) {
                    btn.disabled = false;
                    found = true;
                }
            });
        }
        // Move cursor to previous viable node (regardless of whether it is filled)
        let prev = cursor - 1;
        while (prev >= 0 && !isViableNode(prev)) prev--;
        cursor = prev >= 0 ? prev : 0;
        drawTree();
    });

    newResetButton.addEventListener("click", () => {
        tree = [""];
        cursor = 0;
        isComplete = false;
        drawTree();
        wordDisplay.innerHTML = '';
        newLetters.forEach(btn => btn.disabled = false);
    });
}

// Load a random word when the page loads
loadRandomWord();

let isAnimating = false;
let isComplete = false;

function getLevel(index) {
    return Math.floor(Math.log2(index + 1));
}

function getMaxLevel() {
    let max = 0;
    for (let i = tree.length - 1; i >= 0; i--) {
        if (tree[i] || i === cursor) {
            max = Math.max(max, getLevel(i));
        }
    }
    return Math.max(max, 2); // At least 3 levels to start
}

function getNodePositions() {
    // Dynamically calculate node positions for current tree size and max level
    const positions = [];
    const width = 900;
    const height = 400;
    const maxLevel = getMaxLevel();
    for (let i = 0; i < tree.length; i++) {
        const level = getLevel(i);
        const nodesInLevel = Math.pow(2, level);
        const indexInLevel = i - (nodesInLevel - 1);
        const y = 60 + (height - 120) * (level / (maxLevel));
        const x = (width / (nodesInLevel + 1)) * (indexInLevel + 1);
        positions.push({ x, y });
    }
    return positions;
}

function isNodeVisible(i) {
    // Node is visible if it has a letter or is the cursor
    return tree[i] || i === cursor;
}

function getVisibleNodeBounds(nodePositions) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < tree.length; i++) {
        if (!isNodeVisible(i)) continue;
        const { x, y } = nodePositions[i];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    return { minX, maxX, minY, maxY };
}

function drawTree() {
    const nodePositions = getNodePositions();
    const bounds = getVisibleNodeBounds(nodePositions);
    // Add padding
    const pad = 60;
    const width = bounds.maxX - bounds.minX + pad * 2;
    const height = bounds.maxY - bounds.minY + pad * 2;
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `${bounds.minX - pad} ${bounds.minY - pad} ${width} ${height}`);
    svg.innerHTML = "";
    // Draw lines only between visible parent and visible child
    for (let i = 0; i < tree.length; i++) {
        if (!isNodeVisible(i)) continue;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < tree.length && isNodeVisible(left)) {
            svg.innerHTML += `<line class=\"line\" x1=\"${nodePositions[i].x}\" y1=\"${nodePositions[i].y}\" x2=\"${nodePositions[left].x}\" y2=\"${nodePositions[left].y}\" />`;
        }
        if (right < tree.length && isNodeVisible(right)) {
            svg.innerHTML += `<line class=\"line\" x1=\"${nodePositions[i].x}\" y1=\"${nodePositions[i].y}\" x2=\"${nodePositions[right].x}\" y2=\"${nodePositions[right].y}\" />`;
        }
    }
    // Draw only visible nodes
    for (let i = 0; i < tree.length; i++) {
        if (!isNodeVisible(i)) continue;
        const isCursor = i === cursor && !isAnimating && !isComplete;
        svg.innerHTML += `
            <g>
                <circle class=\"node-circle${isCursor ? ' cursor-node' : ''}\" cx=\"${nodePositions[i].x}\" cy=\"${nodePositions[i].y}\" r=\"36\" />
                <text class=\"node-label\" x=\"${nodePositions[i].x}\" y=\"${nodePositions[i].y}\">${tree[i]}</text>
            </g>
        `;
    }
}

drawTree();

function isViableNode(i) {
    if (i === 0) return true; // root
    const parent = Math.floor((i - 1) / 2);
    return !!tree[parent];
}

function findNextViableEmpty(start = 0) {
    // Try to find a viable empty node in the current tree
    for (let i = start; i < tree.length; i++) {
        if (!tree[i] && isViableNode(i)) return i;
    }
    // If not found and we can expand, expand the tree and try again
    if (tree.length < MAX_NODES) {
        const newLength = Math.min(tree.length * 2 + 1, MAX_NODES);
        tree = tree.concat(Array(newLength - tree.length).fill(""));
        // Only check the new nodes for viability
        for (let i = start; i < tree.length; i++) {
            if (!tree[i] && isViableNode(i)) return i;
        }
    }
    return -1;
}

function countFilledLetters() {
    return tree.filter(letter => letter !== "").length;
}

function maxLetters() {
    return currentWord ? currentWord.length : 0;
}

// On initial load, ensure cursor is at the first viable empty node
function setInitialCursor() {
    const initial = findNextViableEmpty(0);
    if (initial !== -1) cursor = initial;
}

setInitialCursor();
drawTree();

function arraysMatchTree(treeObj) {
    for (const idx in treeObj) {
        if (tree[+idx] !== treeObj[idx]) {
            console.log('Mismatch at', idx, ':', tree[+idx], '!==', treeObj[idx]);
            return false;
        }
    }
    return true;
}

function getTraversalIndices(type, n = tree.length) {
    // Returns array of indices in traversal order for current tree
    let indices = [];
    function inOrder(i) {
        if (i >= n || !isNodeVisible(i)) return;
        inOrder(2*i+1);
        indices.push(i);
        inOrder(2*i+2);
    }
    function preOrder(i) {
        if (i >= n || !isNodeVisible(i)) return;
        indices.push(i);
        preOrder(2*i+1);
        preOrder(2*i+2);
    }
    function postOrder(i) {
        if (i >= n || !isNodeVisible(i)) return;
        postOrder(2*i+1);
        postOrder(2*i+2);
        indices.push(i);
    }
    function breadthFirst() {
        let q = [0];
        while (q.length) {
            let i = q.shift();
            if (i >= n || !isNodeVisible(i)) continue;
            indices.push(i);
            q.push(2*i+1, 2*i+2);
        }
    }
    if (type === 'in-order') inOrder(0);
    else if (type === 'pre-order') preOrder(0);
    else if (type === 'post-order') postOrder(0);
    else if (type === 'breadth-first') breadthFirst();
    return indices;
}

async function animateTraversal(indices, color = '#4caf50', delay = 400) {
    console.log('Starting traversal animation:', {indices, color, delay});
    const nodePositions = getNodePositions();
    let visited = new Set();
    
    for (let i = 0; i < indices.length; i++) {
        console.log('Animation step:', i);
        drawTree();
        // Draw all previously visited nodes in color
        const svgNS = svg.namespaceURI;
        visited.forEach(idx => {
            let circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', nodePositions[idx].x);
            circle.setAttribute('cy', nodePositions[idx].y);
            circle.setAttribute('r', 36);
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
            let text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', nodePositions[idx].x);
            text.setAttribute('y', nodePositions[idx].y);
            text.setAttribute('class', 'node-label');
            text.textContent = tree[idx];
            svg.appendChild(text);
        });
        
        // Animate the current node
        let idx = indices[i];
        if (!visited.has(idx)) {
            let circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', nodePositions[idx].x);
            circle.setAttribute('cy', nodePositions[idx].y);
            circle.setAttribute('r', 36);
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
            let text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', nodePositions[idx].x);
            text.setAttribute('y', nodePositions[idx].y);
            text.setAttribute('class', 'node-label');
            text.textContent = tree[idx];
            svg.appendChild(text);
        }
        visited.add(idx);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.log('Traversal animation complete');
    // After the traversal, reset all node colors
    drawTree();
}

function tryCheckAfterInput() {
    const state = {
        filledLetters: countFilledLetters(),
        maxLetters: maxLetters(),
        isAnimating,
        isComplete,
        currentTree: [...tree]
    };
    console.log('Checking after input:', JSON.stringify(state, null, 2));
    
    if (countFilledLetters() === maxLetters()) {
        console.log('All letters filled, starting animation');
        isAnimating = true;
        isComplete = true;
        drawTree(); // Remove cursor highlight immediately
        checkAndAnimateSolution();
    }
}

async function checkAndAnimateSolution() {
    console.log('Starting solution check with solutions:', JSON.stringify(solutions, null, 2));
    
    if (!solutions) {
        console.error('No solutions loaded');
        return;
    }

    let found = [];
    console.log('Current tree state:', JSON.stringify(tree, null, 2));
    
    for (const solution of solutions.solutions) {
        console.log('Checking solution:', JSON.stringify(solution, null, 2));
        if (arraysMatchTree(solution.tree)) {
            console.log('Found matching solution:', JSON.stringify(solution, null, 2));
            for (const [traversal, word] of Object.entries(solution.traversals)) {
                const indices = getTraversalIndices(traversal);
                found.push({word, traversal, indices});
            }
        }
    }

    console.log('Found solutions:', JSON.stringify(found, null, 2));

    if (found.length) {
        wordDisplay.innerHTML = '';
        for (const {word, traversal, indices} of found) {
            console.log('Animating solution:', JSON.stringify({word, traversal, indices}, null, 2));
            await animateTraversal(indices, '#4caf50', 400);
            wordDisplay.innerHTML += `<div><b>${word}</b> (${traversal})</div>`;
        }
    } else {
        console.log('No solutions found, showing all traversals');
        // Animate all four traversals in red, showing the word after each
        const traversals = ['pre-order', 'in-order', 'post-order', 'breadth-first'];
        wordDisplay.innerHTML = '';
        for (const traversal of traversals) {
            const indices = getTraversalIndices(traversal);
            let word = indices.map(i => tree[i] || '').join('');
            console.log('Animating traversal:', JSON.stringify({traversal, word, indices}, null, 2));
            await animateTraversal(indices, '#c00', 250);
            wordDisplay.innerHTML += `<div style="color:#c00"><b>${word}</b> (${traversal})</div>`;
        }
    }
    
    isAnimating = false;
    drawTree();
}
