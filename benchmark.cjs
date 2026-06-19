const { performance } = require('perf_hooks');

const NUM_FEEDS = 10000;
const ITERATIONS = 1000;

const feeds = Array.from({ length: NUM_FEEDS }, (_, i) => ({
    id: `feed_${i}`,
    category: `category_${i % 10}`
}));

const targetId = `feed_${NUM_FEEDS - 1}`; // worst case

// Baseline: array find
let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const feed = feeds.find(f => f.id === targetId);
    if (feed) {
        const cat = feed.category;
    }
}
let end = performance.now();
console.log(`Baseline (Array.find): ${(end - start).toFixed(4)} ms`);

// Map creation
let mapStart = performance.now();
const feedById = new Map();
feeds.forEach(f => feedById.set(f.id, f));
let mapEnd = performance.now();
console.log(`Map creation: ${(mapEnd - mapStart).toFixed(4)} ms`);

// Optimized: map get
start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    const feed = feedById.get(targetId);
    if (feed) {
        const cat = feed.category;
    }
}
end = performance.now();
console.log(`Optimized (Map.get): ${(end - start).toFixed(4)} ms`);
