import type { Dict } from '@/content/types';
import styles from './Footer.module.css';

export function Footer({ dict }: { dict: Dict }) {
  return (
    <footer className={`mono ${styles.footer}`}>
      <span>{dict.footer.copyright}</span>
      <span>{dict.footer.place}</span>
    </footer>
  );
}
