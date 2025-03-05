import { ma_logo } from '../card-logos/card-logos';
import { Logo } from '../logo/logo';

import styles from './footer.module.css';

export interface FooterProps {
  showLogo?: boolean;
}

export const Footer = ({ showLogo }: FooterProps) => {
  return (
    <div className={styles.footer}>
      {showLogo ? <Logo className={styles.logo} /> : null}
      <p className={styles.url}>happyheartsczech.org</p>
      <p className={styles.author}>
        Brought to you by <img src={ma_logo} alt="Mastercard" />
      </p>
    </div>
  );
};
