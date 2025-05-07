// script.js

const MAX_LEVELS = 5;
const MAX_NODES = Math.pow(2, MAX_LEVELS) - 1; // 31 nodes for 5 levels
let tree = Array(7).fill(""); // Start with 3 levels (7 nodes)
let cursor = 0; // index in tree array

const svg = document.querySelector(".tree-svg");
const letters = document.querySelectorAll(".letter");
const nextButton = document.getElementById("next");
const backButton = document.getElementById("back");

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
        const isCursor = i === cursor;
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
    return Array.from(letters).filter(l => l.disabled).length;
}

function maxLetters() {
    return letters.length;
}

// On initial load, ensure cursor is at the first viable empty node
function setInitialCursor() {
    const initial = findNextViableEmpty(0);
    if (initial !== -1) cursor = initial;
}

setInitialCursor();
drawTree();

letters.forEach(letter => {
    letter.addEventListener("click", () => {
        if (!tree[cursor]) {
            tree[cursor] = letter.textContent;
            letter.disabled = true;
            // Only move cursor if not all letters are used
            if (countFilledLetters() < maxLetters()) {
                const next = findNextViableEmpty(cursor + 1);
                if (next !== -1) cursor = next;
            }
            drawTree();
        }
    });
});

nextButton.addEventListener("click", () => {
    // Only move cursor if not all letters are used
    if (countFilledLetters() < maxLetters()) {
        const next = findNextViableEmpty(cursor + 1);
        if (next !== -1) cursor = next;
        drawTree();
    }
});

backButton.addEventListener("click", () => {
    // Move to previous filled node and delete it
    let prev = cursor - 1;
    while (prev >= 0 && (!tree[prev] || !isViableNode(prev))) prev--;
    if (prev >= 0) {
        // Re-enable letter in bank
        const letter = tree[prev];
        tree[prev] = "";
        letters.forEach(btn => {
            if (btn.textContent === letter && btn.disabled) {
                btn.disabled = false;
                return false;
            }
        });
        cursor = prev;
        drawTree();
    }
});
