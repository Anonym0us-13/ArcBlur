// Find the original CSS rule
const originalSelector = '.bg-token-main-surface-primary'; // Selector for the original CSS rule
const originalRule = document.querySelector(originalSelector);

// Disable the original CSS rule
if (originalRule) {
    originalRule.style.setProperty('background-color', 'initial'); // Disable original background color
}

// Apply your replacement CSS
const newRule = document.createElement('style');
newRule.textContent = `
    .bg-token-main-surface-primary {
        background-color: rgba(0, 0, 0, 0) !important; /* Replacement CSS rule */
    }
`;
document.head.appendChild(newRule);

// Find the dark mode CSS rule
const darkModeRule = document.querySelector('.dark');

// Apply glow effect to --text-primary
if (darkModeRule) {
    darkModeRule.style.setProperty('--text-primary', 'rgba(236, 236, 236, 1)'); // Set the color with full opacity
    darkModeRule.style.textShadow = '0 0 7.5px rgba(236, 236, 236, 0.5)'; // Apply a subtle glow effect
}

console.log("executed");
