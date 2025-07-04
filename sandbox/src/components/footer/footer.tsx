import { useContext } from 'preact/hooks';
import { Translations } from '../../context';
import { ma_logo } from '../card-logos/card-logos';
import { Logo } from '../logo/logo';

import styles from './footer.module.css';

export interface FooterProps {
  showLogo?: boolean;
}

export const Footer = ({ showLogo }: FooterProps) => {
  const t = useContext(Translations);
  return (
    <div className={styles.footer}>
      {showLogo ? <Logo className={styles.logo} /> : null}
      <a href="https://www.happyheartsczech.org/" className={styles.url} target="_blank">happyheartsczech.org</a>
      <p className={styles.author}>
        {t('footer')} <a href="https://www.mastercard.com/" target="_blank"><img src={ma_logo} alt="Mastercard" /></a>
      </p>
    </div>
  );
};
