import styles from './SectionHeading.module.css';

export function SectionHeading({
  index,
  label,
  id,
}: {
  index: string;
  label: string;
  id: string;
}) {
  return (
    <div className={styles.wrap}>
      <span className={`mono ${styles.index}`} aria-hidden="true">
        {index}
      </span>
      <h2 id={id} className={styles.label}>
        {label}
      </h2>
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
