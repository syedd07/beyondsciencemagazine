// Logo @ start of PWA!
// Show loading screen
document.body.classList.add('loading');

// Simulate loading delay (e.g., fetching content)
setTimeout(() => {
    // Hide loading screen
    document.body.classList.remove('loading');
}, 4000);
const startTime = performance.now();
		