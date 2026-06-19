const DEFAULT_CATEGORY = "Altele";

// Generate dummy feeds
const feeds = [];
const numFeeds = 10000;
const numCategories = 100;
for (let i = 0; i < numFeeds; i++) {
    feeds.push({
        id: `feed-${i}`,
        category: `Category-${i % numCategories}`
    });
}

function runOld() {
    const feedsByCategory = feeds.reduce((acc, feed) => {
        const category = feed.category ?? DEFAULT_CATEGORY;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(feed);
        return acc;
    }, {});

    const ordered = [];
    const seen = new Set();
    feeds.forEach((feed) => {
        const category = feed.category ?? DEFAULT_CATEGORY;
        if (!seen.has(category)) {
            seen.add(category);
            ordered.push(category);
        }
    });

    return { feedsByCategory, categories: ordered };
}

function runNew() {
    const categoriesList = [];
    const feedsMap = {};

    for (let i = 0; i < feeds.length; i++) {
        const feed = feeds[i];
        const category = feed.category ?? DEFAULT_CATEGORY;
        if (!feedsMap[category]) {
            feedsMap[category] = [];
            categoriesList.push(category);
        }
        feedsMap[category].push(feed);
    }

    return { feedsByCategory: feedsMap, categories: categoriesList };
}

// Warmup
for (let i = 0; i < 100; i++) {
    runOld();
    runNew();
}

const iterations = 1000;

let oldStart = performance.now();
for (let i = 0; i < iterations; i++) {
    runOld();
}
let oldEnd = performance.now();
const oldTime = oldEnd - oldStart;

let newStart = performance.now();
for (let i = 0; i < iterations; i++) {
    runNew();
}
let newEnd = performance.now();
const newTime = newEnd - newStart;

console.log(`Baseline (old): ${oldTime.toFixed(2)} ms`);
console.log(`Optimized (new): ${newTime.toFixed(2)} ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
