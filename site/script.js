// script.js

let currentNode = 1;

const nodes = document.querySelectorAll(".node");
const letters = document.querySelectorAll(".letter");
const nextButton = document.getElementById("next");
const backButton = document.getElementById("back");

// Add letter to the current node
letters.forEach(letter => {
    letter.addEventListener("click", () => {
        nodes[currentNode - 1].textContent = letter.textContent;
        letter.disabled = true;
        nodes[currentNode - 1].classList.remove("dashed");
        nodes[currentNode - 1].classList.add("filled");
    });
});

// Move to the next node
nextButton.addEventListener("click", () => {
    if (currentNode < nodes.length) {
        currentNode++;
    }
});

// Move to the previous node
backButton.addEventListener("click", () => {
    if (currentNode > 1) {
        currentNode--;
    }
});

// Clear the current node when backspace is pressed
backButton.addEventListener("click", () => {
    nodes[currentNode - 1].textContent = "";
    nodes[currentNode - 1].classList.add("dashed");
    nodes[currentNode - 1].classList.remove("filled");
});
