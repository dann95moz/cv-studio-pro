import React from 'react';
import ReactDOM from 'react-dom/client';
import '../i18n/config';
import { App } from './App';
import { ThemeContextProvider } from '../theme/ThemeContext';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeContextProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ThemeContextProvider>
    </React.StrictMode>
  );
}

