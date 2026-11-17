'use client';

import { useEffect } from 'react';

type TawkAPI = {
  showWidget?: () => void;
  hideWidget?: () => void;
  onLoad?: () => void;
  [key: string]: unknown;
};

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
    Tawk_LoadStart?: Date;
  }
}

export default function Tawkto() {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    const api = window.Tawk_API;

    if (api.showWidget) {
      // Script already loaded earlier (user came back to the homepage)
      api.showWidget();
    } else {
      // Not loaded yet: show it as soon as it finishes loading
      api.onLoad = () => api.showWidget?.();

      if (!document.getElementById('tawkto-script')) {
        window.Tawk_LoadStart = new Date();

        const s1 = document.createElement('script');
        s1.id = 'tawkto-script';
        s1.async = true;
        s1.src = 'https://embed.tawk.to/68b32f0b2130651914441d5a/1j3tuvi63';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        document.body.appendChild(s1);
      }
    }

    return () => {
      const current = window.Tawk_API;
      if (!current) return;

      if (current.hideWidget) {
        current.hideWidget();
      } else {
        // Left the homepage before the widget finished loading
        current.onLoad = () => current.hideWidget?.();
      }
    };
  }, []);

  return null;
}