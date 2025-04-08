
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set up error boundary for better error reporting
const renderApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found!");
      return;
    }
    
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render application:", error);
    // Display a fallback UI if rendering fails
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Application Error</h2>
          <p>Sorry, the application failed to load. Please refresh the page or contact support.</p>
          <pre style="text-align: left; background: #f8f8f8; padding: 10px; border-radius: 4px; overflow: auto;">
            ${error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      `;
    }
  }
};

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise rejection:', event.reason);
});

renderApp();
