import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Lang { code: string; label: string; flag: string; }

export const LANGUAGES: Lang[] = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'ko', label: '한국어',      flag: '🇰🇷' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
];

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: LANGUAGES[0],
      setLang: (lang) => set({ lang }),
    }),
    { name: 'site-lang-v1' }
  )
);

// Google Translate widget injection
export function injectGoogleTranslate(langCode: string) {
  if (langCode === 'en') {
    // Reset to English
    const iframe = document.querySelector<HTMLIFrameElement>('.goog-te-banner-frame');
    if (iframe) {
      const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const restoreBtn = innerDoc?.querySelector<HTMLElement>('.goog-te-button button');
      restoreBtn?.click();
    }
    // Remove cookie and reload for clean reset
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
    if ((window as any)._gtOriginalLang && (window as any)._gtOriginalLang !== 'en') {
      (window as any)._gtOriginalLang = 'en';
      window.location.reload();
    }
    return;
  }
  
  // Set cookie for Google Translate
  const cookieVal = `/en/${langCode}`;
  document.cookie = `googtrans=${cookieVal};path=/`;
  document.cookie = `googtrans=${cookieVal};path=/;domain=${window.location.hostname}`;
  (window as any)._gtOriginalLang = langCode;
  
  // Try the translate element if loaded
  if ((window as any).google?.translate?.TranslateElement) {
    const el = (window as any).google.translate.TranslateElement;
    if (el.getInstance) {
      try { el.getInstance().showBanner(false); } catch {}
    }
  }
  
  // Trigger select element in Google Translate widget
  const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  } else {
    // Widget not loaded yet, reload with cookie
    window.location.reload();
  }
}
