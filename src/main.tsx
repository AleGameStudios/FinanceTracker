import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Force clear old service workers and caches (version 1.1.0 nuclear update)
const FORCE_UPDATE_VERSION = '1.1.0'
const FORCE_UPDATE_KEY = 'pwa-force-update-version'

async function forceServiceWorkerUpdate() {
  const lastForceUpdate = localStorage.getItem(FORCE_UPDATE_KEY)

  if (lastForceUpdate !== FORCE_UPDATE_VERSION) {
    console.log('Force updating service worker...')

    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('Unregistered service worker:', registration.scope)
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName)
        console.log('Deleted cache:', cacheName)
      }
    }

    // Mark as updated
    localStorage.setItem(FORCE_UPDATE_KEY, FORCE_UPDATE_VERSION)

    // Reload to get fresh content
    console.log('Force update complete, reloading...')
    window.location.reload()
    return
  }
}

// Run force update check
forceServiceWorkerUpdate()

// Register service worker
registerSW({
  onNeedRefresh() {
    // Auto-reload without asking
    window.location.reload()
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
