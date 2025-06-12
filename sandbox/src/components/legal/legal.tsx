import { useContext } from 'preact/hooks';
import styles from './legal.module.css';
import { Translations } from '../../context';

export const Legal = () => {
  const t = useContext(Translations);
  return (
  <p className={styles.legal} dangerouslySetInnerHTML={{ __html: t('legal') }} />
)};
