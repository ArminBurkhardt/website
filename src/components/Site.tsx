import type { Locale } from '@/content/types';
import { getDict } from '@/content/site';
import { LatticeProvider } from './Lattice/LatticeContext';
import { Lattice } from './Lattice/Lattice';
import { Chrome } from './Chrome';
import { Hero } from './Hero';
import { Intro } from './Intro';
import { Cv } from './Cv';
import { Projects } from './Projects';
import { Links } from './Links';
import { Footer } from './Footer';
import styles from './Site.module.css';

export function Site({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <LatticeProvider>
      <a className={styles.skip} href="#start">
        {dict.a11y.skipToContent}
      </a>
      <Lattice dict={dict} />
      <Chrome dict={dict} locale={locale} />
      <main>
        <Hero dict={dict} />
        <Intro dict={dict} />
        <Projects dict={dict} locale={locale} />
        <Cv dict={dict} locale={locale} />
        <Links dict={dict} />
      </main>
      <Footer dict={dict} />
    </LatticeProvider>
  );
}
