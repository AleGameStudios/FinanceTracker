import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_PROMPT_COUNT_KEY = 'pwa-install-prompt-count';
const INSTALL_PROMPT_DISMISSED_KEY = 'pwa-install-dismissed';
const MAX_PROMPTS = 5;

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    // Check if running as standalone (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Check if we should show the prompt modal
      const promptCount = parseInt(localStorage.getItem(INSTALL_PROMPT_COUNT_KEY) || '0', 10);
      const dismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === 'true';

      // Only show on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (!dismissed && promptCount < MAX_PROMPTS && isMobile) {
        // Delay showing the prompt slightly for better UX
        setTimeout(() => {
          setShouldShowPrompt(true);
        }, 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShouldShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback((permanently: boolean = false) => {
    setShouldShowPrompt(false);

    // Increment the count
    const currentCount = parseInt(localStorage.getItem(INSTALL_PROMPT_COUNT_KEY) || '0', 10);
    localStorage.setItem(INSTALL_PROMPT_COUNT_KEY, String(currentCount + 1));

    if (permanently) {
      localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true');
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    shouldShowPrompt,
    installApp,
    dismissPrompt,
  };
};
