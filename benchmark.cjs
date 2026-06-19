const { performance } = require('perf_hooks');

const DEFAULT_CATEGORY = "Altele";

function generateFeeds(count) {
    const categories = ["Sport", "News", "Tech", "Entertainment", null];
    const feeds = [];
    for (let i = 0; i < count; i++) {
        feeds.push({
            id: `feed-${i}`,
            category: categories[i % categories.length]
        });
    }
    return feeds;
}

const feeds = generateFeeds(100000);

// Baseline implementation
function baseline() {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        const feedsByCategory = feeds.reduce((acc, feed) => {
            const category = feed.category ?? DEFAULT_CATEGORY;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(feed);
            return acc;
        }, {});

        const categories = (() => {
            const ordered = [];
            const seen = new Set();
            feeds.forEach((feed) => {
                const category = feed.category ?? DEFAULT_CATEGORY;
                if (!seen.has(category)) {
                    seen.add(category);
                    ordered.push(category);
                }
            });
            return ordered;
        })();
    }
    return performance.now() - start;
}

// Optimized implementation
function optimized() {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        const acc = {};
        const ordered = [];

        for (let j = 0; j < feeds.length; j++) {
            const feed = feeds[j];
            const category = feed.category ?? DEFAULT_CATEGORY;
            if (!acc[category]) {
                acc[category] = [];
                ordered.push(category);
            }
            acc[category].push(feed);
        }
    }
    return performance.now() - start;
}

// Warmup
baseline();
optimized();

const baselineTime = baseline();
const optimizedTime = optimized();

console.log(`Baseline time: ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
