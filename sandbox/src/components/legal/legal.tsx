import { useContext } from 'preact/hooks';
import { Translations } from '../../context';
import styles from './legal.module.css';

// The copy carries links to the terms and privacy PDFs, so it is rendered as markup.
// The source is our own translation table, never anything the host page supplies.
export const Legal = () => {
  const t = useContext(Translations);
  return (
    <p
      className={styles.legal}
      dangerouslySetInnerHTML={{ __html: t('legal') }}
    />
  );
};
