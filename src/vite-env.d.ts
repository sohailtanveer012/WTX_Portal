/// <reference types="vite/client" />

// Service Worker types
interface Window {
  navigator: Navigator & {
    serviceWorker?: ServiceWorkerContainer;
  };
}
