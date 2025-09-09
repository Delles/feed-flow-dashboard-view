import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * Application entry point.
 *
 * Initializes the React application with:
 * - Modern React 18 createRoot API
 * - Global CSS imports (Tailwind + custom styles)
 * - Optimized rendering with strict mode
 */
createRoot(document.getElementById("root")!).render(<App />);
