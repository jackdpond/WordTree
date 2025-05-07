let tree = [];
let cursorIndex = 0;

function initializeTree() {
    tree = ['_']; // Start with one empty node
    renderTree();
}

function renderTree() {
    const treeContainer = document.querySelector('.tree');
    treeContainer.innerHTML = '';

    tree.forEach((node, index) => {
        const treeNode = document.createElement('div');
        treeNode.classList.add('tree-node');
        treeNode.textContent = node === '_' ? '○' : node;
        if (index === cursorIndex) {
            treeNode.classList.add('cursor');
        }
        treeContainer.appendChild(treeNode);
    });
}

function selectLetter(button) {
    const letter = button.textContent;
    if (!tree.includes(letter)) {
        tree[cursorIndex] = letter;
        button.disabled = true;
        button.textContent = '○';
        moveCursor(1);
        renderTree();
    }
}

function moveCursor(direction) {
    const newIndex = cursorIndex + direction;
    if (newIndex >= 0 && newIndex < tree.length) {
        cursorIndex = newIndex;
        renderTree();
    }
}

function deleteLetter() {
    if (cursorIndex > 0) {
        cursorIndex--;
        tree[cursorIndex] = '_';
        renderTree();
    }
}

window.onload = initializeTree;
