# 📱 Feed Flow Dashboard

A modern, high-performance RSS feed dashboard built with React and TypeScript, specifically optimized for Romanian news sources. Experience lightning-fast article browsing with enterprise-grade error handling, beautiful UI components, and optimized performance.

![Feed Flow Dashboard Preview](./preview.png)

## ✨ Features

### 🎨 **Modern UI/UX**
- **shadcn/ui Components** - Beautiful, fully accessible UI components built on Radix UI
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile with a mobile-first approach
- **Glassmorphism Effects** - Modern visual effects with backdrop blur and semi-transparent surfaces
- **Smooth Transitions** - Fluid UI interactions and loading states

### 🔍 **Advanced Search & Navigation**
- **Real-time Search** - Instant article search with intelligent debouncing and `Cmd/Ctrl+K` focus shortcut
- **Smart Filtering** - Multi-criteria filtering by feed source, category, and search query
- **Breadcrumb Navigation** - Intuitive navigation showing the current feed or category path
- **Keyboard Shortcuts** - Efficient keyboard navigation for search and common actions
- **Quick Feed Management** - Fast feed detection and validation using multiple CORS proxies

### ⚡ **Performance Optimizations**
- **Hybrid Virtualization** - Uses `@tanstack/react-virtual` for large lists on mobile and optimized grids on desktop
- **Infinite Scrolling** - Seamless article loading with Intersection Observer for an uninterrupted reading experience
- **Intelligent Caching** - Advanced caching strategies with TanStack Query v5 (5min stale time, 30min garbage collection)
- **Lazy Loading** - Granular code splitting and lazy loading for routes and heavy components
- **Asset Compression** - Production builds are compressed using Brotli for minimal bundle sizes
- **Transition API** - Uses React's `useTransition` for responsive filtering and navigation

### 🛡️ **Robust Error Handling**
- **Error Boundaries** - Graceful error recovery for React components preventing full app crashes
- **User-Friendly Messaging** - Centralized error processing with categorized messages (Network, API, Validation)
- **Retry Mechanisms** - Automatic and manual retry for failed network operations
- **Async Wrapper** - Consistent loading/error/empty state patterns across all async operations
- **Network Awareness** - Intelligent handling of connectivity status and focus management

### 🏗️ **Architecture**
- **TypeScript** - 100% type safety with strict configuration
- **TanStack Query v5** - Enterprise-grade server state management
- **Zod & React Hook Form** - Type-safe form validation and management
- **Modular Component Design** - Clean, maintainable architecture following atomic design principles
- **Core Web Vitals** - Integrated performance monitoring via Vercel Speed Insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd feed-flow-dashboard-view
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production with Brotli compression
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview the production build locally

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui primitives (Radix UI based)
│   ├── sidebar/        # Sidebar-specific components
│   ├── ErrorBoundary.tsx     # Global error catching
│   ├── AsyncWrapper.tsx      # Loading/Error/Empty state handler
│   ├── ArticleGrid.tsx       # Main article container with layout switching
│   ├── ArticleGridVirtual.tsx # Virtualized list implementation
│   ├── PageHeader.tsx        # Search, breadcrumbs, and actions
│   ├── AppSidebar.tsx        # Main navigation and feed filtering
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useErrorHandler.ts    # Centralized error handling logic
│   ├── useFeedManager.ts     # RSS feed state and sync logic
│   ├── useFilters.ts         # Filtering and search state
│   ├── useInfiniteArticles.ts # Pagination and data transformation
│   └── ...
├── lib/                # Utilities and core logic
│   ├── rssParser.ts    # Robust RSS parsing with proxy failovers
│   ├── mockData.ts     # Initial Romanian RSS feed sources
│   ├── fetchInitialFeedData.ts # Async data initialization
│   └── utils.ts        # Tailwind merge and common utilities
├── pages/              # Main route components
│   ├── Index.tsx       # Dashboard main view
│   └── NotFound.tsx    # 404 page
├── types/              # TypeScript definitions
│   └── rss.ts          # Core domain models (Article, RSSFeed)
└── App.tsx             # Root component with providers
```

## 🎯 Usage

### RSS Feed Management
- **Initial Feeds**: Pre-configured with top Romanian sources (Recorder, HotNews, Digi24, etc.)
- **Adding Feeds**: Click "Adaugă flux RSS" in the sidebar to add any valid RSS/XML URL
- **CORS Proxy**: Automatically uses multiple proxy services to bypass browser CORS restrictions

### Navigation & Filtering
- **Categories**: Filter articles by Sport, Știri TV, Ziare, or Investigații
- **Search**: Real-time search across titles and descriptions (use `⌘K`)
- **Source Filtering**: Toggle specific feeds on or off from the sidebar

## 🏗️ Tech Stack

- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics & Speed Insights
- **Compression**: Vite Compression (Brotli)

## 📊 Performance Benchmarks

- **Initial Load**: Optimized bundle splitting (react, tanstack, ui chunks)
- **Virtual Scrolling**: Smoothly handles hundreds of articles with minimal DOM node count
- **Caching**: 5-minute stale time prevents redundant network requests
- **Images**: Native lazy loading for article thumbnails

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for Romanian News Readers** 🚀