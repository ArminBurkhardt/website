import { Instrument_Sans, Azeret_Mono } from 'next/font/google';
import { DEFAULT_THEME } from '@/config/site';
import './globals.css';

const sans = Instrument_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

// Carries every eyebrow, section index, year, status and chip - see `.mono` in globals.css.
const mono = Azeret_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'||t==='dark'?t:'${DEFAULT_THEME}');}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`;

export function Shell({ lang, children }: { lang: 'de' | 'en'; children: React.ReactNode }) {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
